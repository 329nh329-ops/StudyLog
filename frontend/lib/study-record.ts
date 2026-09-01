import { apiFetch, getCsrfTokenFromCookie } from "@/lib/api";
import type {
  StudyRecord,
  StudyRecordListResponse,
  StudyRecordRequest,
} from "@/types/study-record";

export interface StudyRecordSearchParams {
  keyword?: string;
  category_id?: number;
  understanding_level?: number;
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
}

export function listStudyRecords(
  params: StudyRecordSearchParams = {},
): Promise<StudyRecordListResponse> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }
  const queryString = query.toString();
  return apiFetch<StudyRecordListResponse>(
    `/api/study-records${queryString ? `?${queryString}` : ""}`,
  );
}

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

export function deleteStudyRecord(id: number): Promise<void> {
  return apiFetch<void>(`/api/study-records/${id}`, {
    method: "DELETE",
    csrfToken: getCsrfTokenFromCookie(),
  });
}
