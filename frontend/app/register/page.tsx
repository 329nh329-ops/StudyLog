"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "@/components/common/ErrorMessage";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import PageHeader from "@/components/ui/PageHeader";
import { getErrorDetails, toErrorMessage } from "@/lib/api";
import { register } from "@/lib/auth";
import styles from "./page.module.css";

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
      const details = getErrorDetails(error);
      if (details) {
        setFieldErrors(details);
      }
      setFormError(toErrorMessage(error, "登録に失敗しました。しばらくしてから再度お試しください。"));
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

        <PageHeader title="ユーザー登録" />

        <form onSubmit={handleSubmit} className={styles.form}>
          <FormField label="ユーザー名" htmlFor="username" error={fieldErrors.username}>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormField>

          <FormField label="パスワード" htmlFor="password" error={fieldErrors.password}>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>

          <FormField
            label="パスワード確認"
            htmlFor="password_confirmation"
            error={fieldErrors.password_confirmation}
          >
            <input
              id="password_confirmation"
              type="password"
              className={styles.input}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </FormField>

          {formError && <ErrorMessage message={formError} />}

          <Button type="submit" disabled={submitting} className={styles.submit}>
            登録する
          </Button>
        </form>

        <p className={styles.footer}>
          <Link href="/login" className={styles.link}>
            ログインはこちら
          </Link>
        </p>
      </Card>
    </main>
  );
}
