import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loading} role="status">
      読み込み中...
    </div>
  );
}
