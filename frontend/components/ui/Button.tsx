import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const variantClass = styles[variant];
  return <button className={[variantClass, className].filter(Boolean).join(" ")} {...rest} />;
}
