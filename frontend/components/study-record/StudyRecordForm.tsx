"use client";

import { useEffect, useState } from "react";
import StarRating from "@/components/study-record/StarRating";
import ErrorMessage from "@/components/common/ErrorMessage";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { getErrorDetails, toErrorMessage } from "@/lib/api";
import { listCategories } from "@/lib/category";
import type { Category } from "@/types/category";
import type { StudyRecordRequest } from "@/types/study-record";
import styles from "./StudyRecordForm.module.css";

interface StudyRecordFormProps {
  initialValues?: StudyRecordRequest;
  onSubmit: (payload: StudyRecordRequest) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultValues(): StudyRecordRequest {
  return {
    category_id: 0,
    title: "",
    content: "",
    understanding_level: 3,
    study_minutes: 60,
    study_date: today(),
  };
}

function validateTitle(title: string): string | null {
  if (title.length < 1 || title.length > 100) {
    return "タイトルは1〜100文字で入力してください";
  }
  return null;
}

function validateContent(content: string): string | null {
  if (content.length < 1) {
    return "学習内容は1文字以上で入力してください";
  }
  return null;
}

function validateStudyMinutes(studyMinutes: number): string | null {
  if (!Number.isInteger(studyMinutes) || studyMinutes < 1 || studyMinutes > 1440) {
    return "学習時間は1〜1440分で入力してください";
  }
  return null;
}

function validateStudyDate(studyDate: string): string | null {
  if (studyDate > today()) {
    return "学習日には今日以前の日付を指定してください";
  }
  return null;
}

function validateCategoryId(categoryId: number): string | null {
  if (!categoryId) {
    return "カテゴリを選択してください";
  }
  return null;
}

export default function StudyRecordForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
}: StudyRecordFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [values, setValues] = useState<StudyRecordRequest>(initialValues ?? defaultValues());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((e) => {
        setCategoriesError(toErrorMessage(e, "カテゴリ一覧の取得に失敗しました。"));
      });
  }, []);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    const categoryIdError = validateCategoryId(values.category_id);
    if (categoryIdError) errors.category_id = categoryIdError;

    const titleError = validateTitle(values.title);
    if (titleError) errors.title = titleError;

    const contentError = validateContent(values.content);
    if (contentError) errors.content = contentError;

    const studyMinutesError = validateStudyMinutes(values.study_minutes);
    if (studyMinutesError) errors.study_minutes = studyMinutesError;

    const studyDateError = validateStudyDate(values.study_date);
    if (studyDateError) errors.study_date = studyDateError;

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
      await onSubmit(values);
    } catch (e) {
      const details = getErrorDetails(e);
      if (details) {
        setFieldErrors(details);
      }
      setFormError(toErrorMessage(e, "保存に失敗しました。しばらくしてから再度お試しください。"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {categoriesError && <ErrorMessage message={categoriesError} />}

      <FormField label="カテゴリ" htmlFor="category_id" error={fieldErrors.category_id}>
        <select
          id="category_id"
          className={styles.input}
          value={values.category_id}
          onChange={(e) => setValues({ ...values, category_id: Number(e.target.value) })}
        >
          <option value={0}>選択してください</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="タイトル" htmlFor="title" error={fieldErrors.title}>
        <input
          id="title"
          type="text"
          className={styles.input}
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
        />
      </FormField>

      <FormField label="学習内容" htmlFor="content" error={fieldErrors.content}>
        <textarea
          id="content"
          className={styles.textarea}
          value={values.content}
          onChange={(e) => setValues({ ...values, content: e.target.value })}
        />
      </FormField>

      <div className={styles.ratingField}>
        <span className={styles.ratingLabel}>理解度</span>
        <StarRating
          value={values.understanding_level}
          onChange={(level) => setValues({ ...values, understanding_level: level })}
        />
        {fieldErrors.understanding_level && (
          <ErrorMessage message={fieldErrors.understanding_level} />
        )}
      </div>

      <FormField label="学習時間（分）" htmlFor="study_minutes" error={fieldErrors.study_minutes}>
        <input
          id="study_minutes"
          type="number"
          className={styles.input}
          value={values.study_minutes}
          onChange={(e) => setValues({ ...values, study_minutes: Number(e.target.value) })}
        />
      </FormField>

      <FormField label="学習日" htmlFor="study_date" error={fieldErrors.study_date}>
        <input
          id="study_date"
          type="date"
          className={styles.input}
          value={values.study_date}
          max={today()}
          onChange={(e) => setValues({ ...values, study_date: e.target.value })}
        />
      </FormField>

      {formError && <ErrorMessage message={formError} />}

      <div className={styles.actions}>
        <Button type="submit" disabled={submitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
