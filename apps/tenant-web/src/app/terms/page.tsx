import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço - BipeSend",
  description: "Termos de Serviço da plataforma BipeSend.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-50)] text-[var(--color-ink-900)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-[var(--color-border-200)] overflow-hidden">
        <div className="bg-gradient-to-r from-[#007BFF] to-[#6366F1] py-16 px-8 text-center text-white">
          <h1 className="text-4xl font-bold font-inter mb-4">Termos de Serviço</h1>
          <p className="text-lg opacity-90">Última atualização: 12 de Setembro de 2026</p>
        </div>
        
        <div className="p-8 sm:p-12 space-y-8 font-poppins text-[15px] leading-relaxed text-[var(--color-ink-700)]">
          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar os serviços da plataforma BipeSend, você concorda em cumprir estes Termos de Serviço. 
              Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">2. Uso do Serviço</h2>
            <p>
              O BipeSend fornece uma plataforma avançada para comunicação. Você concorda em usar o serviço apenas 
              para fins legais e de acordo com todas as leis e regulamentos aplicáveis. É estritamente proibido o uso 
              da plataforma para o envio de mensagens de ódio, spam, conteúdos enganosos ou ilegais.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">3. Contas de Usuário</h2>
            <p>
              Para acessar os recursos da plataforma, você precisará criar uma conta. Você é integralmente responsável 
              por manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorrem na sua conta.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">4. Propriedade Intelectual</h2>
            <p>
              A interface visual, o código, as marcas e todos os direitos de propriedade intelectual relacionados ao 
              BipeSend são de nossa propriedade. Você não tem permissão para copiar, modificar, distribuir ou vender 
              nenhuma parte de nossos serviços ou software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-inter text-[var(--color-ink-900)] mb-4">5. Limitação de Responsabilidade</h2>
            <p>
              O BipeSend não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou 
              punitivos decorrentes de ou relacionados ao seu uso (ou incapacidade de uso) do serviço.
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
