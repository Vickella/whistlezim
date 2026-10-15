"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  maxLength?: number;
  help?: string;
};

export function PasswordInput({ id, name, label, autoComplete, minLength, maxLength, help }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return <div className="field">
    <label htmlFor={id}>{label}</label>
    <div className="password-input">
      <input id={id} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} required />
      <button className="password-toggle" type="button" aria-controls={id} aria-pressed={visible} onClick={() => setVisible((value) => !value)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
        <span>{visible ? "Hide" : "Show"}</span>
      </button>
    </div>
    {help && <p className="field-help">{help}</p>}
  </div>;
}
