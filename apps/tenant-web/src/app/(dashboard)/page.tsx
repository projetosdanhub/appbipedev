export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold leading-[36px]">Visão Geral</h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-[var(--color-surface-0)] border border-[var(--color-border-200)] rounded-[10px]">
          <h3 className="text-[16px] font-semibold text-[var(--color-ink-900)]">Mensagens</h3>
          <p className="mt-2 text-[32px] font-bold text-[var(--color-brand-600)]">0</p>
        </div>
        
        <div className="p-6 bg-[var(--color-surface-0)] border border-[var(--color-border-200)] rounded-[10px]">
          <h3 className="text-[16px] font-semibold text-[var(--color-ink-900)]">Atendimentos</h3>
          <p className="mt-2 text-[32px] font-bold text-[var(--color-success-600)]">0</p>
        </div>
        
        <div className="p-6 bg-[var(--color-surface-0)] border border-[var(--color-border-200)] rounded-[10px]">
          <h3 className="text-[16px] font-semibold text-[var(--color-ink-900)]">Usuários Ativos</h3>
          <p className="mt-2 text-[32px] font-bold text-[var(--color-brand-600)]">1</p>
        </div>
      </div>
    </div>
  );
}
