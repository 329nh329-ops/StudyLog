import { apiFetch } from "@/lib/api";
import type { StudyRecordListResponse } from "@/types/study-record";
import type { StudyRecordSearchParams } from "@/lib/study-record";
import type { User } from "@/types/auth";

export function listUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/admin/users");
}

export function getUserStudyRecords(
  userId: number,
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
    `/api/admin/users/${userId}/study-records${queryString ? `?${queryString}` : ""}`,
  );
}
