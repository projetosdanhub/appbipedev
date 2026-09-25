import { Handle, Position } from "@xyflow/react";
import { Plus, MessageCircle, DollarSign, Users, Tag, Inbox, Heart, MessageSquare } from "lucide-react";
import { InstagramIcon, TikTokIcon } from "./social-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@bipesend/ui";

const CATEGORIES = [
  {
    title: "Gatilhos Sociais (Instagram)",
    items: [
      { id: "ig_direct", label: "Instagram: Mensagem no Direct", channel: "instagram", icon: <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" /> },
      { id: "ig_story_reaction", label: "Instagram: Reação a Story (Opcional)", channel: "instagram", icon: <Heart className="w-3.5 h-3.5 text-[#E1306C]" /> },
      { id: "ig_comment", label: "Instagram: Comentário em Post (Opcional)", channel: "instagram", icon: <MessageSquare className="w-3.5 h-3.5 text-[#E1306C]" /> },
    ]
  },
  {
    title: "Gatilhos Sociais (TikTok)",
    items: [
      { id: "tiktok_direct", label: "TikTok: Mensagem no Direct", channel: "tiktok", icon: <TikTokIcon className="w-3.5 h-3.5 text-cyan-500" /> },
      { id: "tiktok_comment", label: "TikTok: Comentário em Vídeo (Opcional)", channel: "tiktok", icon: <MessageSquare className="w-3.5 h-3.5 text-cyan-500" /> },
    ]
  },
  {
    title: "Ações Oficiais",
    items: [
      { id: "msg_direct_ig", label: "Enviar Direct no Instagram", icon: <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" /> },
      { id: "msg_wpp", label: "Enviar WhatsApp", icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> },
      { id: "crm_deal", label: "Criar Oportunidade no CRM", icon: <Users className="w-3.5 h-3.5 text-indigo-500" /> },
      { id: "crm_tag", label: "Adicionar Etiqueta", icon: <Tag className="w-3.5 h-3.5 text-amber-500" /> },
      { id: "inbox_open", label: "Mover para Caixa de Entrada", icon: <Inbox className="w-3.5 h-3.5 text-sky-500" /> },
    ]
  }
];

export function AddNode({ data }: { data: any }) {
  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <div className="w-16 h-16 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border-[3px] border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-full shadow-xs z-10 hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] hover:border-[#007BFF] hover:shadow-[0_12px_40px_rgba(0,123,255,0.2)] hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center group">
          <Handle 
            type="target" 
            position={Position.Top} 
            className="w-3 h-3 bg-red-500 rounded-full opacity-30 group-hover:opacity-100 transition-opacity -top-1.5"
          />
          <Plus className="w-7 h-7 text-[#94A3B8] group-hover:text-[#007BFF] transition-colors" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        align="center" 
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-[300px] p-0 mt-3 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl rounded-2xl overflow-hidden z-50"
      >
        <div className="p-3.5 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/70 dark:bg-slate-900/70">
          <h3 className="text-[13px] font-bold text-[#0F172A] dark:text-white">Adicionar Passo</h3>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Escolha um gatilho ou ação para conectar</p>
        </div>
        <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <h4 className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1.5 px-2">{cat.title}</h4>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <button 
                    key={item.id} 
                    type="button"
                    className="w-full flex items-center gap-2.5 p-2 bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-lg transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {item.icon}
                    </div>
                    <span className="text-[12px] font-medium text-[#0F172A] dark:text-[#E2E8F0]">{item.label}</span>
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
