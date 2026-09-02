"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "@/components/common/ErrorMessage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import PageHeader from "@/components/ui/PageHeader";
import { toErrorMessage } from "@/lib/api";
import { login } from "@/lib/auth";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await login({ username, password });
      router.replace("/dashboard");
    } catch (error) {
      setFormError(toErrorMessage(error, "ログインに失敗しました。しばらくしてから再度お試しください。"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.wrapper}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <p className={styles.brandName}>StudyLog</p>
          <p className={styles.brandTagline}>Learn. Track. Grow.</p>
        </div>

        <PageHeader title="ログイン" />

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="ユーザー名" htmlFor="username">
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormField>

          <FormField label="パスワード" htmlFor="password">
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          {formError && <ErrorMessage message={formError} />}

          <Button type="submit" disabled={submitting} className={styles.submit}>
            ログイン
          </Button>
        </form>

        <p className={styles.footer}>
          <Link href="/register" className={styles.link}>
            新規登録はこちら
          </Link>
        </p>
      </Card>
    </main>
  );
}
