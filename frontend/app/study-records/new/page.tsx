"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudyRecordForm from "@/components/study-record/StudyRecordForm";
import { getCurrentUser } from "@/lib/auth";
import { createStudyRecord } from "@/lib/study-record";
import type { StudyRecordRequest } from "@/types/study-record";

export default function NewStudyRecordPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then((user) => {
      if (cancelled) return;
      if (user === null) {
        router.push("/login");
        return;
      }
      setAuthorized(true);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(payload: StudyRecordRequest) {
    await createStudyRecord(payload);
    router.push("/study-records");
  }

  function handleCancel() {
    router.push("/study-records");
  }

  if (!authorized) {
    return null;
  }

  return (
    <main>
      <h1>学習記録登録</h1>
      <StudyRecordForm onSubmit={handleSubmit} onCancel={handleCancel} submitLabel="登録する" />
    </main>
  );
}
