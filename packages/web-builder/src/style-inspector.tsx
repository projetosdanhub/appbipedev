"use client";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { webStyleValuesSchema, type WebNode, type WebBreakpoint, type WebResponsiveStyles } from "@bipesend/contracts/web";
import { resolveStyles } from "@bipesend/web-builder-core";
import { BuilderButton, BuilderField, InspectorSection, PREVIEW_DEVICES } from "@bipesend/web-builder-ui";

const numericKeys = ["columns", "gap", "padding", "fontSize", "radius", "maxWidth"];
const spacingKeys = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const;
const spacingLabels = { paddingTop: "Superior", paddingRight: "Direita", paddingBottom: "Inferior", paddingLeft: "Esquerda" } as const;
const colorPattern = /^#[0-9a-fA-F]{6}$/;

export function StyleInspector({ node, breakpoint, onApply }: { node: WebNode; breakpoint: WebBreakpoint; onApply(styles: WebResponsiveStyles): void }) {
  const id = useId();
  const resolved = resolveStyles(node.styles, breakpoint);
  const keys = ["display", "columns", "gap", "fontSize", "color", "background", "radius", "direction", "textAlign"] as const;
  const values = Object.fromEntries(keys.map((key) => [key, resolved[key]?.toString() ?? ""]));
  for (const key of spacingKeys) {
    const current = resolved[key] ?? resolved.padding;
    values[key] = current === undefined ? "" : typeof current === "number" ? String(current) : String(current.value);
    values[`${key}Unit`] = typeof current === "object" ? current.unit : "px";
  }
  const { register, handleSubmit, setError, setValue, watch, formState: { errors, dirtyFields, isDirty } } = useForm<Record<string, string>>({ values });
  function submit(fields: Record<string, string>) {
    const candidate: Record<string, unknown> = { ...node.styles[breakpoint] };
    for (const key of Object.keys(dirtyFields)) {
      if (key.endsWith("Unit") || spacingKeys.includes(key as typeof spacingKeys[number])) continue;
      if (fields[key] === "") delete candidate[key];
      else candidate[key] = numericKeys.includes(key) ? Number(fields[key]) : fields[key];
    }
    for (const key of spacingKeys) {
      if (!dirtyFields[key] && !dirtyFields[`${key}Unit`]) continue;
      if (fields[key] === "") delete candidate[key];
      else candidate[key] = { value: Number(fields[key]), unit: fields[`${key}Unit`] };
    }
    const parsed = webStyleValuesSchema.safeParse(candidate);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) setError(String(issue.path[0]), { message: "Confira o formato e o intervalo permitido." });
      return;
    }
    onApply({ ...node.styles, [breakpoint]: parsed.data });
  }
  function restore() {
    const styles = { ...node.styles };
    if (breakpoint !== "base") delete styles[breakpoint];
    onApply(styles);
  }
  function select(key: string, label: string, options: Array<[string, string]>) {
    return <div className="bw-ui-field"><label htmlFor={`${id}-${key}`}>{label}</label><select id={`${id}-${key}`} {...register(key)}><option value="">Automático</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></div>;
  }
  function color(key: "color" | "background", label: string, fallback: string) {
    const current = watch(key);
    return <div className="bw-ui-color-control"><BuilderField label={label} placeholder={fallback} {...register(key)} error={errors[key]?.message} hint="Hexadecimal com 6 dígitos." />
      <label className="bw-ui-color-picker">Seletor visual de {label.toLowerCase()}<input type="color" value={colorPattern.test(current) ? current : fallback} onChange={(event) => setValue(key, event.target.value, { shouldDirty: true })} /></label>
    </div>;
  }
  return <form onSubmit={handleSubmit(submit)} noValidate>
    <InspectorSection title={`Estilo · ${PREVIEW_DEVICES[breakpoint].label}`} description={breakpoint === "base" ? "Base mobile. As outras telas herdam estes valores." : "Altere só o que precisa ser diferente nesta tela. Os demais valores são herdados."}>
      {node.type === "container" && <>
        {select("display", "Layout", [["flex", "Flex"], ["grid", "Grid"]])}
        {select("direction", "Direção flex", [["column", "Vertical"], ["row", "Horizontal"]])}
        <div className="bw-ui-grid"><BuilderField label="Colunas grid" type="number" min={1} max={6} {...register("columns")} error={errors.columns?.message} /><BuilderField label="Intervalo (px)" type="number" min={0} max={160} {...register("gap")} error={errors.gap?.message} /></div>
      </>}
      <fieldset className="bw-ui-spacing"><legend>Espaço interno por lado</legend><div className="bw-ui-spacing-grid">{spacingKeys.map((key) => {
        const unit = watch(`${key}Unit`) || "px";
        return <div className="bw-ui-spacing-side" key={key}><BuilderField label={spacingLabels[key]} type="number" min={0} max={unit === "rem" ? 10 : unit === "%" ? 100 : 160} step={unit === "rem" ? .25 : 1} {...register(key)} error={errors[key]?.message} /><label className="bw-ui-unit"><span>Unidade de {spacingLabels[key].toLowerCase()}</span><select aria-label={`Unidade de ${spacingLabels[key].toLowerCase()}`} {...register(`${key}Unit`)}><option value="px">px</option><option value="rem">rem</option><option value="%">%</option></select></label></div>;
      })}</div></fieldset>
      <BuilderField label="Cantos (px)" type="number" min={0} max={80} {...register("radius")} error={errors.radius?.message} />
      {node.type !== "container" && <BuilderField label="Tamanho do texto (px)" type="number" min={12} max={120} {...register("fontSize")} error={errors.fontSize?.message} />}
      {select("textAlign", "Alinhamento do texto", [["left", "Esquerda"], ["center", "Centro"], ["right", "Direita"]])}
      {color("color", "Cor do texto", "#0f172a")}
      {color("background", "Cor de fundo", "#ffffff")}
      <div className="bw-ui-actions"><BuilderButton type="submit" variant="primary" disabled={!isDirty}>Aplicar estilo</BuilderButton>{breakpoint !== "base" && <BuilderButton onClick={restore} disabled={!node.styles[breakpoint]}>Restaurar herança</BuilderButton>}</div>
    </InspectorSection>
  </form>;
}
