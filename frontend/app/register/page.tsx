"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { register } from "@/lib/auth";

const USERNAME_PATTERN = /^[A-Za-z0-9_-]{1,25}$/;

function validateUsername(username: string): string | null {
  if (!USERNAME_PATTERN.test(username)) {
    return "ユーザー名は1〜25文字の半角英数字・ハイフン・アンダースコアで入力してください";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 1 || password.length > 50) {
    return "パスワードは50文字以内で入力してください";
  }
  if (!/[a-z]/.test(password)) {
    return "パスワードは小文字を1文字以上含めてください";
  }
  if (!/[A-Z]/.test(password)) {
    return "パスワードは大文字を1文字以上含めてください";
  }
  if (!/[0-9]/.test(password)) {
    return "パスワードは数字を1文字以上含めてください";
  }
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const usernameError = validateUsername(username);
    if (usernameError) errors.username = usernameError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (password !== passwordConfirmation) {
      errors.password_confirmation = "パスワードが一致しません";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username,
        password,
        password_confirmation: passwordConfirmation,
      });
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.details) {
          setFieldErrors(error.details);
        }
        setFormError(error.message);
      } else {
        setFormError("登録に失敗しました。しばらくしてから再度お試しください。");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>ユーザー登録</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">ユーザー名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {fieldErrors.username && <p role="alert">{fieldErrors.username}</p>}
        </div>

        <div>
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <p role="alert">{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="password_confirmation">パスワード確認</label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          {fieldErrors.password_confirmation && (
            <p role="alert">{fieldErrors.password_confirmation}</p>
          )}
        </div>

        {formError && <p role="alert">{formError}</p>}

        <button type="submit" disabled={submitting}>
          登録する
        </button>
      </form>
      <a href="/login">ログインはこちら</a>
    </main>
  );
}
