"use client";

import { useState } from "react";
import { Plus, Settings, Play, MoreHorizontal, MessageCircle, Zap, Filter, MousePointer2, Smartphone, Mail, DollarSign, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@bipesend/ui";

const CATEGORIES = [
  {
    title: "Vendas & Conversão",
    items: [
      { id: "cart", label: "Carrinho Abandonado", icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
      { id: "payment", label: "Pagamento Recusado", icon: <DollarSign className="w-4 h-4 text-red-500" /> },
      { id: "negotiation", label: "Lead em Negociação", icon: <Users className="w-4 h-4 text-blue-500" /> },
    ]
  },
  {
    title: "Engajamento (Essenciais)",
    items: [
      { id: "no_reply_24", label: "Sem resposta em 24h", icon: <Clock className="w-4 h-4 text-amber-500" /> },
      { id: "welcome", label: "Boas-vindas (Novo Lead)", icon: <Zap className="w-4 h-4 text-purple-500" /> },
    ]
  },
  {
    title: "Comunicação",
    items: [
      { id: "msg_wpp", label: "Mensagem WhatsApp", icon: <MessageCircle className="w-4 h-4 text-emerald-500" /> },
      { id: "msg_email", label: "Enviar E-mail", icon: <Mail className="w-4 h-4 text-slate-500" /> },
    ]
  }
];

export default function AutomationsPage() {
  const [nodes, setNodes] = useState([
    { id: 1, x: 250, y: 50 },
    { id: 2, x: 250, y: 250 },
    { id: 3, x: 100, y: 450 },
    { id: 4, x: 450, y: 450 },
  ]);

  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggingNode(id);
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingNode === null) return;
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    setNodes(nodes.map(n => n.id === draggingNode ? { ...n, x: newX, y: newY } : n));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNode !== null) {
      setDraggingNode(null);
    }
  };

  const node1 = nodes[0];
  const node2 = nodes[1];
  const node3 = nodes[2];
  const node4 = nodes[3];

  // Calculate SVG Paths
  const c1_x1 = node1.x + 150;
  const c1_y1 = node1.y + 115;
  const c1_x2 = node2.x + 150;
  const c1_y2 = node2.y;
  const path1 = `M ${c1_x1} ${c1_y1} C ${c1_x1} ${c1_y1 + 60}, ${c1_x2} ${c1_y2 - 60}, ${c1_x2} ${c1_y2}`;

  const c2_x1 = node2.x + 75;
  const c2_y1 = node2.y + 120;
  const c2_x2 = node3.x + 150;
  const c2_y2 = node3.y;
  const path2 = `M ${c2_x1} ${c2_y1} C ${c2_x1} ${c2_y1 + 60}, ${c2_x2} ${c2_y2 - 60}, ${c2_x2} ${c2_y2}`;

  const c3_x1 = node2.x + 225;
  const c3_y1 = node2.y + 120;
  const c3_x2 = node4.x + 125;
  const c3_y2 = node4.y;
  const path3 = `M ${c3_x1} ${c3_y1} C ${c3_x1} ${c3_y1 + 60}, ${c3_x2} ${c3_y2 - 60}, ${c3_x2} ${c3_y2}`;

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden">
      {/* Top Header */}
      <div className="h-[60px] flex items-center justify-between px-6 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] font-bold text-[#0F172A] dark:text-white">Recuperação de Carrinho - VIP</h1>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">ATIVO</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-8 text-[12px]">
            <Settings className="w-3.5 h-3.5 mr-1.5" /> Configurações
          </Button>
          <Button className="h-8 text-[12px] bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white">
            <Play className="w-3.5 h-3.5 mr-1.5" /> Publicar Fluxo
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Nodes Toolbar) */}
        <div className="w-[280px] bg-white dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
            <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">Adicionar Nó</h3>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Arraste para o canvas</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {CATEGORIES.map((cat, i) => (
              <div key={i}>
                <h4 className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-3">{cat.title}</h4>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2.5 bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] rounded-lg cursor-grab hover:border-[#0A74FF] transition-colors">
                      <div className="w-7 h-7 rounded-md bg-white dark:bg-[#0F172A] shadow-sm flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155]">
                        {item.icon}
                      </div>
                      <span className="text-[12.5px] font-medium text-[#0F172A] dark:text-[#E2E8F0]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full text-[12px] border-dashed">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Criar Gatilho Personalizado
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 relative cursor-grab active:cursor-grabbing bg-[#F1F5F9] dark:bg-[#0B1120] touch-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(148, 163, 184, 0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d={path1} fill="none" stroke="rgba(148, 163, 184, 0.5)" strokeWidth="2" />
            <path d={path2} fill="none" stroke="#10B981" strokeWidth="2" />
            <path d={path3} fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Node 1: Trigger */}
          <div 
            className="absolute w-[300px] bg-white dark:bg-[#1E293B] border-2 border-emerald-500 rounded-xl shadow-md z-10 cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `translate(${node1.x}px, ${node1.y}px)` }}
            onPointerDown={(e) => handlePointerDown(e, 1)}
          >
            <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500 rounded-md">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">Gatilho: Carrinho Abandonado</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#64748B] cursor-pointer" />
            </div>
            <div className="p-3">
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Dispara quando o lead chega no checkout e não finaliza a compra em 30 min.</p>
            </div>
            {/* Output Port */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-[#1E293B] border-2 border-emerald-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
          </div>

          {/* Node 2: Condition */}
          <div 
            className="absolute w-[300px] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl shadow-md z-10 cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `translate(${node2.x}px, ${node2.y}px)` }}
            onPointerDown={(e) => handlePointerDown(e, 2)}
          >
            {/* Input Port */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full" />
            
            <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-amber-50 dark:bg-amber-500/10 rounded-t-xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 rounded-md">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <span className="text-[13px] font-bold text-amber-700 dark:text-amber-400">Condição: VIP?</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#64748B] cursor-pointer" />
            </div>
            <div className="p-3">
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Se a Etiqueta contém "VIP"</p>
            </div>
            {/* Output Ports */}
            <div className="absolute -bottom-2.5 left-1/4 -translate-x-1/2 w-5 h-5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-500 absolute top-5">SIM</span>
            </div>
            <div className="absolute -bottom-2.5 left-3/4 -translate-x-1/2 w-5 h-5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-red-500 absolute top-5">NÃO</span>
            </div>
          </div>

          {/* Node 3: Action (WhatsApp) */}
          <div 
            className="absolute w-[300px] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl shadow-md z-10 cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `translate(${node3.x}px, ${node3.y}px)` }}
            onPointerDown={(e) => handlePointerDown(e, 3)}
          >
            {/* Input Port */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-full" />
            
            <div className="p-3 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#10B981] rounded-md">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-[13px] font-bold text-[#0F172A] dark:text-white">Enviar Oferta Especial</span>
              </div>
              <MoreHorizontal className="w-4 h-4 text-[#64748B] cursor-pointer" />
            </div>
            <div className="p-3">
              <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B]">
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] italic leading-relaxed">"Olá [Nome], vimos que você deixou algo no carrinho. Como você é VIP, tome 15% OFF..."</p>
              </div>
            </div>
          </div>

          {/* Node 4: Action (Empty / Add) */}
          <div 
            className="absolute w-[250px] bg-white dark:bg-[#1E293B] border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-xl shadow-sm z-10 opacity-80 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 hover:border-[#0A74FF] transition-all cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `translate(${node4.x}px, ${node4.y}px)` }}
            onPointerDown={(e) => handlePointerDown(e, 4)}
          >
            {/* Input Port */}
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white dark:bg-[#1E293B] border-2 border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-full" />
            
            <div className="flex flex-col items-center justify-center p-6 text-center h-[130px]">
              <Plus className="w-6 h-6 text-[#94A3B8] mb-2" />
              <span className="text-[12px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Adicionar Ação</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
