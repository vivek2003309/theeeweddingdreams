import React from "react";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
}

export interface InputFieldProps
  extends BaseFieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ id, label, error, hint, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label
          htmlFor={id}
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-[52px] w-full rounded-xl border bg-ivory px-4 text-sm text-ink placeholder:text-ink-mute transition-colors duration-300",
            error
              ? "border-error focus-visible:outline-error"
              : "border-hairline hover:border-gold"
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-ink-soft">{hint}</p>
        )}
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);
InputField.displayName = "InputField";

export interface SelectFieldProps
  extends BaseFieldProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  children: React.ReactNode;
}

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ id, label, error, hint, className, children, ...props }, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-text"
      >
        {label}
      </label>
      <select
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-[52px] w-full rounded-xl border bg-ivory px-4 text-sm text-ink transition-colors duration-300",
          error ? "border-error" : "border-hairline hover:border-gold"
        )}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
});
SelectField.displayName = "SelectField";
