"use client";
import * as React from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { Input, type InputProps } from "./input";
import { IconButton } from "./button";
import { cn } from "../lib/utils";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type" | "rightIcon">
>((props, ref) => {
  const [visible, setVisible] = React.useState(false);
  return (
    <Input
      {...props}
      ref={ref}
      type={visible ? "text" : "password"}
      rightIcon={
        <IconButton
          disabled={props.disabled}
          label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </IconButton>
      }
    />
  );
});
PasswordInput.displayName = "PasswordInput";
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    errorMessage?: string;
  }
>(
  (
    {
      label,
      id,
      errorMessage,
      className,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;
    return (
      <div className="ui-field">
        <label className="ui-label" htmlFor={fieldId}>
          {label}
        </label>
        <textarea
          {...props}
          ref={ref}
          id={fieldId}
          className={cn("ui-input ui-textarea", className)}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={
            [describedBy, errorMessage && `${fieldId}-error`]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {errorMessage && (
          <p className="ui-error" id={`${fieldId}-error`}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
export function Select({
  label,
  id,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={fieldId}>
        {label}
      </label>
      <select {...props} id={fieldId} className={cn("ui-input", className)}>
        {children}
      </select>
    </div>
  );
}
export const NativeSelect = Select;
type ChoiceProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: React.ReactNode;
};
export const Checkbox = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ label, className, ...props }, ref) => (
    <label className={cn("ui-choice", className)}>
      <input {...props} type="checkbox" ref={ref} />
      {label}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";
export const Radio = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ label, className, ...props }, ref) => (
    <label className={cn("ui-choice", className)}>
      <input {...props} type="radio" ref={ref} />
      {label}
    </label>
  ),
);
Radio.displayName = "Radio";
export const Switch = React.forwardRef<HTMLInputElement, ChoiceProps>(
  ({ label, className, ...props }, ref) => (
    <label className={cn("ui-choice", className)}>
      <input
        {...props}
        className="ui-switch"
        type="checkbox"
        role="switch"
        ref={ref}
      />
      {label}
    </label>
  ),
);
Switch.displayName = "Switch";

/** One real input supports password managers, selection, paste, backspace and mobile keyboard. */
export function OtpInput({
  value,
  onValueChange,
  label = "Código de verificação",
  ...props
}: Omit<InputProps, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange(value: string): void;
}) {
  return (
    <Input
      {...props}
      label={label}
      value={value}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      onChange={(event) =>
        onValueChange(event.target.value.replace(/\D/g, "").slice(0, 6))
      }
      onPaste={(event) => {
        const code = event.clipboardData.getData("text").replace(/[\s-]/g, "");
        if (/^\d{6}$/.test(code)) {
          event.preventDefault();
          onValueChange(code);
        }
      }}
    />
  );
}
export function SearchField({
  value,
  onValueChange,
  onSearch,
  delay = 300,
  label = "Pesquisar",
  ...props
}: Omit<InputProps, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange(value: string): void;
  onSearch?(value: string): void;
  delay?: number;
}) {
  const search = React.useRef(onSearch);
  React.useEffect(() => {
    search.current = onSearch;
  }, [onSearch]);
  React.useEffect(() => {
    const timer = setTimeout(() => search.current?.(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return (
    <Input
      {...props}
      label={label}
      value={value}
      type="search"
      leftIcon={<Search />}
      onChange={(event) => onValueChange(event.target.value)}
      rightIcon={
        value ? (
          <IconButton label="Limpar pesquisa" onClick={() => onValueChange("")}>
            <X aria-hidden="true" />
          </IconButton>
        ) : undefined
      }
    />
  );
}
