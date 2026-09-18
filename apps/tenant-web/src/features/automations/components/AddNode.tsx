import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@bipesend/ui';

const CATEGORIES = [
  {
    title: "Vendas & Conversão",
    items: [
      { id: "cart", label: "Carrinho Abandonado" },
      { id: "payment", label: "Pagamento Recusado" },
    ]
  },
  {
    title: "Engajamento",
    items: [
      { id: "no_reply_24", label: "Sem resposta em 24h" },
    ]
  }
];

export function AddNode({ data }: { data: any }) {
  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <div className="w-16 h-16 bg-white/70 dark:bg-[#1E293B]/70 backdrop-blur-xl border-[3px] border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-full shadow-sm z-10 hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] hover:border-[#0A74FF] hover:shadow-[0_12px_40px_rgba(10,116,255,0.2)] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center group">
          <Handle 
            type="target" 
            position={Position.Top} 
            className="w-3 h-3 bg-red-500 rounded-full opacity-30 group-hover:opacity-100 transition-opacity -top-1.5"
          />
          <Plus className="w-7 h-7 text-[#94A3B8] group-hover:text-[#0A74FF] transition-colors" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="center" 
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-[280px] p-0 mt-3 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="p-3 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">Ação</h3>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Escolha o próximo passo</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <h4 className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5 px-2">{cat.title}</h4>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <button key={item.id} className="w-full flex items-center gap-3 p-2 bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-lg transition-colors text-left group">
                    <span className="text-[13px] font-medium text-[#0F172A] dark:text-[#E2E8F0]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
