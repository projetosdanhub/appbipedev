"use client";

import React from "react";
import { AiAgentTemplate } from "@bipesend/contracts";

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: AiAgentTemplate[];
  onSelectTemplate: (template: AiAgentTemplate) => void;
}

export function TemplatePickerModal({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
}: TemplatePickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "780px" }}>
        <div className="ai-modal-head">
          <h3 className="ai-modal-title">
            <span>✨</span> Escolher Modelo de Agente IA Mestre
          </h3>
          <button className="ai-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="ai-modal-body">
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#64748b" }}>
            Selecione uma personalidade profissional pré-configurada pela equipe BipeSend com guardrails de segurança e limitações já aplicados:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#007bff";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 123, 255, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => {
                  onSelectTemplate(tpl);
                  onClose();
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #007bff, #6366f1)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      {tpl.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                        {tpl.name}
                      </h4>
                      <span style={{ fontSize: "12px", color: "#007bff", fontWeight: "600" }}>
                        {tpl.role}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                    {tpl.personality}
                  </p>

                  <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>
                      Limitações Integradas:
                    </span>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", fontSize: "11px", color: "#475569" }}>
                      {tpl.limitations.slice(0, 2).map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-ai-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "8px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(tpl);
                    onClose();
                  }}
                >
                  Usar Este Modelo
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-modal-foot">
          <button type="button" className="btn-ai-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
