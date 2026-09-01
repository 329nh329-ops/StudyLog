export interface StudyRecord {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  content: string;
  understanding_level: number;
  study_minutes: number;
  study_date: string;
  created_at: string;
  updated_at: string;
}

export interface StudyRecordRequest {
  category_id: number;
  title: string;
  content: string;
  understanding_level: number;
  study_minutes: number;
  study_date: string;
}

export interface StudyRecordListResponse {
  items: StudyRecord[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
