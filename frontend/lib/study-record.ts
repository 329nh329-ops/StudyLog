import { apiFetch, getCsrfTokenFromCookie } from "@/lib/api";
import type { StudyRecord, StudyRecordRequest } from "@/types/study-record";

export function getStudyRecord(id: number): Promise<StudyRecord> {
  return apiFetch<StudyRecord>(`/api/study-records/${id}`);
}

export function createStudyRecord(payload: StudyRecordRequest): Promise<StudyRecord> {
  return apiFetch<StudyRecord>("/api/study-records", {
    method: "POST",
    body: JSON.stringify(payload),
    csrfToken: getCsrfTokenFromCookie(),
  });
}

export function updateStudyRecord(
  id: number,
  payload: StudyRecordRequest,
): Promise<StudyRecord> {
  return apiFetch<StudyRecord>(`/api/study-records/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    csrfToken: getCsrfTokenFromCookie(),
  });
}
