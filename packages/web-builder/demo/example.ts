import { webDocumentSchema } from "@bipesend/contracts/web";

/** Explicitly synthetic example, not a customer website/template catalogue. */
export const exampleDocument = webDocumentSchema.parse({
  schemaVersion: 1, title: "Minha primeira página", description: "Exemplo fictício do BipeWPRO.", language: "pt-BR",
  root: {
    id: "pagina", type: "container", version: 1, props: { tag: "div", label: "Página inicial" },
    styles: { base: { display: "flex", direction: "column", padding: 24, gap: 32, background: "#f8fafc" }, desktop: { padding: 64, gap: 48 } },
    children: [
      { id: "cabecalho", type: "container", version: 1, props: { tag: "header", label: "Cabeçalho" }, styles: { base: { display: "flex", direction: "row", justify: "space-between", align: "center", gap: 16 } }, children: [
        { id: "marca", type: "text", version: 1, props: { text: "ESTÚDIO HORIZONTE" }, styles: { base: { fontSize: 16, color: "#075fd8" } }, children: [] },
        { id: "contato", type: "button", version: 1, props: { label: "Vamos conversar", href: "/contato" }, styles: { base: { fontSize: 14 } }, children: [] },
      ] },
      { id: "apresentacao", type: "container", version: 1, props: { tag: "section", label: "Apresentação" }, styles: { base: { display: "flex", direction: "column", padding: 24, gap: 24, background: "#ffffff", radius: 24 }, desktop: { padding: 64 } }, children: [
        { id: "etiqueta", type: "text", version: 1, props: { text: "IDEIAS QUE GANHAM FORMA" }, styles: { base: { fontSize: 14, color: "#475569" } }, children: [] },
        { id: "titulo", type: "heading", version: 1, props: { text: "Sua próxima grande ideia começa aqui.", level: 1 }, styles: { base: { fontSize: 36, color: "#0f172a" }, desktop: { fontSize: 64 } }, children: [] },
        { id: "descricao", type: "text", version: 1, props: { text: "Um espaço para apresentar sua marca, contar sua história e transformar visitantes em novas conexões." }, styles: { base: { fontSize: 18, color: "#475569", maxWidth: 640 } }, children: [] },
        { id: "acao", type: "button", version: 1, props: { label: "Conheça nosso trabalho", href: "/projetos" }, styles: { base: { fontSize: 16, background: "#075fd8", color: "#ffffff" } }, children: [] },
      ] },
      { id: "rodape", type: "container", version: 1, props: { tag: "footer", label: "Rodapé" }, styles: { base: { padding: 8 } }, children: [
        { id: "credito", type: "text", version: 1, props: { text: "Estúdio Horizonte · Conteúdo fictício para demonstração" }, styles: { base: { fontSize: 12, color: "#475569" } }, children: [] },
      ] },
    ],
  },
});
