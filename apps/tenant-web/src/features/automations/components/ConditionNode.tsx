import { Handle, Position, NodeProps } from '@xyflow/react';
import { Filter, MoreHorizontal } from 'lucide-react';
import { useAutomationContext } from '../context/automation-context';

export function ConditionNode({ id, data }: { id: string; data: any }) {
  const { openNodeConfig } = useAutomationContext();

  return (
    <div className="w-[320px] rounded-[24px] bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl z-10 select-none border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(100,116,139,0.15)] group">
      <div className="absolute inset-0 rounded-[24px] bg-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500/50 flex items-center justify-center shadow-sm -top-3"
      />
      
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent rounded-t-[24px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700">
            <Filter className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </div>
          <span className="text-[16px] font-bold text-[#0F172A] dark:text-white">{data.label || 'Condição'}</span>
        </div>
        <button
          type="button"
          aria-label="Abrir configurações da condição"
          onClick={(e) => {
            e.stopPropagation();
            openNodeConfig(id);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-500/10 dark:hover:bg-white/10 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors focus:outline-none"
        >
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>
      <div className="p-5 relative z-10">
        <div className="inline-flex items-center px-4 py-2 rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] text-[14px] font-medium text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155] shadow-inner">
          {data.conditionText || 'Se Etiqueta contém VIP'}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="yes"
        className="w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500 flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse -bottom-3 left-[30%]"
      >
        <span className="text-[11px] font-extrabold text-emerald-600 absolute top-6 bg-white/95 dark:bg-[#1E293B]/95 px-2 py-0.5 rounded-md shadow-sm border border-emerald-100 dark:border-emerald-900/50">SIM</span>
      </Handle>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="no"
        className="w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-red-500 flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse -bottom-3 left-[70%]"
      >
        <span className="text-[11px] font-extrabold text-red-600 absolute top-6 bg-white/95 dark:bg-[#1E293B]/95 px-2 py-0.5 rounded-md shadow-sm border border-red-100 dark:border-red-900/50">NÃO</span>
      </Handle>
    </div>
  );
}
