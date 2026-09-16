import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { DocumentEditor } from "../src/index.js";
import { exampleDocument } from "./example.js";
import "@bipesend/web-builder-ui/styles.css";
import "./styles.css";

function Demo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return <div data-theme={theme}>
    <div className="demo-notice"><span>Ambiente de desenvolvimento · Exemplo fictício · Sem publicação</span><button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Tema escuro" : "Tema claro"}</button></div>
    <DocumentEditor initialDocument={exampleDocument} />
  </div>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><Demo /></React.StrictMode>);
