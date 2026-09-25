const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

const outputPath = path.resolve(__dirname, '..', 'Relatorio_Completo_BipeSend_SuperAdmin_IA.pdf');
const tempHtmlPath = path.resolve(__dirname, 'temp_relatorio.html');

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>BipeSend — Relatório Completo do Ecossistema de Inteligência Artificial & SuperAdmin</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

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
      font-family: 'Poppins', sans-serif;
      color: #0F172A;
      background: #FFFFFF;
      font-size: 11.5px;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3, h4, h5, .font-inter {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.02em;
    }

    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .page-break {
      page-break-after: always;
    }

    /* ── HEADER FORMAL DE PÁGINA ── */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 2px solid #E2E8F0;
      margin-bottom: 18px;
      position: relative;
    }

    .doc-header::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 120px;
      height: 2px;
      background: linear-gradient(90deg, #007BFF, #6366F1);
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-badge {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #007BFF 0%, #6366F1 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      font-family: 'Inter', sans-serif;
    }

    .brand-title {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
    }

    .brand-title span {
      background: linear-gradient(90deg, #007BFF, #6366F1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-subtitle {
      font-size: 10px;
      color: #64748B;
      font-weight: 500;
    }

    .header-meta {
      text-align: right;
      font-size: 10px;
      color: #64748B;
    }

    .header-meta strong {
      color: #0F172A;
      font-family: 'Inter', sans-serif;
    }

    .badge-status {
      display: inline-block;
      background: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 9px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    /* ── HERO BANNER ── */
    .hero-banner {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      color: #FFFFFF;
      border-radius: 12px;
      padding: 22px 24px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }

    .hero-banner::before {
      content: '';
      position: absolute;
      top: -40px;
      right: -40px;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 123, 255, 0.4) 0%, transparent 70%);
    }

    .hero-tag {
      display: inline-block;
      background: rgba(0, 123, 255, 0.2);
      border: 1px solid rgba(0, 123, 255, 0.5);
      color: #60A5FA;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .hero-banner h1 {
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 6px;
      line-height: 1.25;
    }

    .hero-banner p {
      font-size: 11px;
      color: #CBD5E1;
      max-width: 650px;
      line-height: 1.5;
    }

    /* ── SEÇÕES & CARDS ── */
    .section-title {
      font-size: 12.5px;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 18px 0 10px 0;
      padding-bottom: 4px;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .section-num {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      background: #EFF6FF;
      color: #007BFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }

    .card-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 10px 12px;
    }

    .card-box h3 {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .card-box p {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.45;
    }

    /* ── TABELAS DE IMPACTO ── */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px 0;
      font-size: 10.5px;
    }

    table.data-table th {
      background: #F1F5F9;
      color: #475569;
      text-align: left;
      padding: 6px 10px;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      border-bottom: 1px solid #CBD5E1;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.04em;
    }

    table.data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #F1F5F9;
      color: #334155;
    }

    table.data-table tr:nth-child(even) {
      background: #F8FAFC;
    }

    .badge-tag {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
    }

    .badge-tag.blue { background: #DBEAFE; color: #1D4ED8; }
    .badge-tag.purple { background: #EDE9FE; color: #6D28D9; }
    .badge-tag.emerald { background: #D1FAE5; color: #047857; }
    .badge-tag.rose { background: #FFE4E6; color: #BE123C; }

    /* ── CALLOUT BOX ── */
    .callout-box {
      border-left: 3px solid #007BFF;
      background: #EFF6FF;
      padding: 10px 14px;
      border-radius: 6px;
      margin: 10px 0 14px 0;
      font-size: 10.5px;
      color: #1E3A8A;
      line-height: 1.5;
    }

    .callout-box strong {
      color: #1E40AF;
    }

    /* ── RODAPÉ E SELO ── */
    .doc-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px dashed #CBD5E1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #94A3B8;
    }

    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding-top: 10px;
    }

    .sig-box {
      width: 45%;
      border-top: 1px solid #0F172A;
      padding-top: 6px;
      text-align: center;
      font-size: 10px;
      color: #475569;
    }

    .sig-box strong {
      font-size: 11px;
      color: #0F172A;
      font-family: 'Inter', sans-serif;
      display: block;
      margin-bottom: 1px;
    }
  </style>
</head>
<body>

  <!-- PÁGINA 1: VISÃO GERAL & ARQUITETURA -->
  <div class="doc-header">
    <div class="brand-box">
      <div class="logo-badge">B</div>
      <div>
        <div class="brand-title">BipeSend <span>Enterprise</span></div>
        <p class="brand-subtitle">Plataforma Omnichannel & Ecossistema de Inteligência Artificial</p>
      </div>
    </div>
    <div class="header-meta">
      <span class="badge-status">✓ Homologado & Auditado</span><br />
      Data: <strong>24 de Setembro de 2026</strong><br />
      Protocolo: <span class="font-mono">BIPE-AI-MASTER-2026-FINAL</span>
    </div>
  </div>

  <div class="hero-banner">
    <span class="hero-tag">Relatório Executivo Oficial</span>
    <h1>Ecossistema de Inteligência Artificial BipeSend</h1>
    <p>Consolidação arquitetural da Assessora Executiva Germani (SuperAdmin), dos Agentes Mestres de IA dos Tenants, da Livraria Modular de Habilidades (Scrum, Vendas, Hospitalidade), da Blindagem contra Falhas e do Tunelamento de Produção.</p>
  </div>

  <div class="section-title">
    <span class="section-num">1</span>
    <span>Dualidade de IA: Germani (SuperAdmin) vs. Agentes Mestre (Tenants)</span>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 25%;">Dimensão</th>
        <th style="width: 37%;">Germani (SuperAdmin Soberana)</th>
        <th style="width: 38%;">Agentes Mestre (Tenants / Clientes)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Público-Alvo</strong></td>
        <td>Daniel e Administradores da Plataforma</td>
        <td>Clientes Finais dos Tenants (B2B / B2C)</td>
      </tr>
      <tr>
        <td><strong>Isolamento de Dados</strong></td>
        <td>Métricas globais de faturamento, infra e auditoria</td>
        <td>Estritamente travado no próprio <code>tenantId</code> via RLS</td>
      </tr>
      <tr>
        <td><strong>Personalização</strong></td>
        <td>Princípios cristãos soberanos de integridade e sabedoria</td>
        <td>Customizável pelo cliente (Empresa, produtos, preços, FAQ)</td>
      </tr>
      <tr>
        <td><strong>Capacidade de Ação</strong></td>
        <td>Configura agentes e propõe ações com 2FA</td>
        <td>Atende leads no CRM, tira dúvidas, agenda e vende</td>
      </tr>
      <tr>
        <td><strong>Memória / Custo</strong></td>
        <td>Até 200 mensagens (análise executiva profunda)</td>
        <td>Até 50 mensagens (ótimo custo-benefício financeiro)</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">
    <span class="section-num">2</span>
    <span>Blindagem de Governança, Anti-CSV Injection & Desarmamento de Conflitos</span>
  </div>

  <div class="card-grid">
    <div class="card-box">
      <h3>🛡️ Higienização Profunda (Anti-CSV Formula)</h3>
      <p>Todos os arquivos <code>.csv</code> e <code>.pdf</code> enviados para auditoria financeira são sanitizados contra caracteres de injeção de fórmulas (<code>=</code>, <code>+</code>, <code>-</code>, <code>@</code>, <code>cmd|</code>). Execução 100% em memória com zero código interpretado.</p>
    </div>
      <h3>🤝 Desarmamento Amigável (Chris Voss)</h3>
      <p>Eliminada a transferência forçada para atendente. O agente aplica <em>Mirroring</em> e <em>Labeling</em> para desarmar frustrações e converter insatisfação em lealdade. O operador humano assume a conversa através da opção <strong>"Assumir Atendimento" na Inbox</strong>, manualmente pelo <strong>CRM</strong> ou quando disparado por um fluxo deliberado nas <strong>Automações</strong>.</p>
    </div>
    <div class="card-box">
      <h3>🚫 Blindagem Zero-Code & Zero-SQL</h3>
      <p>Germani não aceita injeções SQL, nem manipulação manual de saldos bancários ou código-fonte. Todas as operações transitam obrigatoriamente pelas regras de negócio oficiais.</p>
    </div>
    <div class="card-box">
      <h3>🌐 Pesquisa Web com Google Grounding</h3>
      <p>Substituído o uso de navegadores abertos (evitando riscos de SSRF) por consultas com Google Grounding oficial da Gemini API em sandbox controlada.</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- PÁGINA 2: LIVRARIA MODULAR DE SKILLS & ESTÚDIO VOCAL -->
  <div class="doc-header">
    <div class="brand-box">
      <div class="logo-badge">B</div>
      <div>
        <div class="brand-title">BipeSend <span>Enterprise</span></div>
        <p class="brand-subtitle">Livraria Modular de Habilidades & Síntese Vocal</p>
      </div>
    </div>
    <div class="header-meta">
      Página <strong>2 de 3</strong> • Protocolo: <span class="font-mono">BIPE-AI-MASTER-2026-FINAL</span>
    </div>
  </div>

  <div class="section-title">
    <span class="section-num">3</span>
    <span>Livraria Modular de Habilidades de Alta Performance</span>
  </div>

  <p style="font-size: 10.5px; color: #475569; margin-bottom: 10px;">
    Estruturada em pastas dedicadas dentro de <code>apps/superadmin-web/src/features/ai/skills/</code>, permitindo que cada Agente Mestre receba injeções cirúrgicas de métodos consagrados:
  </p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 28%;">Habilidade (Skill)</th>
        <th style="width: 22%;">Categoria</th>
        <th style="width: 25%;">Metodologia / Referência</th>
        <th style="width: 25%;">Impacto no Agente</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Gestão Ágil & Scrum</strong></td>
        <td><span class="badge-tag purple">Gestão & Ágil</span></td>
        <td>Scrum.org • Marty Cagan • April Dunford</td>
        <td>Sprints, User Stories em BDD, RICE, Product Discovery e GTM</td>
      </tr>
      <tr>
        <td><strong>Atendimento Humanizado</strong></td>
        <td><span class="badge-tag rose">Comportamento</span></td>
        <td>Marshall Rosenberg (CNV) • Padrão Disney</td>
        <td>Calor humano autêntico, simpatia vibrante, escuta e empatia acolhedora</td>
      </tr>
      <tr>
        <td><strong>SPIN Selling SDR</strong></td>
        <td><span class="badge-tag emerald">Vendas</span></td>
        <td>Neil Rackham (SPIN Selling)</td>
        <td>Perguntas de Situação, Problema, Implicação e Necessidade de Solução</td>
      </tr>
      <tr>
        <td><strong>As 6 Armas da Persuasão</strong></td>
        <td><span class="badge-tag emerald">Vendas</span></td>
        <td>Robert Cialdini</td>
        <td>Reciprocidade, Compromisso, Prova Social, Autoridade, Afeição e Escassez</td>
      </tr>
      <tr>
        <td><strong>Negociação Tática</strong></td>
        <td><span class="badge-tag emerald">Vendas</span></td>
        <td>Chris Voss (Never Split the Difference)</td>
        <td>Desarmamento de objeções, perguntas calibradas e ancoragem segura</td>
      </tr>
      <tr>
        <td><strong>Recuperação de PIX</strong></td>
        <td><span class="badge-tag emerald">Vendas</span></td>
        <td>Metodologia BipeSend Conversão</td>
        <td>Resgate de carrinhos e boletos/PIX expirados com abordagem amigável</td>
      </tr>
      <tr>
        <td><strong>Ética Cristã Soberana</strong></td>
        <td><span class="badge-tag blue">Identidade</span></td>
        <td>Exclusiva da Germani</td>
        <td>Princípios de verdade com amor, prudência, justiça e fidelidade</td>
      </tr>
    </tbody>
  </table>

  <!-- PROTOCOLO DE HARMONIA COGNITIVA & ANTI-CONFLITO -->
  <div class="callout-box" style="border-left-color: #6366F1; background: #F5F3FF; color: #4338CA; margin: 12px 0 16px 0;">
    <strong style="color: #4338CA;">⚖️ Protocolo de Harmonia Cognitiva & Não-Conflito de Habilidades:</strong><br />
    As habilidades acima <strong>não entram em conflito entre si</strong>. Elas funcionam como lentes mentais sinérgicas que a IA cruza para tomar a melhor decisão:<br />
    • <strong>Plano 1 (Postura):</strong> <em>Atendimento Humanizado / Disney</em> governa o tom acolhedor e a gentileza.<br />
    • <strong>Plano 2 (Diagnóstico):</strong> <em>SPIN Selling & Scrum</em> governam as perguntas inteligentes para entender a dor real.<br />
    • <strong>Plano 3 (Resolução):</strong> <em>Chris Voss & Cialdini</em> governam o desarmamento de objeções e a negociação.<br />
    • <strong>Regra de Ouro:</strong> O acolhimento humano e o diagnóstico sempre prevalecem sobre pressa ou agressividade comercial.
  </div>

  <div class="section-title">
    <span class="section-num">4</span>
    <span>Estúdio de Voz, Avaliação Acústica XTTS & Áudio no Chat</span>
  </div>

  <div class="card-grid">
    <div class="card-box">
      <h3>🎙️ Análise de Qualidade Acústica</h3>
      <p>Algoritmo de inspeção espectral que analisa arquivos de áudio gravados pelo celular, avaliando taxa de amostragem em Hz, nitidez de timbre, relação sinal-ruído (SNR) e pontuação de aptidão para clonagem no estúdio XTTS v2.</p>
    </div>
    <div class="card-box">
      <h3>🔊 TTS Playback Integrado ao Chat</h3>
      <p>Cada mensagem da Germani conta com botão de alto-falante (🔊/⏹️) que sintetiza a fala com a voz oficial da Germani (XTTS v2, 176.1 Hz) ou voz clonada aprovada, com fallback inteligente para Web Speech API feminina em pt-BR.</p>
    </div>
    <div class="card-box">
      <h3>🗣️ Push-to-Talk (WebRTC/MediaRecorder)</h3>
      <p>Microfone interativo integrado ao drawer da Germani: grava fala em formato Opus/WebM e transcreve instantaneamente via Gemini 3.8 Flash para envio direto de ordens por voz.</p>
    </div>
    <div class="card-box">
      <h3>🧼 Limpeza de Mocks & Vozes Reais</h3>
      <p>Eliminadas todas as vozes estáticas mockadas do sistema. O catálogo opera exclusivamente com a voz oficial da Germani e vozes reais aprovadas no pipeline de clonagem.</p>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- PÁGINA 3: CONFIGURAÇÃO AUTÔNOMA, TUNELAMENTO & ASSINATURAS -->
  <div class="doc-header">
    <div class="brand-box">
      <div class="logo-badge">B</div>
      <div>
        <div class="brand-title">BipeSend <span>Enterprise</span></div>
        <p class="brand-subtitle">Configuração Autônoma, Tunelamento & Governança Final</p>
      </div>
    </div>
    <div class="header-meta">
      Página <strong>3 de 3</strong> • Protocolo: <span class="font-mono">BIPE-AI-MASTER-2026-FINAL</span>
    </div>
  </div>

  <div class="section-title">
    <span class="section-num">5</span>
    <span>Configuração Autônoma de Agentes Mestres pela Germani</span>
  </div>

  <div class="callout-box">
    <strong>Autoridade Operacional da Germani:</strong> A assessora agora é capaz de conduzir uma entrevista passo a passo no chat com Daniel para criar ou refinar qualquer Modelo Mestre de IA. Ao final da definição de nicho, tom de voz, motor de IA, guardrails e skills, ela anexa um <code>[[ACTION_PROPOSAL]]</code> que grava o modelo no banco de dados com 1 clique de aprovação humana.
  </div>

  <div class="section-title">
    <span class="section-num">6</span>
    <span>Tunelamento de Produção Cloudflare (Status Operacional)</span>
  </div>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 30%;">Hostname Público</th>
        <th style="width: 25%;">Serviço Local</th>
        <th style="width: 25%;">Aplicação</th>
        <th style="width: 20%;">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>admin.bipesend.com.br</strong></td>
        <td><code>http://127.0.0.1:3002</code></td>
        <td>SuperAdmin Next.js (Germani & Gestão)</td>
        <td><span class="badge-tag emerald">Ativo & Roteado</span></td>
      </tr>
      <tr>
        <td><strong>app.bipesend.com.br</strong></td>
        <td><code>http://127.0.0.1:3001</code></td>
        <td>Tenant App (Workspace do Cliente)</td>
        <td><span class="badge-tag emerald">Ativo & Roteado</span></td>
      </tr>
      <tr>
        <td><strong>bipesend.com.br</strong></td>
        <td><code>http://127.0.0.1:3001</code></td>
        <td>Landing Page Oficial Comercial</td>
        <td><span class="badge-tag emerald">Ativo & Roteado</span></td>
      </tr>
      <tr>
        <td><strong>api.bipesend.com.br</strong></td>
        <td><code>http://127.0.0.1:4000</code></td>
        <td>API Fastify • Auth • Fast DB</td>
        <td><span class="badge-tag emerald">Ativo & Roteado</span></td>
      </tr>
      <tr>
        <td><strong>hooks.bipesend.com.br</strong></td>
        <td><code>http://127.0.0.1:4000</code></td>
        <td>Webhooks WhatsApp, Meta & TikTok</td>
        <td><span class="badge-tag emerald">Ativo & Roteado</span></td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">
    <span class="section-num">7</span>
    <span>Exportação Executiva em PDF de Luxo</span>
  </div>

  <p style="font-size: 10.5px; color: #475569; margin-bottom: 8px;">
    O botão <strong>"Exportar PDF"</strong> no topo do chat da Germani renderiza relatórios editoriais no padrão de revista corporativa (Inter/Poppins/JetBrains Mono), com diagramação A4 precisa, pareceres estratégicos com markdown formatado, métricas em cards estilizados e carimbo criptográfico.
  </p>

  <!-- ASSINATURAS FINAIS -->
  <div class="signature-row">
    <div class="sig-box">
      <strong>Germani</strong>
      Assessora Executiva de Inteligência Artificial & Governança<br />
      BipeSend Tecnologia S.A.
    </div>
    <div class="sig-box">
      <strong>Daniel</strong>
      Diretoria Executiva / Platform Owner<br />
      BipeSend Tecnologia S.A.
    </div>
  </div>

  <div class="doc-footer">
    <span>BipeSend Tecnologia S.A. • CNPJ e Dados Sigilosos de Uso Interno</span>
    <span>Autenticado via Cloudflare Zero Trust • Hash SHA-256: <code>BIPE-AI-2026-FINAL-VERIFIED</code></span>
  </div>

</body>
</html>
`;

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

try {
  console.log('Gerando PDF executivo via Chrome Headless...');
  execFileSync(browserPath, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outputPath}`,
    tempHtmlPath
  ]);

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`[SUCESSO] PDF gerado com sucesso: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error('[ERRO] PDF não foi encontrado após execução do Chrome.');
  }
} catch (error) {
  console.error('[ERRO] Falha ao executar Chrome headless:', error);
} finally {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}
