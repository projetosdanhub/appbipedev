"use client";
import * as React from "react";
/** Client checks help UX only; quarantine, MIME inspection, auth and scanning belong to the API. */
export function FileUpload({
  label,
  accept,
  maxBytes,
  maxFiles = 1,
  disabled,
  onFiles,
}: {
  label: string;
  accept: string;
  maxBytes: number;
  maxFiles?: number;
  disabled?: boolean;
  onFiles(files: File[]): void;
}) {
  const [error, setError] = React.useState("");
  const id = React.useId();
  return (
    <div className="ui-upload">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      <p className="ui-help" id={`${id}-help`}>
        Até {maxFiles} arquivo(s),{" "}
        {(maxBytes / 1024 / 1024).toLocaleString("pt-BR")} MB por arquivo.
      </p>
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        disabled={disabled}
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
        aria-invalid={Boolean(error)}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (
            files.length > maxFiles ||
            files.some((file) => file.size > maxBytes)
          ) {
            setError("Confira a quantidade e o tamanho dos arquivos.");
            event.target.value = "";
            return;
          }
          setError("");
          if (files.length) onFiles(files);
        }}
      />
      {error && (
        <p role="alert" className="ui-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
