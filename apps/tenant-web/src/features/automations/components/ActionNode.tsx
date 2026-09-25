import { Handle, Position } from "@xyflow/react";
import { MessageCircle, MoreHorizontal, Users, Tag, Inbox } from "lucide-react";
import { InstagramIcon } from "./social-icons";
import { useAutomationContext } from "../context/automation-context";

export function ActionNode({ id, data }: { id: string; data: any }) {
  const { openNodeConfig } = useAutomationContext();

  const label = data.label || "Enviar Mensagem";
  const actionType = data.actionType || (
    label.toLowerCase().includes("direct") || label.toLowerCase().includes("instagram") ? "instagram_direct" :
    label.toLowerCase().includes("crm") || label.toLowerCase().includes("oportunidade") || label.toLowerCase().includes("lead") ? "crm_deal" :
    label.toLowerCase().includes("tag") || label.toLowerCase().includes("etiqueta") ? "crm_tag" :
    label.toLowerCase().includes("inbox") || label.toLowerCase().includes("caixa") ? "inbox_open" :
    "whatsapp_message"
  );

  const getVisuals = () => {
    switch (actionType) {
      case "instagram_direct":
        return {
          border: "border-pink-500/30 hover:border-pink-500/60 hover:shadow-[0_12px_40px_rgba(225,48,108,0.15)]",
          glow: "bg-pink-500/5",
          headerBg: "bg-gradient-to-r from-pink-50 to-transparent dark:from-pink-950/30 dark:to-transparent",
          iconFrame: "bg-pink-100 dark:bg-pink-900/40 border-pink-500/20",
          icon: <InstagramIcon className="w-5 h-5 text-[#E1306C]" />,
          defaultText: '"Olá! Vimos seu comentário/reação no nosso perfil e preparamos uma condição exclusiva para você!"',
          handleColor: "border-[#E1306C]",
        };
      case "crm_deal":
        return {
          border: "border-indigo-500/30 hover:border-indigo-500/60 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)]",
          glow: "bg-indigo-500/5",
          headerBg: "bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/30 dark:to-transparent",
          iconFrame: "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500/20",
          icon: <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
          defaultText: "Criar novo card no funil de vendas (CRM Kanban) na coluna 'Primeiro Contato'.",
          handleColor: "border-indigo-500",
        };
      case "crm_tag":
        return {
          border: "border-amber-500/30 hover:border-amber-500/60 hover:shadow-[0_12px_40px_rgba(245,158,11,0.15)]",
          glow: "bg-amber-500/5",
          headerBg: "bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent",
          iconFrame: "bg-amber-100 dark:bg-amber-900/40 border-amber-500/20",
          icon: <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          defaultText: "Adicionar etiqueta: [Lead Qualificado - Redes Sociais]",
          handleColor: "border-amber-500",
        };
      case "inbox_open":
        return {
          border: "border-sky-500/30 hover:border-sky-500/60 hover:shadow-[0_12px_40px_rgba(14,165,233,0.15)]",
          glow: "bg-sky-500/5",
          headerBg: "bg-gradient-to-r from-sky-50 to-transparent dark:from-sky-950/30 dark:to-transparent",
          iconFrame: "bg-sky-100 dark:bg-sky-900/40 border-sky-500/20",
          icon: <Inbox className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
          defaultText: "Transferir atendimento para a Caixa de Entrada unificada com notificação à equipe.",
          handleColor: "border-sky-500",
        };
      default:
        return {
          border: "border-blue-500/30 hover:border-blue-500/60 hover:shadow-[0_12px_40px_rgba(59,130,246,0.15)]",
          glow: "bg-blue-500/5",
          headerBg: "bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent",
          iconFrame: "bg-emerald-100 dark:bg-emerald-900/40 border-[#25D366]/20",
          icon: <MessageCircle className="w-5 h-5 text-[#25D366]" />,
          defaultText: '"Olá [Nome], vimos que você tem interesse no nosso produto! Como posso te ajudar hoje?"',
          handleColor: "border-blue-500",
        };
    }
  };

  const visuals = getVisuals();

  return (
    <div className={`w-[330px] rounded-[24px] bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl z-10 select-none border ${visuals.border} transition-all hover:-translate-y-1 group relative shadow-xs`}>
      <div className={`absolute inset-0 rounded-[24px] ${visuals.glow} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
      
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500/50 flex items-center justify-center shadow-xs -top-3"
      />
      
      <div className={`p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${visuals.headerBg} rounded-t-[24px]`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${visuals.iconFrame} flex items-center justify-center shadow-xs border`}>
            {visuals.icon}
          </div>
          <span className="text-[14px] font-bold text-[#0F172A] dark:text-white">{label}</span>
        </div>
        <button
          type="button"
          aria-label="Abrir configurações da ação"
          onClick={(e) => {
            e.stopPropagation();
            openNodeConfig(id);
          }}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors focus:outline-none"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 relative z-10">
        <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] shadow-2xs">
          <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] italic leading-relaxed">
            {data.message || visuals.defaultText}
          </p>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] ${visuals.handleColor} flex items-center justify-center shadow-xs hover:scale-125 transition-transform group-hover:animate-pulse -bottom-3`}
      >
        <div className="w-2 h-2 bg-blue-500 rounded-full" />
      </Handle>
    </div>
  );
}
