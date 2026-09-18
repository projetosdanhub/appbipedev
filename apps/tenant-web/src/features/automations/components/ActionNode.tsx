import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { useAutomationContext } from '../context/automation-context';

export function ActionNode({ id, data }: { id: string; data: any }) {
  const { openNodeConfig } = useAutomationContext();

  return (
    <div className="w-[320px] rounded-[24px] bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl z-10 select-none border border-blue-500/30 hover:border-blue-500/60 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(59,130,246,0.2)] group">
      <div className="absolute inset-0 rounded-[24px] bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500/50 flex items-center justify-center shadow-sm -top-3"
      />
      
      <div className="p-5 border-b border-blue-500/10 flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent rounded-t-[24px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#25D366]/20 to-[#25D366]/10 flex items-center justify-center shadow-inner border border-[#25D366]/20">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
          </div>
          <span className="text-[16px] font-bold text-[#0F172A] dark:text-white">{data.label || 'Enviar Mensagem'}</span>
        </div>
        <button
          type="button"
          aria-label="Abrir configurações da ação"
          onClick={(e) => {
            e.stopPropagation();
            openNodeConfig(id);
          }}
          className="p-1.5 rounded-lg hover:bg-blue-500/10 dark:hover:bg-white/10 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors focus:outline-none"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>
      <div className="p-5 relative z-10">
        <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] relative before:absolute before:left-[-7px] before:top-4 before:w-3.5 before:h-3.5 before:bg-[#F8FAFC] dark:before:bg-[#0F172A] before:border-l before:border-b before:border-[#E2E8F0] dark:before:border-[#334155] before:rotate-45 shadow-sm">
          <p className="text-[14px] text-[#475569] dark:text-[#CBD5E1] italic leading-relaxed relative z-10">
            {data.message || '"Ol\u00e1 [Nome], vimos que voc\u00ea deixou algo no carrinho..."'}
          </p>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-blue-500 flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse -bottom-3"
      >
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
      </Handle>
    </div>
  );
}
