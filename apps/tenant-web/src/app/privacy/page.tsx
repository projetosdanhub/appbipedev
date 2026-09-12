import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade - BipeSend",
  description: "Política de Privacidade da plataforma BipeSend.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-50)] text-[var(--color-ink-900)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[var(--color-border-200)] overflow-hidden">
        <div className="bg-gradient-to-r from-[#007BFF] to-[#6366F1] py-16 px-8 text-center text-white">
          <h1 className="text-4xl font-bold font-inter mb-4">Política de Privacidade</h1>
          <p className="text-lg opacity-90">Última atualização: 12 de Setembro de 2026</p>
        </div>
        
        <div className="p-8 sm:p-12 space-y-8 font-poppins text-[15px] leading-relaxed text-[var(--color-ink-700)]">
          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">1. Coleta de Informações</h2>
            <p>
              Coletamos informações pessoais que você nos fornece voluntariamente ao se registrar no serviço, 
              ao preencher formulários e ao interagir com a plataforma. Isso inclui seu nome, e-mail e dados de uso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">2. Uso de Informações</h2>
            <p>
              Usamos as informações coletadas para fornecer, operar, manter e melhorar nossos serviços. Isso inclui 
              personalizar sua experiência e enviar atualizações técnicas ou avisos de segurança importantes.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">3. Compartilhamento de Dados</h2>
            <p>
              Nós prezamos pela sua privacidade e <strong>não vendemos seus dados</strong> para terceiros. 
              Suas informações só são compartilhadas com provedores de serviço de confiança (como servidores de hospedagem) 
              e apenas o estritamente necessário para manter a plataforma funcionando, ou em resposta a exigências legais.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">4. Segurança</h2>
            <p>
              Implementamos medidas técnicas e organizacionais avançadas projetadas para proteger suas informações 
              pessoais. No entanto, lembre-se que nenhum sistema na internet é 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, atualizar, corrigir e solicitar a exclusão de suas informações pessoais. 
              Sempre que possível, essas ações podem ser realizadas diretamente nas configurações da sua conta.
            </p>
          </section>
          
          <div className="pt-8 mt-8 border-t border-[var(--color-border-200)] text-center">
            <a href="/login" className="text-[#007BFF] font-medium hover:underline">
              Voltar para o Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
