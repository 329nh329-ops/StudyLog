import { understandingLevelStars } from "@/lib/understanding-level";
import type { StudyRecord } from "@/types/study-record";

interface RecentRecordsProps {
  records: StudyRecord[];
}

export default function RecentRecords({ records }: RecentRecordsProps) {
  return (
    <section>
      <h2>最近の学習記録</h2>
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            <span>{record.study_date}</span>
            <span>{record.category_name}</span>
            <span>{record.title}</span>
            <span>{record.study_minutes}分</span>
            <span>{understandingLevelStars(record.understanding_level)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
