const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

const outputPath = path.resolve(__dirname, '..', 'Manual_Completo_Clonagem_Voz_XTTSv2_BipeSend.pdf');
const docsOutputPath = path.resolve(__dirname, '..', 'docs', 'Manual_Completo_Clonagem_Voz_XTTSv2_BipeSend.pdf');
const tempHtmlPath = path.resolve(__dirname, 'temp_voice_manual.html');

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>BipeSend — Manual Completo do Sistema de Clonagem de Voz Neural XTTS v2 & TSSL</title>
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
      font-size: 11px;
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
      padding-bottom: 12px;
      border-bottom: 2px solid #E2E8F0;
      margin-bottom: 18px;
    }

    .doc-header .logo-area {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .doc-header .brand-name {
      font-size: 16px;
      font-weight: 900;
      background: linear-gradient(135deg, #007BFF, #6366F1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .doc-header .meta {
      text-align: right;
      font-size: 9.5px;
      color: #64748B;
      font-weight: 500;
    }

    /* ── CAPA DO DOCUMENTO ── */
    .cover-container {
      min-height: 245mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 0;
    }

    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #EFF6FF;
      color: #007BFF;
      border: 1px solid #BFDBFE;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 18px;
    }

    .cover-title {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.15;
      color: #0F172A;
      margin-bottom: 14px;
    }

    .cover-title span {
      background: linear-gradient(135deg, #007BFF 0%, #6366F1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .cover-subtitle {
      font-size: 13.5px;
      color: #475569;
      line-height: 1.6;
      max-width: 90%;
      margin-bottom: 30px;
    }

    .cover-card-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 32px;
    }

    .cover-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
    }

    .cover-card-title {
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cover-card-desc {
      font-size: 10.5px;
      color: #64748B;
      line-height: 1.5;
    }

    .cover-footer {
      border-top: 1px solid #E2E8F0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748B;
    }

    /* ── SEÇÕES & TIPOGRAFIA ── */
    .section-title {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-title .bar {
      width: 4px;
      height: 20px;
      background: linear-gradient(to bottom, #007BFF, #6366F1);
      border-radius: 2px;
    }

    .section-desc {
      font-size: 11px;
      color: #475569;
      margin-bottom: 16px;
      line-height: 1.6;
    }

    .subsection-title {
      font-size: 13.5px;
      font-weight: 700;
      color: #1E293B;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    /* ── BOXES / CALLOUTS ── */
    .callout {
      padding: 12px 14px;
      border-radius: 10px;
      margin: 12px 0;
      font-size: 10.5px;
      line-height: 1.55;
    }

    .callout-blue {
      background: #EFF6FF;
      border-left: 4px solid #007BFF;
      color: #1E40AF;
    }

    .callout-emerald {
      background: #ECFDF5;
      border-left: 4px solid #10B981;
      color: #065F46;
    }

    .callout-purple {
      background: #F5F3FF;
      border-left: 4px solid #6366F1;
      color: #4338CA;
    }

    .callout-amber {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
      color: #92400E;
    }

    /* ── TABELAS EXECUTIVAS ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 10.5px;
    }

    th {
      background: #F1F5F9;
      color: #1E293B;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #CBD5E1;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
      vertical-align: middle;
    }

    tr:nth-child(even) td {
      background: #F8FAFC;
    }

    .table-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 9.5px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .badge-blue { background: #DBEAFE; color: #1D4ED8; }
    .badge-green { background: #D1FAE5; color: #047857; }
    .badge-purple { background: #EDE9FE; color: #6D28D9; }
    .badge-amber { background: #FEF3C7; color: #B45309; }

    /* ── GRIDS & CARDS ── */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 12px 0;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 12px 0;
    }

    .stat-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }

    .stat-card .label {
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748B;
      margin-bottom: 4px;
    }

    .stat-card .value {
      font-size: 17px;
      font-weight: 900;
      color: #0F172A;
      font-family: 'Inter', sans-serif;
    }

    .stat-card .sub {
      font-size: 9px;
      color: #007BFF;
      margin-top: 2px;
      font-weight: 600;
    }

    /* ── CODE SNIPPETS ── */
    pre {
      background: #0F172A;
      color: #F8FAFC;
      padding: 12px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9.5px;
      line-height: 1.5;
      margin: 10px 0;
      overflow-x: auto;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      background: #F1F5F9;
      color: #007BFF;
      padding: 1px 4px;
      border-radius: 4px;
      font-size: 9.5px;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    .doc-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #94A3B8;
    }
  </style>
</head>
<body>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PÁGINA 1: CAPA EXECUTIVA & SUMÁRIO DA ARQUITETURA DE VOZ          -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="cover-container">
    <div>
      <div class="doc-header">
        <div class="logo-area">
          <span class="brand-name">BIPESEND</span>
          <span style="font-size: 10px; color: #94A3B8; font-weight: 600;">| AI Voice Engineering</span>
        </div>
        <div class="meta">
          <span>Manual Técnico & Operacional v2.0</span><br />
          <span>Homologação Setembro 2026</span>
        </div>
      </div>

      <div class="cover-badge">
        <span>⚡ Engenharia de Áudio Neural de Alta Fidelidade</span>
      </div>

      <h1 class="cover-title">
        Manual Completo do Sistema de<br />
        <span>Clonagem de Voz & Calibração Neural</span>
      </h1>

      <p class="cover-subtitle">
        Documentação aprofundada da infraestrutura de síntese vocal da BipeSend: motor neural Coqui XTTS v2, camada TSSL (Text-to-Speech Synthesis Layer), perfil acústico soberano da Germani, presets de estúdio inspirados no padrão OpenAI TTS e isolamento multi-tenant dos Agentes Mestre.
      </p>

      <div class="cover-card-grid">
        <div class="cover-card">
          <div class="cover-card-title">
            <span>🎙️ Coqui XTTS v2 + Vocoder HiFi-GAN</span>
          </div>
          <p class="cover-card-desc">
            Síntese neural autoregressiva de 24.000 Hz com extração de vetores latentes em pouquíssimos segundos de amostra.
          </p>
        </div>

        <div class="cover-card">
          <div class="cover-card-title">
            <span>👑 Germani — Voz Oficial Soberana</span>
          </div>
          <p class="cover-card-desc">
            Identidade vocal executiva baseada em medições instrumentais de <code>germani.wav</code> com pitch central medido em 176.1 Hz.
          </p>
        </div>

        <div class="cover-card">
          <div class="cover-card-title">
            <span>🎚️ Calibração Nativa & Presets OpenAI</span>
          </div>
          <p class="cover-card-desc">
            Normalização EBU R128 (-1.0 dBFS), corte cirúrgico de silêncio morto e 4 presets de cadência humana sem gagueira.
          </p>
        </div>

        <div class="cover-card">
          <div class="cover-card-title">
            <span>🛡️ Isolamento Multi-Tenant & Omnichannel</span>
          </div>
          <p class="cover-card-desc">
            Vozes built-in universais e vozes clonadas estritamente isoladas por tenant com distribuição Opus via WhatsApp Direct.
          </p>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>BipeSend Tecnologia S.A. • Todos os direitos reservados</span>
      <span>Confidencial • Uso Interno e Operacional</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PÁGINA 2: ARQUITETURA TÉCNICA DO MOTOR & O QUE É O TSSL           -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="doc-header">
    <div class="logo-area">
      <span class="brand-name">BIPESEND</span>
      <span style="font-size: 10px; color: #94A3B8; font-weight: 600;">| Arquitetura & Motor Neural</span>
    </div>
    <div class="meta">
      <span>Seção 01 • Motor XTTS v2 & TSSL</span>
    </div>
  </div>

  <div class="section-title">
    <div class="bar"></div>
    <span>1. O Que Estamos Usando: XTTS v2, TSSL & Stack de Áudio</span>
  </div>

  <p class="section-desc">
    O ecossistema de voz da BipeSend abandona sistemas TTS convencionais robóticos (concatenativos ou baseados em regras rígidas) e adota um pipeline neural generativo de ponta a ponta, capaz de reproduzir o timbre, as micro-respirações, a entonação emocional e a cadência humana em português brasileiro.
  </p>

  <div class="subsection-title">1.1 O Motor Neural Coqui XTTS v2</div>
  <p>
    O <strong>XTTS v2 (Extended Text-to-Speech v2)</strong> é uma das redes neurais de áudio mais avançadas do mundo para clonagem rápida de voz (<em>Zero-Shot Voice Cloning</em>). Ele combina duas etapas neurais principais:
  </p>
  <ul>
    <li><strong>Decodificador Autoregressivo Baseado em Transformador (GPT Latent):</strong> Analisa o texto tokenizado e, condicionado a um vetor acústico de referência (extraído do áudio do falante), gera representações latentes comprimidas (<em>mel-spectrogram tokens</em>).</li>
    <li><strong>Vocoder Neural HiFi-GAN:</strong> Converte os tensores latentes diretamente na forma de onda de áudio analógica/PCM em altíssima fidelidade a <strong>24.000 Hz (24 kHz)</strong>, garantindo calor harmônico e eliminando chiados metálicos.</li>
  </ul>

  <div class="subsection-title">1.2 O Que É o TSSL (Text-to-Speech Synthesis Layer)?</div>
  <p>
    O <strong>TSSL</strong> é a camada proprietária de orquestração desenvolvida pela BipeSend que conecta o frontend corporativo, as regras de negócios, os webhooks do WhatsApp e o modelo neural Python. Ele atua em 4 etapas cruciais:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Etapa TSSL</th>
        <th style="width: 35%;">Função Principal</th>
        <th style="width: 40%;">Impacto na Qualidade Sonora</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Normalização Léxica</strong></td>
        <td>Converte moedas (<code>R$ 150</code> → <em>cento e cinquenta reais</em>), siglas (<code>PIX</code>, <code>CRM</code>) e datas.</td>
        <td>Evita que a IA leia números por dígitos isolados ou soletrar siglas de forma errática.</td>
      </tr>
      <tr>
        <td><strong>2. Tokenização & Chunking</strong></td>
        <td>Aplica <code>split_sentences=True</code> por pontuações prosódicas (<code>.</code>, <code>,</code>, <code>?</code>, <code>!</code>).</td>
        <td>Gera respirações naturais entre orações, eliminando a sensação de sufocamento mecânico.</td>
      </tr>
      <tr>
        <td><strong>3. Condicionamento Latente</strong></td>
        <td>Extrai os d-vectors e embeddings de <code>speaker_wav</code> com chunking acústico de 4s a 6s.</td>
        <td>Preserva a identidade tímbrica e a cor da voz do locutor original com precisão milimétrica.</td>
      </tr>
      <tr>
        <td><strong>4. Masterização Acústica</strong></td>
        <td>Trimming de silêncio morto e normalização linear True Peak para <strong>-1.0 dBFS</strong>.</td>
        <td>Garante volume uniforme de transmissão broadcast sem clipping ou variações sonoras.</td>
      </tr>
    </tbody>
  </table>

  <div class="subsection-title">1.3 Stack Tecnológico em Produção</div>
  <div class="grid-2">
    <div class="callout callout-blue">
      <strong>Microserviço Neural de IA (Python FastAPI):</strong><br />
      Executado em Python 3.11 com PyTorch, SoundFile (libsndfile puro sem dependência de DLLs externas do Windows) e Uvicorn. Hospeda o endpoint <code>/v1/tts/synthesize</code> com medição em milissegundos.
    </div>
    <div class="callout callout-purple">
      <strong>Next.js App Router (SuperAdmin & Tenant):</strong><br />
      Server Actions com tipagem estrita via Zod contracts. Comunicação via payload JSON na rede interna e reprodução sem latência via data URI base64 no navegador.
    </div>
  </div>

  <div class="doc-footer">
    <span>BipeSend — Documento de Engenharia de Voz</span>
    <span>Página 2</span>
  </div>

  <div class="page-break"></div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PÁGINA 3: A VOZ DA GERMANI (OFICIAL SOBERANA)                     -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="doc-header">
    <div class="logo-area">
      <span class="brand-name">BIPESEND</span>
      <span style="font-size: 10px; color: #94A3B8; font-weight: 600;">| Identidade & Perfil da Germani</span>
    </div>
    <div class="meta">
      <span>Seção 02 • Perfil Acústico Medido</span>
    </div>
  </div>

  <div class="section-title">
    <div class="bar"></div>
    <span>2. A Voz Oficial da Germani: Identidade Soberana & Acústica</span>
  </div>

  <p class="section-desc">
    A <strong>Germani</strong> não é um assistente virtual genérico configurável por terceiros. Ela atua como a <em>Chief Executive AI Advisor</em> e Assessora Pessoal da presidência da BipeSend. Sua voz reflete uma presença executiva calorosa, serena, inteligente e firme.
  </p>

  <div class="grid-4">
    <div class="stat-card">
      <div class="label">Pitch Mediano</div>
      <div class="value">176.1 Hz</div>
      <div class="sub">Afinação Central</div>
    </div>
    <div class="stat-card">
      <div class="label">Loudness Integrada</div>
      <div class="value">-18.1 LUFS</div>
      <div class="sub">Padrão Broadcast</div>
    </div>
    <div class="stat-card">
      <div class="label">Harmônico/Ruído</div>
      <div class="value">9.8 dB HNR</div>
      <div class="sub">Fonação Regular</div>
    </div>
    <div class="stat-card">
      <div class="label">Centroide Espectral</div>
      <div class="value">295.7 Hz</div>
      <div class="sub">Calor &lt; 1 kHz</div>
    </div>
  </div>

  <div class="subsection-title">2.1 O Manifesto Físico de germani.wav</div>
  <p>
    A identidade vocal é derivada instrumentalmente do arquivo matriz <code>germani.wav</code>, gravado em estúdio e homologado no manifesto técnico imutável (<code>GERMANI_ACOUSTIC_MANIFEST</code>):
  </p>
  <ul>
    <li><strong>Duração do Áudio de Referência:</strong> 15,595 segundos de fala contínua e sem eco.</li>
    <li><strong>Taxa de Amostragem Original:</strong> 44.100 Hz mono PCM 16-bit com True Peak em -3.3 dBTP.</li>
    <li><strong>SHA-256 de Autenticidade:</strong> <code>06806dd8f1fa71c3734e6567b01cb169ead626fbd5eff7fc44f62b6675f8f4fc</code>.</li>
  </ul>

  <div class="callout callout-emerald">
    <strong>🛡️ Constituição Soberana Imutável:</strong><br />
    No painel do SuperAdmin (<code>/germani</code>), a voz da Germani é exibida em modo protegido. Diferente dos agentes secundários de suporte ou vendas, a Germani não permite troca de gênero ou alteração de persona: seu perfil vocal e autoridade estratégica são parte intrínseca da identidade institucional da BipeSend.
  </div>

  <div class="subsection-title">2.2 Estrutura do Perfil Vocal JSON (VoiceProfile Schema)</div>
  <pre><code>{
  "profile_id": "germani_reference_v1",
  "name": "Germani (Oficial Soberana)",
  "language": "pt-BR",
  "acoustic_profile": {
    "pitch_hz": 176.1,
    "loudness_lufs": -18.1,
    "hnr_db": 9.8,
    "spectral_centroid_hz": 295.7
  },
  "xtts_v2_parameters": {
    "temperature": 0.68,
    "speed": 1.02,
    "repetition_penalty": 4.0,
    "top_k": 50,
    "top_p": 0.85,
    "enable_text_splitting": true
  }
}</code></pre>

  <div class="doc-footer">
    <span>BipeSend — Documento de Engenharia de Voz</span>
    <span>Página 3</span>
  </div>

  <div class="page-break"></div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PÁGINA 4: CALIBRAÇÃO NATIVA & PRESETS OPENAI                      -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="doc-header">
    <div class="logo-area">
      <span class="brand-name">BIPESEND</span>
      <span style="font-size: 10px; color: #94A3B8; font-weight: 600;">| Engenharia de Calibração</span>
    </div>
    <div class="meta">
      <span>Seção 03 • Padrão OpenAI & Parâmetros</span>
    </div>
  </div>

  <div class="section-title">
    <div class="bar"></div>
    <span>3. Calibração Nativa XTTS v2: O Padrão de Qualidade OpenAI</span>
  </div>

  <p class="section-desc">
    Para que as vozes da BipeSend atinjam o nível espetacular do ChatGPT Voice da OpenAI, pesquisamos os fatores determinantes na percepção auditiva humana e calibramos cirurgicamente cada tensor de amostragem.
  </p>

  <div class="subsection-title">3.1 Os Controles Nativos do Modelo</div>
  <table>
    <thead>
      <tr>
        <th>Parâmetro</th>
        <th>Faixa</th>
        <th>Valor Ótimo</th>
        <th>Efeito Prático na Fala</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>temperature</code></td>
        <td>0.10 a 1.00</td>
        <td><strong>0.68</strong></td>
        <td>Controla a variabilidade melódica. Muito alto (&gt;0.80) gera instabilidade; muito baixo (&lt;0.50) soa mecânico. 0.68 traz o calor humano exato.</td>
      </tr>
      <tr>
        <td><code>speed</code></td>
        <td>0.70x a 1.50x</td>
        <td><strong>1.02x</strong></td>
        <td>Interpolação linear dos <code>gpt_latents</code>. Ajusta o ritmo sem alterar o tom da voz (sem voz de esquilo ou voz desacelerada).</td>
      </tr>
      <tr>
        <td><code>repetition_penalty</code></td>
        <td>1.0 a 10.0</td>
        <td><strong>4.0 a 4.5</strong></td>
        <td><strong>Anti-Gagueira:</strong> No padrão 2.0 o modelo repete sílabas em português. Subindo para 4.0 elimina 100% dos travamentos fonéticos.</td>
      </tr>
      <tr>
        <td><code>top_k</code> / <code>top_p</code></td>
        <td>10-100 / 0.5-1.0</td>
        <td><strong>50 / 0.85</strong></td>
        <td>Amostragem de núcleo: restringe a cauda de probabilidades para impedir fonemas com sotaques bizarros ou ruídos.</td>
      </tr>
      <tr>
        <td><code>split_sentences</code></td>
        <td>Boolean</td>
        <td><strong>True</strong></td>
        <td>Gera cada oração individualmente e costura com respiração natural de locutor profissional.</td>
      </tr>
    </tbody>
  </table>

  <div class="subsection-title">3.2 Os 4 Presets Homologados no Voice Studio da Germani</div>
  <div class="grid-2">
    <div class="cover-card" style="border-left: 4px solid #007BFF;">
      <div class="cover-card-title">
        <span>⭐ OpenAI Natural (ChatGPT)</span>
        <span class="table-badge badge-blue">Recomendado</span>
      </div>
      <p class="cover-card-desc">
        <strong>T: 0.68 | V: 1.02x | Rep: 4.0 | K: 50 | P: 0.85</strong><br />
        Equilíbrio harmônico máximo. Dicção clara, respiração orgânica, calor e prosódia sem nenhuma repetição.
      </p>
    </div>

    <div class="cover-card" style="border-left: 4px solid #10B981;">
      <div class="cover-card-title">
        <span>⚡ Conversa Ágil (WhatsApp / CRM)</span>
        <span class="table-badge badge-green">Alta Velocidade</span>
      </div>
      <p class="cover-card-desc">
        <strong>T: 0.72 | V: 1.10x | Rep: 4.5 | K: 50 | P: 0.80</strong><br />
        Cadência acelerada e objetiva para mensagens de voz em atendimento comercial sem perder humanização.
      </p>
    </div>

    <div class="cover-card" style="border-left: 4px solid #6366F1;">
      <div class="cover-card-title">
        <span>🏛️ Executiva Soberana</span>
        <span class="table-badge badge-purple">C-Level</span>
      </div>
      <p class="cover-card-desc">
        <strong>T: 0.62 | V: 0.98x | Rep: 5.0 | K: 45 | P: 0.85</strong><br />
        Tom firme, seguro e aveludado com cadência calculada para reuniões estratégicas e tomada de decisão.
      </p>
    </div>

    <div class="cover-card" style="border-left: 4px solid #F59E0B;">
      <div class="cover-card-title">
        <span>🎬 Expressiva & Pitch</span>
        <span class="table-badge badge-amber">Apresentações</span>
      </div>
      <p class="cover-card-desc">
        <strong>T: 0.78 | V: 1.00x | Rep: 3.5 | K: 60 | P: 0.90</strong><br />
        Maior amplitude melódica e entonação expressiva para vídeos de vendas, demonstrações e anúncios.
      </p>
    </div>
  </div>

  <div class="doc-footer">
    <span>BipeSend — Documento de Engenharia de Voz</span>
    <span>Página 4</span>
  </div>

  <div class="page-break"></div>

  <!-- ══════════════════════════════════════════════════════════════════ -->
  <!-- PÁGINA 5: AGENTES MESTRE & ARQUITETURA MULTI-TENANT              -->
  <!-- ══════════════════════════════════════════════════════════════════ -->
  <div class="doc-header">
    <div class="logo-area">
      <span class="brand-name">BIPESEND</span>
      <span style="font-size: 10px; color: #94A3B8; font-weight: 600;">| Agentes Mestre & Multi-Tenant</span>
    </div>
    <div class="meta">
      <span>Seção 04 • Isolamento & Distribuição</span>
    </div>
  </div>

  <div class="section-title">
    <div class="bar"></div>
    <span>4. Vozes dos Agentes Mestre & Clonagem Multi-Tenant</span>
  </div>

  <p class="section-desc">
    A arquitetura da BipeSend separa rigorosamente as vozes globais da plataforma das vozes personalizadas clonadas por cada empresa (tenant). Isso garante conformidade com a LGPD e previne qualquer vazamento de áudio ou timbre entre clientes.
  </p>

  <div class="subsection-title">4.1 Classificação das Vozes</div>
  <table>
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Identificador Exemplo</th>
        <th>Escopo</th>
        <th>Armazenamento</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Built-in (Globais)</strong></td>
        <td><code>germani</code>, <code>pt-BR-natural-lucas</code>, <code>pt-BR-natural-sofia</code></td>
        <td>Disponíveis para todos os tenants da plataforma.</td>
        <td>Diretório <code>app/voices/</code> + Manifesto <code>voices.json</code>.</td>
      </tr>
      <tr>
        <td><strong>Cloned (Personalizadas)</strong></td>
        <td><code>cloned_0f8a92b_1727289900</code></td>
        <td>Exclusivas do tenant que realizou o upload.</td>
        <td>Diretório <code>app/speakers/</code> + Isolamento por <code>tenant_id</code>.</td>
      </tr>
    </tbody>
  </table>

  <div class="subsection-title">4.2 Fluxo de Clonagem Instantânea de Voz</div>
  <p>Quando um usuário cria um agente ou clona uma voz na plataforma:</p>
  <ol>
    <li><strong>Upload do Áudio Amostra:</strong> O cliente envia um áudio de 3 a 30 segundos (MP3, WAV, OGG, M4A ou gravação direta do microfone).</li>
    <li><strong>Validação & Limpeza:</strong> O sistema checa ruído, duração mínima e converte para PCM WAV mono a 22.050 Hz.</li>
    <li><strong>Extração de Speaker Embedding:</strong> O XTTS v2 processa o áudio e gera os tensores latentes de fonação do locutor.</li>
    <li><strong>Isolamento Multi-Tenant:</strong> Um arquivo JSON de metadados é criado registrando o <code>tenant_id</code> do proprietário.</li>
    <li><strong>Backup em Nuvem (Cloudflare R2):</strong> Se ativado, o áudio é sincronizado para o bucket R2 seguro, permitindo recuperação instantânea em caso de migração de servidor.</li>
  </ol>

  <div class="subsection-title">4.3 Studio Preview vs. Disparo no WhatsApp / CRM</div>
  <div class="grid-2">
    <div class="callout callout-blue">
      <strong>Prévia no Estúdio (/germani ou /ai-agents):</strong><br />
      Volátil e ultrarrápida. Os bytes de áudio são convertidos em Base64 na memória RAM e o arquivo temporário é deletado na hora do disco (<code>output_path.unlink()</code>). Não acumula lixo no banco de dados e usa <code>no_cache: true</code> para garantir que cada teste seja gerado ao vivo com os sliders da tela.
    </div>
    <div class="callout callout-emerald">
      <strong>Disparo no Chat / WhatsApp Direct:</strong><br />
      Persistente e seguro. O arquivo de áudio final sintetizado é enviado para o bucket de mídia permanente gerando uma URL segura. O áudio é convertido com o codec oficial Opus (<code>audio/ogg; codecs=opus</code>) para que a Meta entregue ao celular do cliente como uma nota de voz verde nativa com forma de onda reproduzível.
    </div>
  </div>

  <div class="doc-footer">
    <span>BipeSend — Documento de Engenharia de Voz</span>
    <span>Página 5 • Fim do Documento</span>
  </div>

</body>
</html>
`;

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

try {
  console.log('Gerando PDF executivo de clonagem de voz via Chrome/Edge Headless...');
  execFileSync(browserPath, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${outputPath}`,
    tempHtmlPath
  ]);

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`[SUCESSO] PDF gerado em raiz: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
    // Copiar também para docs/
    fs.copyFileSync(outputPath, docsOutputPath);
    console.log(`[SUCESSO] Cópia salva em docs: ${docsOutputPath}`);
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
