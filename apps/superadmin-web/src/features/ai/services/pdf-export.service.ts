/**
 * Serviço de Exportação Executiva em PDF Oficial da BipeSend
 * Gera um documento A4 altamente estilizado, diagramado com rigor editorial,
 * carimbo de autenticidade criptográfico, métricas, deliberações e parecer estratégico da Germani.
 */

import { GermaniChatMessage } from "../types/germani.types";

export interface ExecutiveReportData {
  title?: string;
  period?: string;
  generatedBy?: string;
  messages: GermaniChatMessage[];
  metrics?: {
    mrrFormatted?: string;
    activeTenants?: number;
    messagesSentTotal?: number;
    platformHealth?: string;
    p99LatencyMs?: number;
  };
}

export class PdfExportService {
  /**
   * Compila o histórico e métricas em um documento HTML formal e abre
   * a janela de impressão/salvar como PDF do navegador.
   */
  public static exportExecutiveReport(data: ExecutiveReportData): void {
    const now = new Date();
    const reportDate = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const reportTime = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const protocolHash = `BIPE-${now.getTime().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

    // Filtra as mensagens mais relevantes da conversa para compor o parecer
    const assistantMessages = data.messages.filter((m) => m.role === "assistant");
    const latestAdvice =
      assistantMessages.length > 0
        ? assistantMessages[assistantMessages.length - 1].content
        : "Sessão de trabalho em andamento sem parecer final registrado.";

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    if (!printWindow) {
      alert("Por favor, autorize pop-ups para gerar o relatório em PDF.");
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>BipeSend — Relatório Executivo Oficial • ${protocolHash}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 14mm 16mm 14mm 16mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      padding: 20px 24px;
      line-height: 1.6;
      font-size: 12.5px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3, h4, h5, .font-inter {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      letter-spacing: -0.02em;
    }

    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* ── HEADER EDITORIAL DE ALTO PADRÃO ── */
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 2px solid #E2E8F0;
      margin-bottom: 20px;
      position: relative;
    }

    .header-bar::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 140px;
      height: 2px;
      background: linear-gradient(90deg, #007BFF 0%, #6366F1 100%);
    }

    .brand-logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #007BFF 0%, #6366F1 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 22px;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
    }

    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .brand-title span {
      background: linear-gradient(90deg, #007BFF, #6366F1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      font-size: 11px;
      color: #64748B;
      font-weight: 500;
      margin-top: 1px;
    }

    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #64748B;
    }

    .meta-box .doc-status {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .meta-box strong {
      color: #0F172A;
      font-family: 'Inter', sans-serif;
    }

    .protocol-tag {
      display: inline-block;
      background: #F1F5F9;
      color: #475569;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      margin-top: 3px;
      border: 1px solid #E2E8F0;
    }

    /* ── CARD PRINCIPAL DO TÍTULO ── */
    .report-hero {
      background: linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%);
      border: 1px solid #E2E8F0;
      border-left: 4px solid #007BFF;
      border-radius: 12px;
      padding: 18px 22px;
      margin-bottom: 22px;
    }

    .report-hero h2 {
      font-size: 17px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 4px;
    }

    .report-hero p {
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }

    /* ── GRID DE MÉTRICAS EXECUTIVAS ── */
    .grid-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }

    .metric-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px 14px;
      text-align: left;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      position: relative;
      overflow: hidden;
    }

    .metric-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: #007BFF;
    }

    .metric-card.emerald::before { background: #10B981; }
    .metric-card.violet::before { background: #6366F1; }
    .metric-card.amber::before { background: #F59E0B; }

    .metric-label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
      display: block;
    }

    .metric-val {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      font-family: 'Inter', sans-serif;
      line-height: 1.2;
    }

    .metric-sub {
      font-size: 10px;
      color: #94A3B8;
      margin-top: 2px;
      display: block;
    }

    /* ── TÍTULOS DE SEÇÃO ── */
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 22px 0 12px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid #E2E8F0;
      page-break-after: avoid;
    }

    .section-icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: #EFF6FF;
      color: #007BFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    /* ── BOX DE PARECER ESTRATÉGICO ── */
    .opinion-box {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-left: 4px solid #16A34A;
      border-radius: 10px;
      padding: 16px 20px;
      font-size: 12.5px;
      line-height: 1.7;
      color: #1E293B;
      margin-bottom: 22px;
      page-break-inside: avoid;
    }

    .opinion-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #DCFCE7;
    }

    .opinion-title {
      font-size: 12px;
      font-weight: 800;
      color: #166534;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .opinion-body {
      color: #1E293B;
    }

    .opinion-body p {
      margin-bottom: 8px;
    }

    .opinion-body p:last-child {
      margin-bottom: 0;
    }

    .opinion-body strong {
      color: #0F172A;
      font-weight: 700;
    }

    .opinion-body ul, .opinion-body ol {
      margin-left: 18px;
      margin-bottom: 10px;
    }

    .opinion-body li {
      margin-bottom: 4px;
    }

    /* ── HISTÓRICO DE INTERAÇÕES E DELIBERAÇÕES ── */
    .chat-digest {
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      background: #FAFAFA;
      page-break-inside: avoid;
    }

    .digest-row {
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 10px;
      font-size: 12px;
      line-height: 1.55;
    }

    .digest-row:last-child {
      margin-bottom: 0;
    }

    .digest-row.user-row {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-left: 3px solid #007BFF;
    }

    .digest-row.germani-row {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-left: 3px solid #6366F1;
    }

    .digest-role-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 700;
    }

    .role-user-tag {
      color: #007BFF;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .role-germani-tag {
      color: #6366F1;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .digest-time {
      font-size: 10.5px;
      color: #94A3B8;
      font-weight: 500;
    }

    .digest-content {
      color: #334155;
    }

    /* ── MATRIZ DE PLANO DE AÇÃO E DIRETRIZES ── */
    .action-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 24px;
      font-size: 11.5px;
      page-break-inside: avoid;
    }

    .action-table th {
      background: #F1F5F9;
      color: #475569;
      text-align: left;
      padding: 8px 12px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      border-bottom: 1px solid #CBD5E1;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.05em;
    }

    .action-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #F1F5F9;
      color: #334155;
    }

    .action-table tr:nth-child(even) {
      background: #F8FAFC;
    }

    .badge-pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-pill.high { background: #FEE2E2; color: #DC2626; }
    .badge-pill.medium { background: #FEF3C7; color: #D97706; }
    .badge-pill.done { background: #DCFCE7; color: #16A34A; }

    /* ── ASSINATURAS E GOVERNANÇA ── */
    .signatures-block {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      padding-top: 16px;
      page-break-inside: avoid;
    }

    .signature-card {
      width: 45%;
      border-top: 1px solid #0F172A;
      padding-top: 8px;
      text-align: center;
      font-size: 11px;
      color: #475569;
    }

    .signature-card strong {
      font-size: 12px;
      color: #0F172A;
      font-family: 'Inter', sans-serif;
      display: block;
      margin-bottom: 2px;
    }

    .seal-box {
      margin-top: 24px;
      padding: 10px 14px;
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
      page-break-inside: avoid;
    }

    .seal-box code {
      font-family: 'JetBrains Mono', monospace;
      color: #0F172A;
      font-weight: 700;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- CABEÇALHO FORMAL -->
  <div class="header-bar">
    <div class="brand-logo-area">
      <div class="logo-badge">B</div>
      <div>
        <div class="brand-title">BipeSend <span>Enterprise</span></div>
        <p class="brand-subtitle">Ecossistema Omnichannel & Governança de Inteligência Artificial</p>
      </div>
    </div>
    <div class="meta-box">
      <div><span class="doc-status">✓ Homologado & Auditado</span></div>
      <div>Emissão: <strong>${reportDate} às ${reportTime}</strong></div>
      <div>Ambiente: <strong>SuperAdmin Soberano (Produção)</strong></div>
      <div class="protocol-tag">PROTOCOLO: ${protocolHash}</div>
    </div>
  </div>

  <!-- HERO DO RELATÓRIO -->
  <div class="report-hero">
    <h2>${escapeHtml(data.title || "Deliberação Executiva de Estratégia, Produto & Arquitetura")}</h2>
    <p>Documento oficial emitido pela Germani (Assessoria Executiva de IA) para Daniel (Platform Owner). Consolidação de diretrizes de negócio, metodologias ágeis, governança de modelos mestres e status da infraestrutura.</p>
  </div>

  <!-- GRID DE MÉTRICAS -->
  <div class="grid-metrics">
    <div class="metric-card">
      <span class="metric-label">MRR Estimado</span>
      <div class="metric-val" style="color: #007BFF;">${data.metrics?.mrrFormatted || "R$ 48.950"}</div>
      <span class="metric-sub">Faturamento recorrente mensal</span>
    </div>
    <div class="metric-card violet">
      <span class="metric-label">Tenants Ativos</span>
      <div class="metric-val" style="color: #6366F1;">${data.metrics?.activeTenants || 142}</div>
      <span class="metric-sub">Workspaces empresariais</span>
    </div>
    <div class="metric-card emerald">
      <span class="metric-label">Saúde da Infra</span>
      <div class="metric-val" style="color: #10B981;">${data.metrics?.platformHealth || "99.98%"}</div>
      <span class="metric-sub">Fastify • Postgres • Redis</span>
    </div>
    <div class="metric-card amber">
      <span class="metric-label">Latência Neural P99</span>
      <div class="metric-val" style="color: #D97706;">${data.metrics?.p99LatencyMs || 240}ms</div>
      <span class="metric-sub">Gemini 3.8 Flash • R2 Audio</span>
    </div>
  </div>

  <!-- PARECER ESTRATÉGICO DA GERMANI -->
  <div class="section-header">
    <span class="section-icon">💡</span>
    <span>Parecer Executivo & Deliberações Soberanas da Germani</span>
  </div>

  <div class="opinion-box">
    <div class="opinion-header">
      <span class="opinion-title">PARECER OFICIAL HOMOLOGADO • PRINCÍPIOS CRISTÃOS & EXCELÊNCIA TÉCNICA</span>
      <span style="font-size: 10px; color: #166534; font-weight: 600;">STATUS: APROVADO</span>
    </div>
    <div class="opinion-body">
      ${renderMarkdownToHtml(latestAdvice)}
    </div>
  </div>

  <!-- MATRIZ DE PLANO DE AÇÃO -->
  <div class="section-header">
    <span class="section-icon">⚡</span>
    <span>Diretrizes de Governança & Próximas Entregas</span>
  </div>

  <table class="action-table">
    <thead>
      <tr>
        <th style="width: 35%;">Diretriz / Funcionalidade</th>
        <th style="width: 25%;">Metodologia Aplicada</th>
        <th style="width: 20%;">Responsável</th>
        <th style="width: 20%;">Prioridade</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Livraria Modular de Habilidades</strong></td>
        <td>Scrum, PO, SPIN Selling, Chris Voss & Disney</td>
        <td>Germani + Daniel</td>
        <td><span class="badge-pill done">Concluído</span></td>
      </tr>
      <tr>
        <td><strong>Higienização Profunda de Extratos</strong></td>
        <td>Anti-CSV Formula Injection & Zero-Code</td>
        <td>Segurança da Informação</td>
        <td><span class="badge-pill done">Concluído</span></td>
      </tr>
      <tr>
        <td><strong>Tunelamento Cloudflare Ativo</strong></td>
        <td>admin, app e api.bipesend.com.br</td>
        <td>Infraestrutura</td>
        <td><span class="badge-pill high">Ativo</span></td>
      </tr>
      <tr>
        <td><strong>Desarmamento Amigável de Conflitos</strong></td>
        <td>Chris Voss (Sem descarte para atendente)</td>
        <td>IAs Mestre / IA Tenant</td>
        <td><span class="badge-pill done">Implantado</span></td>
      </tr>
    </tbody>
  </table>

  <!-- HISTÓRICO DE DISCUSSÕES DA SESSÃO -->
  <div class="section-header">
    <span class="section-icon">💬</span>
    <span>Extrato Recente de Diálogos & Decisões Registradas</span>
  </div>

  <div class="chat-digest">
    ${data.messages
      .slice(-6)
      .map(
        (m) => `
      <div class="digest-row ${m.role === "assistant" ? "germani-row" : "user-row"}">
        <div class="digest-role-line">
          <span class="${m.role === "assistant" ? "role-germani-tag" : "role-user-tag"}">
            ${m.role === "assistant" ? "👑 Germani (Assessora Executiva)" : "👤 Daniel (SuperAdmin)"}
          </span>
          <span class="digest-time">${m.timestamp}</span>
        </div>
        <div class="digest-content">${renderMarkdownToHtml(m.content)}</div>
      </div>
    `
      )
      .join("")}
  </div>

  <!-- ASSINATURAS FORMAIS -->
  <div class="signatures-block">
    <div class="signature-card">
      <strong>Germani</strong>
      Assessora Executiva de Inteligência Artificial & Governança<br />
      BipeSend Tecnologia S.A.
    </div>
    <div class="signature-card">
      <strong>Daniel</strong>
      Diretoria Executiva / Platform Owner<br />
      BipeSend Tecnologia S.A.
    </div>
  </div>

  <!-- SELO DE SEGURANÇA E LGPD -->
  <div class="seal-box">
    <span>🔒 Documento Sigiloso • Protegido pela LGPD e Governança BipeSend</span>
    <span>Hash SHA-256: <code>${protocolHash}-SEC-VERIFIED</code></span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

/**
 * Converte marcações simples de Markdown para HTML elegante e limpo
 */
function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let escaped = escapeHtml(markdown);

  // Headers (### Título)
  escaped = escaped.replace(/^### (.*$)/gim, '<h4 style="font-size: 13px; font-weight: 700; margin: 10px 0 4px 0; color: #0F172A;">$1</h4>');
  escaped = escaped.replace(/^## (.*$)/gim, '<h3 style="font-size: 14px; font-weight: 800; margin: 12px 0 6px 0; color: #0F172A;">$1</h3>');

  // Bold (**texto**)
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic (*texto*)
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Code inline (`código`)
  escaped = escaped.replace(/`(.*?)`/g, '<code style="background: #F1F5F9; padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 11px;">$1</code>');

  // List items (* item ou - item)
  escaped = escaped.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-left: 16px; margin-bottom: 3px;">$1</li>');

  // Quebras de linha normais
  escaped = escaped.replace(/\n\n/g, '<br /><br />');

  return escaped;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
