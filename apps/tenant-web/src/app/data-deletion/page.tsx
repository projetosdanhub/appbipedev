import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exclusão de Dados do Usuário - BipeSend",
  description: "Instruções de solicitação de exclusão de dados do usuário (Meta / Facebook Platform e LGPD).",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-50)] text-[var(--color-ink-900)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[var(--color-border-200)] overflow-hidden">
        <div className="bg-gradient-to-r from-[#007BFF] to-[#6366F1] py-16 px-8 text-center text-white">
          <h1 className="text-3xl sm:text-4xl font-bold font-inter mb-4">
            Instruções de Exclusão de Dados do Usuário
          </h1>
          <p className="text-base sm:text-lg opacity-90">
            Conformidade com a Plataforma Meta (Facebook & Instagram) e LGPD
          </p>
        </div>
        
        <div className="p-8 sm:p-12 space-y-8 font-poppins text-[15px] leading-relaxed text-[var(--color-ink-700)]">
          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-3">
              1. Compromisso com a Privacidade
            </h2>
            <p>
              O <strong>BipeSend</strong> respeita a privacidade de todos os seus usuários e clientes. De acordo com as diretrizes da Plataforma Meta para Desenvolvedores e com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem o direito total de solicitar a remoção permanente de suas informações pessoais e credenciais de acesso associadas aos nossos aplicativos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-3">
              2. Como Excluir Seus Dados Vinculados ao Facebook / Instagram
            </h2>
            <p className="mb-4">
              Se você utilizou o Login do Facebook ou autorizou a conexão de canais do Instagram no BipeSend e deseja remover suas atividades e permissões, siga os passos abaixo diretamente no seu perfil:
            </p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li>Acesse sua conta no <strong>Facebook</strong> e vá em <strong>Configurações e Privacidade</strong> &gt; <strong>Configurações</strong>.</li>
              <li>No menu lateral esquerdo, clique em <strong>Aplicativos e Sites</strong>.</li>
              <li>Localize o aplicativo <strong>BipeSend</strong> na lista de aplicativos ativos.</li>
              <li>Clique no botão <strong>Remover</strong> ao lado do aplicativo.</li>
              <li>Marque a opção para excluir todas as postagens, fotos ou vídeos criados e confirme em <strong>Remover</strong>.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-3">
              3. Solicitação de Exclusão Completa de Conta e Registros
            </h2>
            <p className="mb-3">
              Para solicitar a exclusão definitiva de todo o seu histórico de atendimento, números, mensagens armazenadas, tokens de autenticação ou conta corporativa no BipeSend:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Envie um e-mail para <strong>privacidade@bipesend.com.br</strong> ou <strong>suporte@bipesend.com.br</strong> com o assunto <em>&quot;Solicitação de Exclusão de Dados - LGPD&quot;</em>.</li>
              <li>Informe o e-mail cadastrado ou ID da sua conta na plataforma.</li>
              <li>Nossa equipe de segurança processará a exclusão irreversível dos seus dados em nossos servidores em até 48 horas úteis e enviará um comprovante de confirmação.</li>
            </ul>
          </section>

          <div className="pt-8 mt-8 border-t border-[var(--color-border-200)] flex flex-wrap justify-between items-center gap-4">
            <a href="/privacy" className="text-[#007BFF] font-medium hover:underline text-sm">
              &larr; Ver Política de Privacidade
            </a>
            <a href="/login" className="text-[#007BFF] font-medium hover:underline text-sm">
              Voltar ao Início
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
