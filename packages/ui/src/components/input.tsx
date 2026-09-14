"use client";
import * as React from "react";
import { cn } from "../lib/utils";
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error,
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      id,
      "aria-describedby": describedBy,
      "aria-invalid": invalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const description =
      [
        describedBy,
        helperText ? `${inputId}-help` : null,
        errorMessage ? `${inputId}-error` : null,
      ]
        .filter(Boolean)
        .join(" ") || undefined;
    return (
      <div className="ui-field">
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
          </label>
        )}
        <div className="ui-field-control">
          {leftIcon && (
            <span className="ui-field-prefix" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            {...props}
            type={type}
            id={inputId}
            ref={ref}
            aria-describedby={description}
            aria-invalid={invalid ?? Boolean(error || errorMessage)}
            className={cn(
              "ui-input",
              leftIcon && "ui-input-prefix",
              rightIcon && "ui-input-suffix",
              className,
            )}
          />
          {rightIcon && <span className="ui-field-suffix">{rightIcon}</span>}
        </div>
        {helperText && (
          <span
            id={`${inputId}-help`}
            className={error ? "ui-error" : "ui-help"}
          >
            {helperText}
          </span>
        )}
        {errorMessage && (
          <span id={`${inputId}-error`} className="ui-error">
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
