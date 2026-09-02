import type { StudyRecord } from "@/types/study-record";

export interface DailyTotal {
  date: string;
  minutes: number;
}

export interface CategoryTotal {
  category_id: number;
  category_name: string;
  minutes: number;
}

export interface MonthlyTotal {
  month: string;
  minutes: number;
}

export interface Dashboard {
  today_minutes: number;
  streak_days: number;
  daily_totals: DailyTotal[];
  category_totals: CategoryTotal[];
  monthly_totals: MonthlyTotal[];
  recent_records: StudyRecord[];
}
