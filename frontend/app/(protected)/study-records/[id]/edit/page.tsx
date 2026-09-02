"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudyRecordForm from "@/components/study-record/StudyRecordForm";
import ErrorMessage from "@/components/common/ErrorMessage";
import Loading from "@/components/common/Loading";
import { toErrorMessage } from "@/lib/api";
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

    getStudyRecord(recordId)
      .then((record) => {
        if (cancelled) return;
        setInitialValues({
          category_id: record.category_id,
          title: record.title,
          content: record.content,
          understanding_level: record.understanding_level,
          study_minutes: record.study_minutes,
          study_date: record.study_date,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(toErrorMessage(e, "学習記録の取得に失敗しました。"));
      });

    return () => {
      cancelled = true;
    };
  }, [recordId]);

  async function handleSubmit(payload: StudyRecordRequest) {
    await updateStudyRecord(recordId, payload);
    router.push("/study-records");
  }

  function handleCancel() {
    router.push("/study-records");
  }

  if (loadError) {
    return (
      <div>
        <h1>学習記録編集</h1>
        <ErrorMessage message={loadError} />
      </div>
    );
  }

  if (initialValues === null) {
    return <Loading />;
  }

  return (
    <div>
      <h1>学習記録編集</h1>
      <StudyRecordForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="更新する"
      />
    </div>
  );
}
