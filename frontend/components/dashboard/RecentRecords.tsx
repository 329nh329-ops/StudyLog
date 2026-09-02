import { understandingLevelStars } from "@/lib/understanding-level";
import type { StudyRecord } from "@/types/study-record";
import styles from "./RecentRecords.module.css";

interface RecentRecordsProps {
  records: StudyRecord[];
}

export default function RecentRecords({ records }: RecentRecordsProps) {
  return (
    <section>
      <h2 className={styles.heading}>最近の学習記録</h2>
      <ul className={styles.list}>
        {records.map((record) => (
          <li key={record.id} className={styles.item}>
            <span className={styles.date}>{record.study_date}</span>
            <span className={styles.category}>{record.category_name}</span>
            <span className={styles.title}>{record.title}</span>
            <span className={styles.minutes}>{record.study_minutes}分</span>
            <span className={styles.stars}>{understandingLevelStars(record.understanding_level)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
