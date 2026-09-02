import styles from "./SummaryCard.module.css";

interface TodayStudyTimeProps {
  minutes: number;
}

export default function TodayStudyTime({ minutes }: TodayStudyTimeProps) {
  return (
    <section>
      <h2 className={styles.label}>今日の学習時間</h2>
      <p className={styles.value}>{minutes}分</p>
    </section>
  );
}
