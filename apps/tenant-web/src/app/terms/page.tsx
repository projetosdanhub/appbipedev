import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, Lock, Scale, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Uso e Serviço | BipeSend Oficial",
  description: "Termos e Condições Gerais de Uso dos Serviços e Plataforma SaaS BipeSend Tecnologia Ltda.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-[0_12px_40px_rgba(15,23,42,0.06)] border border-slate-200/90 overflow-hidden">
        
        {/* Topo Institucional com Gradiente Oficial BipeSend */}
        <div className="bg-gradient-to-r from-[#007BFF] via-[#4F46E5] to-[#6366F1] py-14 px-6 sm:px-12 text-center text-white relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-4 border border-white/20">
            <Scale className="w-3.5 h-3.5 text-blue-200" />
            <span>Contrato de Licenciamento SaaS &amp; Prestação de Serviços</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-inter tracking-tight mb-2">
            Termos de Uso &amp; Condições Gerais
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto font-normal">
            BipeSend Tecnologia Ltda. • Versão 2.4 consolidada em 23 de Setembro de 2026
          </p>
        </div>
        
        {/* Corpo do Contrato em Seções Detalhadas */}
        <div className="p-6 sm:p-12 space-y-8 text-[14px] sm:text-[15px] leading-relaxed text-slate-700">
          
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-3.5 text-xs sm:text-sm text-slate-700">
            <ShieldCheck className="w-5 h-5 text-[#007BFF] shrink-0 mt-0.5" />
            <p>
              Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma <strong>BipeSend</strong> (incluindo Agentes de IA, CRM Bipe Plus, Conectores WhatsApp Oficial, Instagram Direct, TikTok e Disparos em Massa), você declara ciência e aceite integral das cláusulas abaixo.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">01</span>
              Definições e Partes Contratantes
            </h2>
            <p>
              Estes Termos de Uso regulam o relacionamento entre a <strong>BIPESEND TECNOLOGIA LTDA.</strong>, inscrita no CNPJ/ME sob regime regular, sediada em São Paulo/SP (doravante denominada &quot;BipeSend&quot; ou &quot;Plataforma&quot;), e a pessoa física ou jurídica devidamente cadastrada (doravante denominada &quot;Contratante&quot; ou &quot;Usuário&quot;).
            </p>
            <p>
              A BipeSend disponibiliza uma solução de software como serviço (SaaS) especializada em atendimento inteligente multicanal, agentes de inteligência artificial autônomas, construtor de pipelines lógicas, síntese e clonagem de voz, caixa unificada de mensagens e gestão de oportunidades de vendas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">02</span>
              Licenciamento e Escopo de Utilização
            </h2>
            <p>
              A BipeSend concede ao Usuário uma licença limitada, não exclusiva, intransferível e revogável de acesso à plataforma, de acordo com os limites técnicos do plano contratado (volume de mensagens, instâncias de WhatsApp, agentes ativas e membros da equipe).
            </p>
            <p>
              O Usuário compromete-se a utilizar a plataforma estritamente em conformidade com a legislação brasileira vigente, em especial o <strong>Marco Civil da Internet (Lei nº 12.965/2014)</strong> e a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">03</span>
              Políticas de Mensageria e Proteção Anti-Spam
            </h2>
            <p>
              A BipeSend mantém política de tolerância zero contra a prática de <strong>Spam</strong> (mensagens não solicitadas e massivas sem o consentimento prévio do destinatário / opt-in).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>O Contratante é o único responsável pela legitimidade da base de contatos importada na plataforma.</li>
              <li>É expressamente proibido o envio de mensagens contendo conteúdo ofensivo, pornográfico, fraudulento, jogos de azar ilegais ou que violem as Diretrizes de Comércio da Meta, WhatsApp, Instagram ou TikTok.</li>
              <li>A BipeSend reserva-se o direito de suspender temporária ou definitivamente contas que apresentem taxas anômalas de denúncia e bloqueio, visando a preservação da reputação de rede e IP.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">04</span>
              Autonomia dos Agentes de IA e Envio de Voz
            </h2>
            <p>
              As agentes virtuais e modelos de voz disponibilizados processam prompts e bases de conhecimento fornecidos pelo próprio Contratante. O Usuário é responsável por auditar as respostas geradas e calibrar as diretrizes de conduta comercial de sua agente.
            </p>
            <p>
              A tecnologia de clonagem e síntese de voz (TTS) deve ser utilizada exclusivamente com amostras de áudio de titularidade do Contratante ou mediante expressa autorização do portador da voz gravada, sendo vedada a emulação não autorizada de figuras públicas ou terceiros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">05</span>
              Planos, Faturamento e Cancelamento
            </h2>
            <p>
              Os serviços são faturados sob a modalidade de assinatura pré-paga (mensal ou anual). Todos os planos anuais concedem o benefício promocional de 2 (dois) meses grátis calculados automaticamente na contratação.
            </p>
            <p>
              O Usuário pode cancelar sua assinatura a qualquer momento através do painel de controle do tenant. O cancelamento interrompe cobranças subsequentes, mantendo o acesso ativo até o término do ciclo previamente quitado, sem incidência de multas rescisórias.
            </p>
            <p>
              Em conformidade com o <strong>Art. 49 do Código de Defesa do Consumidor</strong>, o Usuário goza de 7 (sete) dias de garantia incondicional na primeira contratação, com reembolso integral mediante solicitação ao suporte.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">06</span>
              Disponibilidade de Serviço (SLA) &amp; Segurança
            </h2>
            <p>
              A BipeSend emprega arquitetura redundante em nuvem com meta de disponibilidade (SLA) de <strong>99,9%</strong> ao mês, ressalvadas janelas programadas de manutenção técnica previamente notificadas e indisponibilidades oriundas de falhas das próprias redes das operadoras de telecomunicação ou provedores de API terceiros (Meta/TikTok).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">07</span>
              Foro e Legislação Aplicável
            </h2>
            <p>
              Este instrumento é regido pelas leis da República Federativa do Brasil. Para dirimir quaisquer litígios oriundos deste contrato, as partes elegem o Foro Central da Comarca de São Paulo/SP, com expressa renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          {/* Rodapé Interno */}
          <div className="pt-8 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Conexão criptografada TLS 1.3 • Documento registrado</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-[#007BFF] hover:underline font-semibold">
                Ver Política de Privacidade &amp; LGPD
              </Link>
              <Link href="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium">
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à Página Inicial
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
