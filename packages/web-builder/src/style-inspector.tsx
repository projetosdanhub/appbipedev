"use client";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { webStyleValuesSchema, type WebNode, type WebBreakpoint, type WebResponsiveStyles } from "@bipesend/contracts/web";
import { resolveStyles } from "@bipesend/web-builder-core";
import { BuilderButton, BuilderField, InspectorSection, PREVIEW_DEVICES } from "@bipesend/web-builder-ui";

const numericKeys = ["columns", "gap", "padding", "fontSize", "radius", "maxWidth"];

export function StyleInspector({ node, breakpoint, onApply }: { node: WebNode; breakpoint: WebBreakpoint; onApply(styles: WebResponsiveStyles): void }) {
  const id = useId();
  const resolved = resolveStyles(node.styles, breakpoint);
  const keys = ["display", "columns", "gap", "padding", "fontSize", "color", "background", "radius", "direction", "textAlign"] as const;
  const values = Object.fromEntries(keys.map((key) => [key, resolved[key]?.toString() ?? ""]));
  const { register, handleSubmit, setError, formState: { errors, dirtyFields, isDirty } } = useForm<Record<string, string>>({ values });
  function submit(fields: Record<string, string>) {
    const candidate: Record<string, unknown> = { ...node.styles[breakpoint] };
    for (const key of Object.keys(dirtyFields)) {
      if (fields[key] === "") delete candidate[key];
      else candidate[key] = numericKeys.includes(key) ? Number(fields[key]) : fields[key];
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
  return <form onSubmit={handleSubmit(submit)} noValidate>
    <InspectorSection title={`Estilo · ${PREVIEW_DEVICES[breakpoint].label}`} description={breakpoint === "base" ? "Base mobile. As outras telas herdam estes valores." : "Altere só o que precisa ser diferente nesta tela. Os demais valores são herdados."}>
      {node.type === "container" && <>
        {select("display", "Layout", [["flex", "Flex"], ["grid", "Grid"]])}
        {select("direction", "Direção flex", [["column", "Vertical"], ["row", "Horizontal"]])}
        <div className="bw-ui-grid"><BuilderField label="Colunas grid" type="number" min={1} max={6} {...register("columns")} error={errors.columns?.message} /><BuilderField label="Intervalo (px)" type="number" min={0} max={160} {...register("gap")} error={errors.gap?.message} /></div>
      </>}
      <div className="bw-ui-grid"><BuilderField label="Espaço interno (px)" type="number" min={0} max={160} {...register("padding")} error={errors.padding?.message} /><BuilderField label="Cantos (px)" type="number" min={0} max={80} {...register("radius")} error={errors.radius?.message} /></div>
      {node.type !== "container" && <BuilderField label="Tamanho do texto (px)" type="number" min={12} max={120} {...register("fontSize")} error={errors.fontSize?.message} />}
      {select("textAlign", "Alinhamento do texto", [["left", "Esquerda"], ["center", "Centro"], ["right", "Direita"]])}
      <BuilderField label="Cor do texto" placeholder="#0f172a" {...register("color")} error={errors.color?.message} hint="Hexadecimal com 6 dígitos." />
      <BuilderField label="Cor de fundo" placeholder="#ffffff" {...register("background")} error={errors.background?.message} hint="Deixe vazio para restaurar a herança." />
      <div className="bw-ui-actions"><BuilderButton type="submit" variant="primary" disabled={!isDirty}>Aplicar estilo</BuilderButton>{breakpoint !== "base" && <BuilderButton onClick={restore} disabled={!node.styles[breakpoint]}>Restaurar herança</BuilderButton>}</div>
    </InspectorSection>
  </form>;
}
