"use client";

import { useRouter } from "next/navigation";
import StudyRecordForm from "@/components/study-record/StudyRecordForm";
import { createStudyRecord } from "@/lib/study-record";
import type { StudyRecordRequest } from "@/types/study-record";

export default function NewStudyRecordPage() {
  const router = useRouter();

  async function handleSubmit(payload: StudyRecordRequest) {
    await createStudyRecord(payload);
    router.push("/study-records");
  }

  function handleCancel() {
    router.push("/study-records");
  }

  return (
    <div>
      <h1>学習記録登録</h1>
      <StudyRecordForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="登録する" />
    </div>
  );
}
