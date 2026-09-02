interface TodayStudyTimeProps {
  minutes: number;
}

export default function TodayStudyTime({ minutes }: TodayStudyTimeProps) {
  return (
    <section>
      <h2>今日の学習時間</h2>
      <p>{minutes}分</p>
    </section>
  );
}
