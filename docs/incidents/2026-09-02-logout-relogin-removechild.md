# ログアウト→再ログイン時のremoveChildエラー調査（PR #27）

## 概要

PR #27（共通レイアウト導入）のマージ前ブラウザ確認で、以下の手順で問題が報告された。

1. ログイン
2. アプリを使用（複数画面を操作）
3. ログアウト
4. 再度ログイン
5. エラーが発生する
6. ブラウザをリロードすると正常に動作する

報告されたコンソールエラー：

```text
:8000/api/auth/me:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)

react-dom-client.development.js:23861
Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.

layout.tsx:22
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

Hydration mismatchの差分には `<html lang="en">` vs `lang="ja"` と、Geist fontのclassName差分が含まれていた。

## 発見方法

Claude Codeによるブラウザ確認は、この環境に `chromium-cli` が存在しなかったため、スクラッチパッドに一時的に Playwright（`chromium` + Node.js）をインストールし、ヘッドレスChromiumでStudyLogのフロントエンド（Docker Compose上の `http://localhost:3000`）を実際に操作するスクリプトを書いて実行する形で行った。

調査は主に以下の3段階で進めた。

1. **再現の試行**：ログイン→画面遷移→ログアウト→リロードせず再ログイン、という操作をPlaywrightで自動化し、`console`/`pageerror`/`response`イベントを収集して再現するかを確認した。
2. **ライフサイクルの可視化**：`(protected)/layout.tsx` に一時的に `console.log` を仕込み（`useEffect` のマウント/アンマウント、認証チェックの実行タイミング）、Reactコンポーネントのマウント・アンマウント順序をPlaywright越しに観測した。調査後、このログは元に戻した。
3. **ネットワークログとバックエンドログの突き合わせ**：ブラウザ側で観測された `net::ERR_ABORTED` を、`docker compose logs backend` の実際のHTTPステータスと突き合わせ、サーバー側では正常（`204 No Content`）に処理されていたことを確認した。

## わかったこと

### ProtectedLayoutのマウント/アンマウントは正常だった

当初「`(protected)/layout.tsx` の `user`/`checked` stateがログアウト後もリセットされずに残っている」という仮説を立てたが、実際にログを仕込んで確認した結果、これは誤りだった。

```text
click logout (header)
[nav] http://localhost:3000/login
[LIFECYCLE] ProtectedLayout instance UNMOUNTED   ← ログアウト時に確実にアンマウント
submit login (re-login)
[nav] http://localhost:3000/dashboard
[LIFECYCLE] ProtectedLayout instance MOUNTED     ← 新しいインスタンスとしてマウント
```

Next.js App Routerのroute group（`(protected)`）は想定通りに機能しており、`/login`（route group外）への遷移で対象レイアウトは確実にアンマウントされていた。この点はユーザーからの指摘で確認し、最初の仮説を撤回した。

### 開発モード起動によるReact Strict Modeの二重実行

`frontend/Dockerfile` の `CMD` が `npm run dev`（開発モード起動）になっていることに気づいた。これによりReact Strict Mode（Next.jsのデフォルトで有効）の「マウント→疑似アンマウント→再マウント」という開発時特有の二重実行が、観測されたログの一部（`MOUNTED → UNMOUNTED → MOUNTED` の3段階シーケンスや `GET /api/auth/me` が2回発火する現象）の要因になっていた。本番ビルドでは発生しない。

### ログアウトAPIのfetchがブラウザ側でアボートされる現象

ログアウトボタンをクリックした際、`POST /api/auth/logout` がブラウザ側では `net::ERR_ABORTED` として観測される一方、バックエンドのアクセスログでは `204 No Content` が正しく返っていた。

```text
backend-1 | INFO: "POST /api/auth/logout HTTP/1.1" 204 No Content
```

サーバー側の処理（Cookie削除）自体は成功しているが、`await logout(); router.push("/login")` という非同期処理の直後に発生するページ遷移（RSCペイロードの再取得等）によって、ブラウザがこのfetchの後処理を中断したと考えられる。認証状態としては問題にならないが、非同期処理と画面遷移がタイミング的に競合しうる状態であることを示す事象として記録した。

### removeChildエラー自体の完全な再現・原因の断定はできなかった

Playwrightによる自動操作（複数回の反復、素早い連続操作を含む）では、報告された `removeChild` エラーやHydration mismatchそのものは再現できなかった。ただし、以下の設計上の脆弱性は実際に観測された。

- Header・Sidebarにログアウト処理（`await logout(); router.push("/login")`）が重複して実装されていた
- ログイン・ログアウトの遷移に `router.push`（ブラウザ履歴に積む遷移）を使っていた
- 前ページの非同期処理（認証チェックのPromiseなど）が、ページ遷移後に遅れて解決し、Reactのstate更新とアンマウントのタイミングが際どく重なるケースを実際に観測した

`<html lang="en">` のHydration mismatchについては、今回のPRの変更範囲外の既存の技術的負債（`create-next-app` のデフォルトのまま）であり、これ単体が主要因とは考えにくい。ブラウザ拡張機能等による `lang` 属性の書き換えが影響した可能性もあるが、断定はしていない。

## 対応（原因を断定せず、設計上の脆弱性を解消する方針）

原因を100%特定できなかったため、大きな構造変更（`AuthContext` へのuser state所有権移動など）は行わず、観測できた不安定要素を解消する方向で修正した。

1. **ログアウト処理を `lib/auth-context.tsx` の `useLogout()` フックに集約**し、Header/Sidebarの重複実装を解消
2. **ログアウト・ログイン成功後の遷移を `router.push` から `router.replace` に変更**し、認証系の中間状態がブラウザ履歴に残らないようにした
3. `usePathname` によるページ遷移毎の再認証は採用せず、既存の「ProtectedLayoutマウント時のみ認証確認」という設計を維持した
4. `RootLayout` の `lang` 属性を `"ja"` に修正（根本原因と断定するものではなく、既存の技術的負債の解消として独立に対応）

## 修正後の確認

Playwrightで以下を確認し、いずれも問題なし（`removeChild` エラー・Hydration mismatchとも0件）。

- 未認証→ログイン
- USER→各保護ページ遷移
- ADMIN→管理画面遷移
- ログアウト→リロードせず再ログイン（5回反復）
- モバイル（ハンバーガーメニュー）経由のログアウト→再ログイン

ログアウト直後に観測されていた `POST /api/auth/logout` の `net::ERR_ABORTED` も、修正後の確認では発生しなかった。

## 教訓

- 「エラーは発生するが再現手順が明確でない」場合、まず最も疑わしい仮説（今回は「stateが残っている」）を裏付けなしに主張せず、実際にログを仕込んで検証すること。今回、当初の仮説はユーザーからの指摘で誤りだと判明した
- Dockerコンテナが開発モード（`npm run dev`）で動いていることに気づかず、観測結果の一部を「本番でも起きるバグ」と誤解しかけた。ブラウザで挙動を確認する際は、対象がどのビルドモードで動いているかを最初に確認する
- 原因を100%特定できない場合でも、実際に観測できた設計上の脆弱性（重複実装、履歴に残る遷移）を解消することで、再発リスクを下げるという対応方針は有効だった
