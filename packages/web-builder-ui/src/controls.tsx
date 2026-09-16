"use client";

import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Smartphone, Tablet, Monitor, LayoutTemplate, Heading1, AlignLeft, MousePointer2 } from "lucide-react";

export function BuilderButton({ variant = "secondary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger" }) {
  return <button type="button" {...props} className={`bw-ui-button bw-ui-button--${variant} ${className}`} />;
}

export function InspectorSection({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return <fieldset className="bw-ui-section"><legend>{title}</legend>{description && <p className="bw-ui-hint">{description}</p>}{children}</fieldset>;
}

export function ElementTile({ kind, label, description, onClick }: {
  kind: "container" | "heading" | "text" | "button"; label: string; description: string; onClick(): void;
}) {
  const Icon = { container: LayoutTemplate, heading: Heading1, text: AlignLeft, button: MousePointer2 }[kind];
  return <BuilderButton onClick={onClick} aria-label={`Adicionar ${label.toLowerCase()}`} title={description}><Icon aria-hidden="true" size={24} />{label}</BuilderButton>;
}

export function PanelNavigation({ value, items, onChange }: {
  value: string; items: ReadonlyArray<{ id: string; label: string }>; onChange(id: string): void;
}) {
  return <nav className="bw-ui-panel-nav" aria-label="Painel do editor">{items.map((item) => <BuilderButton key={item.id} variant="quiet" aria-pressed={value === item.id} onClick={() => onChange(item.id)}>{item.label}</BuilderButton>)}</nav>;
}

export function BuilderField({ label, error, hint, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const generated = useId();
  const fieldId = id ?? generated;
  return <div className="bw-ui-field"><label htmlFor={fieldId}>{label}</label>
    <input {...props} id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={(error || hint) ? `${fieldId}-description` : undefined} />
    {(error || hint) && <p id={`${fieldId}-description`} className={error ? "bw-ui-field-error" : "bw-ui-hint"}>{error ?? hint}</p>}
  </div>;
}

export type PreviewDevice = "base" | "tablet" | "desktop";
export const PREVIEW_DEVICES = {
  base: { label: "Mobile", width: 390, icon: Smartphone },
  tablet: { label: "Tablet", width: 768, icon: Tablet },
  desktop: { label: "Desktop", width: 1280, icon: Monitor },
} as const;

export function DeviceSwitcher({ value, onChange }: { value: PreviewDevice; onChange(value: PreviewDevice): void }) {
  const name = useId();
  return <fieldset className="bw-ui-devices"><legend className="bw-ui-sr-only">Dispositivo de prévia e edição de estilo</legend>
    {(["base", "tablet", "desktop"] as const).map((device) => {
      const { label, icon: Icon } = PREVIEW_DEVICES[device];
      return <label key={device} className="bw-ui-device" data-selected={value === device}>
        <input type="radio" name={name} value={device} checked={value === device} onChange={() => onChange(device)} />
        <Icon aria-hidden="true" size={18} /><span>{label}</span>
      </label>;
    })}
  </fieldset>;
}
