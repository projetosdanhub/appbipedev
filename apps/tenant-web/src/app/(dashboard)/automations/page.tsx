"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Settings, Play, MoreHorizontal, MessageCircle, Zap, Filter, MousePointer2, Smartphone, Mail, DollarSign, Clock, Users, Maximize2 } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@bipesend/ui";

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
    title: "Engajamento",
    items: [
      { id: "no_reply_24", label: "Sem resposta em 24h", icon: <Clock className="w-4 h-4 text-amber-500" /> },
      { id: "welcome", label: "Boas-vindas", icon: <Zap className="w-4 h-4 text-purple-500" /> },
    ]
  },
  {
    title: "Ações",
    items: [
      { id: "msg_wpp", label: "Mensagem WhatsApp", icon: <MessageCircle className="w-4 h-4 text-emerald-500" /> },
      { id: "msg_email", label: "Enviar E-mail", icon: <Mail className="w-4 h-4 text-slate-500" /> },
    ]
  }
];

export default function AutomationsPage() {
  const [nodes, setNodes] = useState([
    { id: 1, x: 250, y: 150 },
    { id: 2, x: 250, y: 350 },
    { id: 3, x: 100, y: 550 },
    { id: 4, x: 450, y: 550 },
  ]);

  const [draggingNode, setDraggingNode] = useState<number | null>(null);
  
  // Transform State (Zoom & Pan)
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Keep track of current state for the native wheel event
  const transformRef = useRef({ scale: 1, pan: { x: 0, y: 0 } });
  useEffect(() => {
    transformRef.current = { scale, pan };
  }, [scale, pan]);

  // Use a native wheel event listener to prevent default scrolling while zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[role="dialog"]') || target.closest('[data-radix-popper-content-wrapper]') || target.closest('.custom-scrollbar')) {
        return;
      }

      e.preventDefault();
      const { scale, pan } = transformRef.current;
      const delta = e.deltaY * -0.002;
      const newScale = Math.min(Math.max(scale + delta, 0.15), 3);
      
      if (newScale === scale) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleRatio = newScale / scale;
      
      setPan({
        x: mouseX - (mouseX - pan.x) * scaleRatio,
        y: mouseY - (mouseY - pan.y) * scaleRatio
      });
      setScale(newScale);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // 0 = left, 1 = middle, 2 = right
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;

    const target = e.target as HTMLElement;
    
    // Always allow middle and right click to pan
    if (e.button === 1 || e.button === 2) {
      setIsPanning(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    const nodeEl = target.closest('[data-node]');
    
    // Don't drag if clicking interactive elements inside a node
    if (nodeEl && target.closest('button, [role="button"], a, input, select, [data-interactive]')) {
      return;
    }

    if (nodeEl) {
      const id = Number(nodeEl.getAttribute('data-id'));
      if (id) {
        setDraggingNode(id);
      }
    } else {
      setIsPanning(true);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    } else if (draggingNode !== null) {
      setNodes(prev => prev.map(n => n.id === draggingNode ? { 
        ...n, 
        x: n.x + e.movementX / scale, 
        y: n.y + e.movementY / scale 
      } : n));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    if (draggingNode !== null) {
      setDraggingNode(null);
    }
  };

  const node1 = nodes[0];
  const node2 = nodes[1];
  const node3 = nodes[2];
  const node4 = nodes[3];

  // Calculate SVG Paths (Base coordinates relative to transform)
  const c1_x1 = node1.x + 160;
  const c1_y1 = node1.y + 115;
  const c1_x2 = node2.x + 160;
  const c1_y2 = node2.y;
  const path1 = `M ${c1_x1} ${c1_y1} C ${c1_x1} ${c1_y1 + 80}, ${c1_x2} ${c1_y2 - 80}, ${c1_x2} ${c1_y2}`;

  const c2_x1 = node2.x + 96; // 30% of 320
  const c2_y1 = node2.y + 130;
  const c2_x2 = node3.x + 160;
  const c2_y2 = node3.y;
  const path2 = `M ${c2_x1} ${c2_y1} C ${c2_x1} ${c2_y1 + 80}, ${c2_x2} ${c2_y2 - 80}, ${c2_x2} ${c2_y2}`;

  const c3_x1 = node2.x + 224; // 70% of 320
  const c3_y1 = node2.y + 130;
  const c3_x2 = node4.x + 124; // offset by 100 for small node
  const c3_y2 = node4.y;
  const path3 = `M ${c3_x1} ${c3_y1} C ${c3_x1} ${c3_y1 + 80}, ${c3_x2} ${c3_y2 - 80}, ${c3_x2} ${c3_y2}`;

  return (
    <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden relative">
      {/* Top Header */}
      <div className="h-[60px] flex items-center justify-between px-6 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0 z-20 shadow-sm relative">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] font-bold text-[#0F172A] dark:text-white">Recuperação de Carrinho - VIP</h1>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">ATIVO</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-8 text-[12px] bg-white dark:bg-[#1E293B]">
            <Settings className="w-3.5 h-3.5 mr-1.5" /> Configurações
          </Button>
          <Button className="h-8 text-[12px] bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white shadow-md hover:shadow-lg transition-all">
            <Play className="w-3.5 h-3.5 mr-1.5" /> Publicar Fluxo
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        id="automation-canvas"
        ref={canvasRef}
        className={`flex-1 relative overscroll-none overflow-hidden touch-none bg-[#F8FAFC] dark:bg-[#0B1120] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        
        {/* Transform Container */}
        <div 
          className="absolute inset-0 origin-top-left will-change-transform"
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          {/* Background Grid Pattern tied to transform */}
          <div 
            className="absolute inset-[-10000px] pointer-events-none" 
            style={{
              backgroundImage: "radial-gradient(circle, rgba(148, 163, 184, 0.35) 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* SVG Connecting Lines */}
          <svg id="canvas-svg" className="absolute inset-[-10000px] w-[20000px] h-[20000px] pointer-events-none overflow-visible">
            <defs>
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" opacity="0.6"/>
              </marker>
              <marker id="arrow-emerald-solid" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
              <marker id="arrow-red-solid" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
              </marker>
            </defs>
            <g transform="translate(10000, 10000)">
              <path d={path1} fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="3" markerEnd="url(#arrow-emerald)" className="drop-shadow-sm transition-all" />
              <path d={path2} fill="none" stroke="#10B981" strokeWidth="3" markerEnd="url(#arrow-emerald-solid)" className="drop-shadow-sm transition-all" />
              <path d={path3} fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray="5 5" markerEnd="url(#arrow-red-solid)" className="drop-shadow-sm transition-all" />
            </g>
          </svg>

          {/* Nodes Container */}
          <div className="absolute inset-[-10000px]">
            <div className="absolute top-[10000px] left-[10000px]">
              
              {/* Node 1: Trigger */}
              <div 
                data-node
                data-id="1"
                className={`absolute w-[320px] bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)] z-10 select-none border border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(16,185,129,0.2)] hover:border-emerald-500/60 group ${draggingNode === 1 ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ transform: `translate(${node1.x}px, ${node1.y}px)` }}
              >
                <div className="absolute inset-0 rounded-3xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="p-4 border-b border-emerald-500/10 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/30 dark:to-transparent rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center shadow-inner border border-emerald-500/20">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[15px] font-bold text-[#0F172A] dark:text-white">Carrinho Abandonado</span>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors" />
                </div>
                <div className="p-4">
                  <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed relative z-10">Dispara quando o lead chega no checkout e não finaliza a compra em 30 min.</p>
                </div>
                {/* Output Port */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500 rounded-full flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
              </div>

              {/* Node 2: Condition */}
              <div 
                data-node
                data-id="2"
                className={`absolute w-[320px] bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)] z-10 select-none border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(100,116,139,0.15)] group ${draggingNode === 2 ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ transform: `translate(${node2.x}px, ${node2.y}px)` }}
              >
                <div className="absolute inset-0 rounded-3xl bg-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                {/* Input Port */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500/50 rounded-full shadow-sm" />
                
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner border border-slate-200 dark:border-slate-700">
                      <Filter className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <span className="text-[15px] font-bold text-[#0F172A] dark:text-white">Condição: VIP?</span>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors" />
                </div>
                <div className="p-4 relative z-10">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0F172A] text-[13px] font-medium text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155] shadow-inner">
                    Se <span className="font-bold text-slate-700 dark:text-slate-300 mx-1">Etiqueta</span> contém <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">VIP</span>
                  </div>
                </div>
                {/* Output Ports */}
                <div className="absolute -bottom-3 left-[30%] -translate-x-1/2 w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500 rounded-full flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse">
                  <span className="text-[11px] font-extrabold text-emerald-600 absolute top-6 bg-white/95 dark:bg-[#1E293B]/95 px-2 py-0.5 rounded-md shadow-sm border border-emerald-100 dark:border-emerald-900/50">SIM</span>
                </div>
                <div className="absolute -bottom-3 left-[70%] -translate-x-1/2 w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-red-500 rounded-full flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse">
                  <span className="text-[11px] font-extrabold text-red-600 absolute top-6 bg-white/95 dark:bg-[#1E293B]/95 px-2 py-0.5 rounded-md shadow-sm border border-red-100 dark:border-red-900/50">NÃO</span>
                </div>
              </div>

              {/* Node 3: Action (WhatsApp) */}
              <div 
                data-node
                data-id="3"
                className={`absolute w-[320px] bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-[0_12px_40px_rgb(0,0,0,0.4)] z-10 select-none border border-blue-500/30 hover:border-blue-500/60 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(59,130,246,0.2)] group ${draggingNode === 3 ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ transform: `translate(${node3.x}px, ${node3.y}px)` }}
              >
                <div className="absolute inset-0 rounded-3xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                {/* Input Port */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-emerald-500/50 rounded-full shadow-sm" />
                
                <div className="p-4 border-b border-blue-500/10 flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25D366]/20 to-[#25D366]/10 flex items-center justify-center shadow-inner border border-[#25D366]/20">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <span className="text-[15px] font-bold text-[#0F172A] dark:text-white">Enviar Mensagem</span>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white cursor-pointer transition-colors" />
                </div>
                <div className="p-4 relative z-10">
                  <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155] relative before:absolute before:left-[-7px] before:top-4 before:w-3.5 before:h-3.5 before:bg-[#F8FAFC] dark:before:bg-[#0F172A] before:border-l before:border-b before:border-[#E2E8F0] dark:before:border-[#334155] before:rotate-45 shadow-sm">
                    <p className="text-[13px] text-[#475569] dark:text-[#CBD5E1] italic leading-relaxed relative z-10">&quot;Olá [Nome], vimos que você deixou algo no carrinho. Como você é VIP, tome 15% OFF...&quot;</p>
                  </div>
                </div>
                
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-[#1E293B] border-[3px] border-blue-500 rounded-full flex items-center justify-center shadow-sm hover:scale-125 transition-transform group-hover:animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </div>
              </div>

              {/* Node 4: Action (Empty / Add) */}
              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <div 
                    data-node
                    data-id="4"
                    className="absolute w-14 h-14 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-2 border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-full shadow-sm z-10 hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A] hover:border-[#0A74FF] hover:shadow-md transition-all cursor-pointer flex items-center justify-center group"
                    style={{ transform: `translate(${node4.x + 100}px, ${node4.y}px)` }}
                  >
                    {/* Input Port Connection */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full opacity-30 group-hover:opacity-100 transition-opacity" />
                    
                    <Plus className="w-6 h-6 text-[#94A3B8] group-hover:text-[#0A74FF] transition-colors" />
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
                              <div className="w-7 h-7 rounded-md bg-white dark:bg-[#0F172A] shadow-sm flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] group-hover:border-[#0A74FF]/30 transition-colors">
                                {item.icon}
                              </div>
                              <span className="text-[13px] font-medium text-[#0F172A] dark:text-[#E2E8F0]">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

            </div>
          </div>
        </div>
      </div>

      {/* Floating Add Node Button */}
      <div className="absolute bottom-8 right-8 z-30">
        <Popover modal={false}>
          <PopoverTrigger asChild>
            <Button className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] hover:from-[#0056b3] hover:to-[#4f46e5] text-white shadow-[0_8px_30px_rgb(0,123,255,0.3)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
              <Plus className="w-6 h-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align="end" 
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="w-[300px] p-0 mb-4 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl rounded-2xl"
          >
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white">Adicionar Nó</h3>
              <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">Selecione um bloco para adicionar ao fluxo</p>
            </div>
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-3">
              {CATEGORIES.map((cat, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <h4 className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2 px-1">{cat.title}</h4>
                  <div className="space-y-1.5">
                    {cat.items.map((item) => (
                      <button key={item.id} className="w-full flex items-center gap-3 p-2.5 bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-xl transition-colors text-left group">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#0F172A] shadow-sm flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] group-hover:border-[#0A74FF]/30 transition-colors">
                          {item.icon}
                        </div>
                        <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Zoom / Pan Controls Overlay */}
      <div className="absolute bottom-8 left-8 z-30 flex items-center gap-2 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-lg">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white" onClick={() => setScale(s => Math.min(s + 0.1, 3))}>
          <Plus className="w-4 h-4" />
        </Button>
        <span className="text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] min-w-[36px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white" onClick={() => setScale(s => Math.max(s - 0.1, 0.2))}>
          <div className="w-3.5 h-0.5 bg-current rounded-full" />
        </Button>
        <div className="w-[1px] h-4 bg-[#E2E8F0] dark:bg-[#334155] mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#64748B] hover:text-[#0F172A] dark:hover:text-white" onClick={() => { setScale(1); setPan({x: 0, y: 0}); }}>
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
