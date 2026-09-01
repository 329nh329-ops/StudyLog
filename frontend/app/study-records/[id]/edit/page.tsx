"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudyRecordForm from "@/components/study-record/StudyRecordForm";
import { ApiError } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getStudyRecord, updateStudyRecord } from "@/lib/study-record";
import type { StudyRecordRequest } from "@/types/study-record";

export default function EditStudyRecordPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const recordId = Number(params.id);

  const [initialValues, setInitialValues] = useState<StudyRecordRequest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then(async (user) => {
      if (cancelled) return;
      if (user === null) {
        router.push("/login");
        return;
      }

      try {
        const record = await getStudyRecord(recordId);
        if (cancelled) return;
        setInitialValues({
          category_id: record.category_id,
          title: record.title,
          content: record.content,
          understanding_level: record.understanding_level,
          study_minutes: record.study_minutes,
          study_date: record.study_date,
        });
      } catch (e) {
        if (cancelled) return;
        setLoadError(
          e instanceof ApiError ? e.message : "学習記録の取得に失敗しました。",
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, recordId]);

  async function handleSubmit(payload: StudyRecordRequest) {
    await updateStudyRecord(recordId, payload);
    router.push("/study-records");
  }

  function handleCancel() {
    router.push("/study-records");
  }

  if (loadError) {
    return (
      <main>
        <h1>学習記録編集</h1>
        <p role="alert">{loadError}</p>
      </main>
    );
  }

  if (initialValues === null) {
    return null;
  }

  return (
    <main>
      <h1>学習記録編集</h1>
      <StudyRecordForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="更新する"
      />
    </main>
  );
}
