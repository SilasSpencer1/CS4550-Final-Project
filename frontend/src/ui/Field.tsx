import type { ReactNode } from "react";

interface Props {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}

export default function Field({ label, hint, htmlFor, children }: Props) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
    </div>
  );
}
