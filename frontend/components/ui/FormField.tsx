import ErrorMessage from "@/components/common/ErrorMessage";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
