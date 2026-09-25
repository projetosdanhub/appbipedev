import { Handle, Position } from "@xyflow/react";
import { 
  DollarSign, 
  MoreHorizontal, 
  MessageCircle, 
  Heart, 
  MessageSquare,
  Sparkles,
  Zap,
  Clock,
  Video
} from "lucide-react";
import { InstagramIcon, TikTokIcon } from "./social-icons";
import { useAutomationContext } from "../context/automation-context";

export function TriggerNode({ id, data }: { id: string; data: any }) {
  const { openNodeConfig } = useAutomationContext();

  const label = data.label || "Gatilho de Entrada";
  const channel = data.channel || (label.toLowerCase().includes("instagram") ? "instagram" : label.toLowerCase().includes("tiktok") ? "tiktok" : label.toLowerCase().includes("whatsapp") ? "whatsapp" : "sales");
  const isOptional = data.isOptional ?? (label.toLowerCase().includes("opcional") || label.toLowerCase().includes("reação") || label.toLowerCase().includes("comentário"));

  // Configurações visuais por canal
  const getVisuals = () => {
    switch (channel) {
      case "instagram":
        return {
          border: "border-pink-500/30 hover:border-pink-500/60 hover:shadow-[0_12px_40px_rgba(225,48,108,0.2)]",
          glow: "bg-pink-500/5",
          headerBg: "bg-gradient-to-r from-pink-50 via-purple-50/40 to-transparent dark:from-pink-950/30 dark:via-purple-950/20 dark:to-transparent",
          headerBorder: "border-pink-500/10",
          iconFrame: "bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/30 border-pink-500/20",
          icon: <InstagramIcon className="w-5 h-5 text-[#E1306C]" />,
          tagBg: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
          handleColor: "border-[#E1306C]",
          defaultDesc: isOptional
            ? "Dispara opcionalmente quando o lead reage a stories ou comenta em posts, sem poluir o CRM."
            : "Dispara automaticamente quando o cliente envia mensagem direta no Instagram.",
        };
      case "tiktok":
        return {
          border: "border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_12px_40px_rgba(6,182,212,0.2)]",
          glow: "bg-cyan-500/5",
          headerBg: "bg-gradient-to-r from-cyan-50 via-slate-50 to-transparent dark:from-cyan-950/30 dark:via-slate-900/20 dark:to-transparent",
          headerBorder: "border-cyan-500/10",
          iconFrame: "bg-gradient-to-br from-cyan-100 to-slate-100 dark:from-cyan-900/40 dark:to-slate-800 border-cyan-500/20",
          icon: <TikTokIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
          tagBg: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
          handleColor: "border-cyan-500",
          defaultDesc: isOptional
            ? "Dispara opcionalmente quando alguém comenta em seus vídeos do TikTok."
            : "Dispara automaticamente quando o lead envia mensagem direta no TikTok.",
        };
      case "whatsapp":
        return {
          border: "border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_12px_40px_rgba(16,185,129,0.2)]",
          glow: "bg-emerald-500/5",
          headerBg: "bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/30 dark:to-transparent",
          headerBorder: "border-emerald-500/10",
          iconFrame: "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 border-emerald-500/20",
          icon: <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          tagBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          handleColor: "border-emerald-500",
          defaultDesc: "Dispara imediatamente quando uma nova conversa é iniciada no WhatsApp.",
        };
      default:
        return {
          border: "border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_12px_40px_rgba(16,185,129,0.2)]",
          glow: "bg-emerald-500/5",
          headerBg: "bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/30 dark:to-transparent",
          headerBorder: "border-emerald-500/10",
          iconFrame: "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 border-emerald-500/20",
          icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          tagBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          handleColor: "border-emerald-500",
          defaultDesc: "Dispara quando o lead chega no checkout e não finaliza a compra em 30 min.",
        };
    }
  };

  const visuals = getVisuals();

  return (
    <div className={`w-[330px] rounded-[24px] bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl z-10 select-none border ${visuals.border} transition-all hover:-translate-y-1 group relative shadow-xs`}>
      <div className={`absolute inset-0 rounded-[24px] ${visuals.glow} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
      
      <div className={`p-4 border-b ${visuals.headerBorder} flex items-center justify-between ${visuals.headerBg} rounded-t-[24px]`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${visuals.iconFrame} flex items-center justify-center shadow-xs border`}>
            {visuals.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-[#0F172A] dark:text-white leading-tight">{label}</span>
            </div>
            {isOptional ? (
              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border mt-0.5 ${visuals.tagBg}`}>
                Gatilho Opcional
              </span>
            ) : (
              <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border mt-0.5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
                Gatilho Principal
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label="Abrir configurações da automação"
          onClick={(e) => {
            e.stopPropagation();
            openNodeConfig(id);
          }}
          className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors focus:outline-none"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed relative z-10">
          {data.description || visuals.defaultDesc}
        </p>

        {data.filterKeyword && (
          <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Palavra-chave:</span>
            <span className="text-pink-600 dark:text-pink-400 font-bold">"{data.filterKeyword}"</span>
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className={`w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] ${visuals.handleColor} flex items-center justify-center shadow-xs hover:scale-125 transition-transform group-hover:animate-pulse -bottom-3`}
      />
    </div>
  );
}
