"use client";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { buttonNodeSchema, headingNodeSchema, textNodeSchema, containerPropsSchema, type WebNode } from "@bipesend/contracts/web";
import { BuilderButton, BuilderField, InspectorSection } from "@bipesend/web-builder-ui";

export function ContentInspector({ node, onApply }: { node: WebNode; onApply(props: Record<string, unknown>): void }) {
  const id = useId();
  const values = Object.fromEntries(Object.entries(node.props).map(([key, value]) => [key, String(value)]));
  const { register, handleSubmit, setError, formState: { errors, isDirty } } = useForm<Record<string, string>>({ values });
  function submit(fields: Record<string, string>) {
    const schema = node.type === "container" ? containerPropsSchema : node.type === "heading" ? headingNodeSchema.shape.props : node.type === "text" ? textNodeSchema.shape.props : buttonNodeSchema.shape.props;
    const input = node.type === "container" ? { ...node.props, label: fields.label } : node.type === "heading" ? { text: fields.text, level: Number(fields.level) } : node.type === "text" ? { text: fields.text } : { label: fields.label, href: fields.href };
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) setError(String(issue.path[0]), { message: issue.path[0] === "href" ? "Use um caminho local, âncora ou endereço HTTPS válido." : "Confira o valor e o limite deste campo." });
      return;
    }
    onApply(parsed.data);
  }
  return <form onSubmit={handleSubmit(submit)} noValidate>
    <InspectorSection title="Conteúdo">
      {(node.type === "container" || node.type === "button") && <BuilderField label={node.type === "container" ? "Nome da seção" : "Texto do botão"} {...register("label")} error={errors.label?.message} maxLength={node.type === "container" ? 80 : 120} />}
      {(node.type === "heading" || node.type === "text") && <div className="bw-ui-field"><label htmlFor={`${id}-text`}>{node.type === "heading" ? "Texto do título" : "Texto do parágrafo"}</label><textarea id={`${id}-text`} {...register("text")} aria-invalid={!!errors.text} aria-describedby={errors.text ? `${id}-error` : undefined} maxLength={node.type === "heading" ? 2000 : 20000} />{errors.text && <p id={`${id}-error`} className="bw-ui-field-error">{errors.text.message}</p>}</div>}
      {node.type === "heading" && <div className="bw-ui-field"><label htmlFor={`${id}-level`}>Nível do título</label><select id={`${id}-level`} {...register("level")}>{[1,2,3,4,5,6].map((level) => <option key={level} value={level}>H{level}</option>)}</select></div>}
      {node.type === "button" && <BuilderField label="Destino do botão" {...register("href")} error={errors.href?.message} hint="Ex.: /sobre ou https://exemplo.com" maxLength={2048} />}
      <BuilderButton type="submit" variant="primary" disabled={!isDirty}>Aplicar conteúdo</BuilderButton>
    </InspectorSection>
  </form>;
}
