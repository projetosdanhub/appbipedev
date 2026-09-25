import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, KeyRound, Mail, UserCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade & LGPD | BipeSend Oficial",
  description: "Política de Privacidade, Governança de Dados e Conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/18) da BipeSend.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-10 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-[0_12px_40px_rgba(15,23,42,0.06)] border border-slate-200/90 overflow-hidden">
        
        {/* Topo Institucional */}
        <div className="bg-gradient-to-r from-[#007BFF] via-[#4F46E5] to-[#6366F1] py-14 px-6 sm:px-12 text-center text-white relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-4 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Conformidade com a Lei nº 13.709/2018 (LGPD)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-inter tracking-tight mb-2">
            Política de Privacidade &amp; Proteção de Dados
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto font-normal">
            Compromisso de Transparência, Segurança e Direitos dos Titulares de Dados
          </p>
        </div>
        
        {/* Conteúdo Detalhado */}
        <div className="p-6 sm:p-12 space-y-8 text-[14px] sm:text-[15px] leading-relaxed text-slate-700">
          
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3.5 text-xs sm:text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              A <strong>BipeSend Tecnologia Ltda.</strong> preza pela total confidencialidade e segurança dos dados sob sua custódia. Nós <strong>não comercializamos, não alugamos e não compartilhamos</strong> informações de nossos clientes ou de seus leads com terceiros para fins publicitários.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">01</span>
              Papéis na LGPD: Controlador e Operador
            </h2>
            <p>
              Para os fins da <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>BipeSend como Controladora:</strong> atuamos como Controladora em relação aos dados cadastrais dos nossos clientes diretos (nome, e-mail comercial, CNPJ, faturamento e dados de acesso ao painel).
              </li>
              <li>
                <strong>BipeSend como Operadora:</strong> atuamos estritamente como Operadora em relação às mensagens, áudios, mídias e leads processados através das integrações de mensageria (WhatsApp, Instagram, TikTok) em nome do Contratante. O Contratante é o Controlador de sua respectiva base de leads.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">02</span>
              Dados Coletados e Finalidades
            </h2>
            <p>
              Coletamos e tratamos exclusivamente os dados necessários para o cumprimento do serviço contratado:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-xs text-slate-800 block">Dados Cadastrais da Conta:</span>
                <p className="text-xs text-slate-600">
                  Nome, e-mail, telefone corporativo, razão social e senha criptografada via hash seguro (Argon2 / Bcrypt).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-xs text-slate-800 block">Logs de Auditoria e Acesso:</span>
                <p className="text-xs text-slate-600">
                  Endereço IP, data/hora de login, identificador do dispositivo e navegador, para cumprimento do Marco Civil da Internet.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-xs text-slate-800 block">Conteúdo das Mensagens &amp; CRM:</span>
                <p className="text-xs text-slate-600">
                  Histórico de mensagens de texto, notas, arquivos enviados e metadados de negociação para operacionalização do CRM.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-xs text-slate-800 block">Dados de Áudio &amp; Voz:</span>
                <p className="text-xs text-slate-600">
                  Amostras de voz e vetores acústicos processados localmente em servidores dedicados para síntese vocal da agente.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">03</span>
              Segurança da Informação e Criptografia
            </h2>
            <p>
              Adotamos salvaguardas técnicas e administrativas de ponta para impedir acessos não autorizados, vazamentos ou destruição ilícita de dados:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Criptografia de tráfego de ponta a ponta via protocolos TLS 1.3 e HTTPS obrigatório.</li>
              <li>Criptografia em repouso (AES-256) para senhas, tokens de autenticação da Meta/TikTok e credenciais de webhook.</li>
              <li>Isolamento lógico multitenant garantindo que os dados de um cliente jamais sejam visíveis ou acessíveis por outro tenant.</li>
              <li>Backups diários automatizados e retenção controlada de logs com expiração periódica.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">04</span>
              Direitos dos Titulares de Dados (Art. 18 da LGPD)
            </h2>
            <p>
              O titular dos dados pessoais tem direito a obter da BipeSend, a qualquer momento e mediante requisição facilitada:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <span className="p-2 rounded-lg bg-slate-100 font-medium">✓ Confirmação de tratamento</span>
              <span className="p-2 rounded-lg bg-slate-100 font-medium">✓ Acesso aos dados</span>
              <span className="p-2 rounded-lg bg-slate-100 font-medium">✓ Correção de dados incompletos</span>
              <span className="p-2 rounded-lg bg-slate-100 font-medium">✓ Anonimização ou bloqueio</span>
              <span className="p-2 rounded-lg bg-slate-100 font-medium">✓ Portabilidade de dados</span>
              <span className="p-2 rounded-lg bg-slate-100 font-medium">✓ Eliminação de dados tratados</span>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">05</span>
              Política de Cookies e Armazenamento Local
            </h2>
            <p>
              Utilizamos cookies e tecnologias similares exclusivamente para manter sua sessão de autenticação ativa, lembrar preferências de navegação e garantir a integridade dos formulários contra ataques do tipo CSRF. Você pode gerenciar ou desabilitar cookies a qualquer momento nas configurações do seu navegador ou no banner de consentimento no rodapé.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold font-inter text-[#0F172A] flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">06</span>
              Canal de Atendimento do Encarregado de Dados (DPO)
            </h2>
            <p>
              Para exercer qualquer dos seus direitos previstos na LGPD, esclarecer dúvidas sobre esta Política ou relatar qualquer incidente de segurança, entre em contato direto com o nosso Encarregado de Proteção de Dados:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-[#007BFF]" />
                <div>
                  <span className="font-bold text-slate-900 block">Encarregado pelo Tratamento de Dados (DPO):</span>
                  <span className="text-slate-500">privacidade@bipesend.com.br / dpo@bipesend.com.br</span>
                </div>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-[#007BFF] px-2.5 py-1 rounded-md border border-blue-200">
                Prazo de Resposta: até 48h úteis
              </span>
            </div>
          </section>

          {/* Rodapé Interno */}
          <div className="pt-8 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Dados hospedados em data centers com certificação ISO 27001 e SOC 2</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-[#007BFF] hover:underline font-semibold">
                Ver Termos de Uso
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
