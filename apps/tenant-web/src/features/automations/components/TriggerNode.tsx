import { Handle, Position, NodeProps } from '@xyflow/react';
import { DollarSign, MoreHorizontal } from 'lucide-react';
import { useAutomationContext } from '../context/automation-context';

export function TriggerNode({ id, data }: { id: string; data: any }) {
  const { openNodeConfig } = useAutomationContext();

  return (
    <div className="w-[320px] rounded-[24px] bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl z-10 select-none border border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(16,185,129,0.2)] hover:border-emerald-500/60 group">
      <div className="absolute inset-0 rounded-[24px] bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="p-5 border-b border-emerald-500/10 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/30 dark:to-transparent rounded-t-[24px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center shadow-inner border border-emerald-500/20">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[16px] font-bold text-[#0F172A] dark:text-white">{data.label || 'Carrinho Abandonado'}</span>
        </div>
        <button
          type="button"
          aria-label="Abrir configurações da automação"
          onClick={(e) => {
            e.stopPropagation();
            openNodeConfig(id);
          }}
          className="p-1.5 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-white/10 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors focus:outline-none"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>
      <div className="p-5">
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed relative z-10">
          {data.description || 'Dispara quando o lead chega no checkout e n\u00e3o finaliza a compra em 30 min.'}
        </p>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500 flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse -bottom-3"
      />
    </div>
  );
}
