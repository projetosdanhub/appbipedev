"use client";

import { useState, useCallback } from "react";
import { 
  Play, 
  Settings, 
  Plus, 
  DollarSign, 
  Users, 
  Clock, 
  Zap, 
  MessageCircle, 
  Mail, 
  X,
  Heart,
  MessageSquare,
  Tag,
  Inbox,
  ShieldCheck,
  Sparkles,
  Info
} from "lucide-react";
import { InstagramIcon, TikTokIcon } from "@/features/automations/components/social-icons";
import { Button, Popover, PopoverContent, PopoverTrigger, Sheet, SheetContent } from "@bipesend/ui";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
  ReactFlowProvider,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TriggerNode } from "@/features/automations/components/TriggerNode";
import { ConditionNode } from "@/features/automations/components/ConditionNode";
import { ActionNode } from "@/features/automations/components/ActionNode";
import { AddNode } from "@/features/automations/components/AddNode";
import { AutomationContext } from "@/features/automations/context/automation-context";

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  add: AddNode,
};

const initialNodes: Node[] = [
  { 
    id: "1", 
    type: "trigger", 
    position: { x: 260, y: 100 }, 
    data: { 
      label: "Instagram: Reação a Story (Opcional)", 
      channel: "instagram", 
      isOptional: true,
      description: "Dispara opcionalmente quando um seguidor reage com emoji a qualquer Story da sua empresa."
    } 
  },
  { 
    id: "2", 
    type: "action", 
    position: { x: 260, y: 320 }, 
    data: { 
      label: "Enviar Direct no Instagram", 
      actionType: "instagram_direct",
      message: '"Opa! Vimos que você curtiu nosso story. Quer receber o catálogo completo com desconto de hoje?"'
    } 
  },
  { 
    id: "3", 
    type: "condition", 
    position: { x: 260, y: 520 }, 
    data: { 
      label: "Cliente respondeu ao Direct?", 
      conditionText: "Se status da resposta = 'Recebida'" 
    } 
  },
  { 
    id: "4", 
    type: "action", 
    position: { x: 80, y: 720 }, 
    data: { 
      label: "Criar Oportunidade no CRM", 
      actionType: "crm_deal",
      message: "Lead qualificado automaticamente inserido na etapa 'Primeiro Contato' do CRM Kanban."
    } 
  },
  { 
    id: "5", 
    type: "add", 
    position: { x: 440, y: 720 }, 
    data: {} 
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", style: { stroke: "#E1306C", strokeWidth: 3 }, animated: true },
  { id: "e2-3", source: "2", target: "3", style: { stroke: "#007BFF", strokeWidth: 3 }, animated: true },
  { id: "e3-4", source: "3", target: "4", sourceHandle: "yes", style: { stroke: "#10B981", strokeWidth: 3 } },
  { id: "e3-5", source: "3", target: "5", sourceHandle: "no", style: { stroke: "#EF4444", strokeWidth: 3, strokeDasharray: "5,5" } },
];

const CATEGORIES = [
  {
    title: "Gatilhos Sociais (Instagram)",
    items: [
      { 
        id: "ig_direct", 
        type: "trigger", 
        channel: "instagram",
        isOptional: false,
        label: "Instagram: Mensagem no Direct", 
        desc: "Dispara quando um cliente envia mensagem direta no Instagram (entra no Inbox e CRM).",
        icon: <InstagramIcon className="w-4 h-4 text-[#E1306C]" /> 
      },
      { 
        id: "ig_story_reaction", 
        type: "trigger", 
        channel: "instagram",
        isOptional: true,
        label: "Instagram: Reação a Story (Opcional)", 
        desc: "Dispara opcionalmente quando o lead reage com emoji aos Stories (sem poluir o CRM).",
        icon: <Heart className="w-4 h-4 text-[#E1306C]" /> 
      },
      { 
        id: "ig_comment", 
        type: "trigger", 
        channel: "instagram",
        isOptional: true,
        label: "Instagram: Comentário em Post / Reels (Opcional)", 
        desc: "Dispara quando alguém comenta em publicações ou Reels (ex: 'EU QUERO').",
        icon: <MessageSquare className="w-4 h-4 text-[#E1306C]" /> 
      },
    ]
  },
  {
    title: "Gatilhos Sociais (TikTok)",
    items: [
      { 
        id: "tiktok_direct", 
        type: "trigger", 
        channel: "tiktok",
        isOptional: false,
        label: "TikTok: Mensagem no Direct", 
        desc: "Dispara quando uma mensagem privada é enviada no TikTok for Business.",
        icon: <TikTokIcon className="w-4 h-4 text-cyan-500" /> 
      },
      { 
        id: "tiktok_comment", 
        type: "trigger", 
        channel: "tiktok",
        isOptional: true,
        label: "TikTok: Comentário em Vídeo (Opcional)", 
        desc: "Dispara quando um usuário comenta em seus vídeos patrocinados ou orgânicos.",
        icon: <MessageSquare className="w-4 h-4 text-cyan-500" /> 
      },
    ]
  },
  {
    title: "Vendas & CRM",
    items: [
      { id: "cart", type: "trigger", channel: "sales", label: "Carrinho Abandonado", desc: "Dispara após 30 min sem finalização de checkout.", icon: <DollarSign className="w-4 h-4 text-emerald-500" /> },
      { id: "payment", type: "trigger", channel: "sales", label: "Pagamento Recusado", desc: "Dispara imediatamente após recusa de pagamento.", icon: <DollarSign className="w-4 h-4 text-red-500" /> },
      { id: "negotiation", type: "trigger", channel: "sales", label: "Lead em Negociação", desc: "Dispara quando a oportunidade avança no Kanban.", icon: <Users className="w-4 h-4 text-blue-500" /> },
    ]
  },
  {
    title: "Ações Executáveis",
    items: [
      { id: "msg_direct_ig", type: "action", actionType: "instagram_direct", label: "Enviar Direct no Instagram", icon: <InstagramIcon className="w-4 h-4 text-[#E1306C]" /> },
      { id: "msg_wpp", type: "action", actionType: "whatsapp_message", label: "Enviar Mensagem WhatsApp", icon: <MessageCircle className="w-4 h-4 text-emerald-500" /> },
      { id: "crm_deal", type: "action", actionType: "crm_deal", label: "Criar Oportunidade no CRM", icon: <Users className="w-4 h-4 text-indigo-500" /> },
      { id: "crm_tag", type: "action", actionType: "crm_tag", label: "Adicionar Etiqueta ao Contato", icon: <Tag className="w-4 h-4 text-amber-500" /> },
      { id: "inbox_open", type: "action", actionType: "inbox_open", label: "Mover para Caixa de Entrada", icon: <Inbox className="w-4 h-4 text-sky-500" /> },
    ]
  }
];

export default function AutomationsPage() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Form State
  const [drawerLabel, setDrawerLabel] = useState("");
  const [drawerDescription, setDrawerDescription] = useState("");
  const [drawerFilterRule, setDrawerFilterRule] = useState("Contém Etiqueta VIP");
  const [drawerFilterKeyword, setDrawerFilterKeyword] = useState("");
  const [drawerCrmBehavior, setDrawerCrmBehavior] = useState("only_reply");
  const [drawerMessage, setDrawerMessage] = useState("");

  const [menuConfig, setMenuConfig] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const openNodeConfig = useCallback((nodeId: string) => {
    setNodes((currentNodes) => {
      const node = currentNodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
        setDrawerLabel((node.data?.label as string) || "");
        setDrawerDescription((node.data?.description as string) || "");
        setDrawerFilterRule((node.data?.filterRule as string) || "Contém Etiqueta VIP");
        setDrawerFilterKeyword((node.data?.filterKeyword as string) || "");
        setDrawerCrmBehavior((node.data?.crmBehavior as string) || "only_reply");
        setDrawerMessage((node.data?.message as string) || "");
      }
      return currentNodes;
    });
  }, []);

  const handleSaveNode = () => {
    if (!selectedNode) return;
    setNodes((currentNodes) =>
      currentNodes.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                label: drawerLabel,
                description: drawerDescription,
                filterRule: drawerFilterRule,
                filterKeyword: drawerFilterKeyword,
                crmBehavior: drawerCrmBehavior,
                message: drawerMessage,
              },
            }
          : n
      )
    );
    setSelectedNode(null);
  };

  const handleSelectBlock = (item: any) => {
    const id = `node-${Date.now()}`;
    const xPos = menuConfig.x ? Math.max(100, Math.min(800, menuConfig.x - 300)) : 300;
    const yPos = menuConfig.y ? Math.max(100, Math.min(700, menuConfig.y - 120)) : 350;

    const newNode: Node = {
      id,
      type: item.type || "action",
      position: { x: xPos, y: yPos },
      data: {
        label: item.label,
        channel: item.channel,
        isOptional: item.isOptional,
        description: item.desc,
        actionType: item.actionType,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setMenuConfig((prev) => ({ ...prev, show: false }));
  };

  const onPaneContextMenu = useCallback((event: MouseEvent | React.MouseEvent) => {
    event.preventDefault();
    setMenuConfig({
      x: event.clientX,
      y: event.clientY,
      show: true,
    });
  }, []);

  const onPaneClick = useCallback(() => {
    setMenuConfig((prev) => ({ ...prev, show: false }));
  }, []);

  const isSocialTrigger = Boolean(selectedNode?.data?.channel === "instagram" || selectedNode?.data?.channel === "tiktok");
  const isOptionalTrigger = Boolean(selectedNode?.data?.isOptional);

  return (
    <AutomationContext.Provider value={{ openNodeConfig }}>
      <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden relative">
        {/* Top Header */}
        <div className="h-[60px] flex items-center justify-between px-6 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0 z-20 shadow-xs relative">
          <div className="flex items-center gap-3">
            <h1 className="text-[16px] font-bold text-[#0F172A] dark:text-white">Automação de Redes Sociais & CRM</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
              ATIVO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-8 text-[12px] bg-white dark:bg-[#1E293B] ui-button-pushable">
              <Settings className="w-3.5 h-3.5 mr-1.5" /> Configurações
            </Button>
            <Button className="h-8 text-[12px] bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white shadow-md hover:shadow-lg transition-all ui-button-pushable">
              <Play className="w-3.5 h-3.5 mr-1.5" /> Publicar Fluxo
            </Button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 w-full relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              panOnDrag={true}
              selectionOnDrag={false}
              selectionMode={SelectionMode.Partial}
              panActivationKeyCode="Space"
              zoomOnScroll={true}
              panOnScroll={false}
              onPaneContextMenu={onPaneContextMenu}
              onPaneClick={onPaneClick}
              className="bg-[#F8FAFC] dark:bg-[#0B1120]"
            >
              <Background gap={24} size={1.5} color="rgba(148, 163, 184, 0.35)" />
              <Controls className="ui-glass" />
            </ReactFlow>
          </ReactFlowProvider>

          {/* Context Menu Flutuante */}
          {menuConfig.show && (
            <div 
              className="fixed z-50 w-[320px] p-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl rounded-2xl"
              style={{ top: menuConfig.y, left: menuConfig.x }}
            >
              <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/70 dark:bg-slate-900/70 rounded-t-2xl">
                <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white">Adicionar ao Fluxo</h3>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Escolha um gatilho social ou ação automática</p>
              </div>
              <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-3">
                {CATEGORIES.map((cat, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <h4 className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2 px-1">
                      {cat.title}
                    </h4>
                    <div className="space-y-1.5">
                      {cat.items.map((item) => (
                        <button 
                          key={item.id} 
                          type="button"
                          onClick={() => handleSelectBlock(item)}
                          className="w-full flex items-center gap-3 p-2.5 bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-xl transition-colors text-left group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#0F172A] shadow-xs flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155] group-hover:border-[#007BFF]/40 transition-colors">
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-[12px] font-semibold text-[#0F172A] dark:text-[#E2E8F0] block leading-tight">
                              {item.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Node Configuration Sidebar */}
        <Sheet modal={false} open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
          <SheetContent className="w-full sm:w-[420px] bg-white dark:bg-[#0F172A] border-l border-[#E2E8F0] dark:border-[#1E293B] p-0 z-40">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <div>
                  <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white">
                    {String(selectedNode?.data?.label || "Configuração do Nó")}
                  </h2>
                  <span className="text-xs text-slate-500">
                    {selectedNode?.type === "trigger" ? "Gatilho de Disparo" : selectedNode?.type === "action" ? "Ação Executável" : "Condição"}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Banner Informativo sobre Regra do Direct */}
                {isSocialTrigger && (
                  <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    <div className="flex items-center gap-2 font-bold mb-1 text-[#007BFF]">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>Regra de Qualidade BipeSend</span>
                    </div>
                    Por padrão, apenas mensagens enviadas no <strong>Direct</strong> entram automaticamente no Inbox e CRM Kanban. Reações a Stories e comentários em Posts são mantidos como gatilhos de automação opcionais para não sobrecarregar sua equipe comercial.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#475569] dark:text-[#94A3B8]">Nome do Passo</label>
                  <input 
                    type="text" 
                    className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#007BFF]"
                    value={drawerLabel}
                    onChange={(e) => setDrawerLabel(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#475569] dark:text-[#94A3B8]">Descrição Operacional</label>
                  <textarea 
                    className="w-full h-20 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#007BFF] resize-none"
                    value={drawerDescription}
                    onChange={(e) => setDrawerDescription(e.target.value)}
                  />
                </div>

                {/* Filtro Opcional de Palavra-chave para Comentários / Stories */}
                {isSocialTrigger && isOptionalTrigger && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[12px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                      Filtrar por Palavra-Chave no Comentário (Opcional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: QUERO, VALOR, PREÇO, PROMO"
                      className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#007BFF]"
                      value={drawerFilterKeyword}
                      onChange={(e) => setDrawerFilterKeyword(e.target.value)}
                    />
                    <p className="text-[11px] text-slate-500">
                      Deixe vazio para disparar em qualquer comentário/reação, ou informe palavras separadas por vírgula.
                    </p>
                  </div>
                )}

                {/* Regra de Comportamento no CRM */}
                {isSocialTrigger && (
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                      Comportamento no CRM Kanban
                    </label>
                    <select 
                      className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white"
                      value={drawerCrmBehavior}
                      onChange={(e) => setDrawerCrmBehavior(e.target.value)}
                    >
                      <option value="only_reply">Apenas enviar resposta automática (sem criar card no CRM)</option>
                      <option value="create_on_reply">Criar card no CRM Kanban apenas se o cliente responder ao Direct</option>
                      <option value="create_immediately">Criar card no CRM Kanban imediatamente</option>
                    </select>
                  </div>
                )}

                {/* Mensagem para Ações de Envio */}
                {selectedNode?.type === "action" && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[12px] font-semibold text-[#475569] dark:text-[#94A3B8]">
                      Texto da Mensagem Automática
                    </label>
                    <textarea 
                      className="w-full h-24 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#007BFF] resize-none"
                      placeholder="Olá! Vimos seu interesse e preparamos algo especial..."
                      value={drawerMessage}
                      onChange={(e) => setDrawerMessage(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {"{nome}"}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {"{primeiro_nome}"}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {"{link_produto}"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Filtro para Nós de Condição */}
                {selectedNode?.type === "condition" && (
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#475569] dark:text-[#94A3B8]">Regra de Filtro</label>
                    <select 
                      className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-xs text-[#0F172A] dark:text-white"
                      value={drawerFilterRule}
                      onChange={(e) => setDrawerFilterRule(e.target.value)}
                    >
                      <option>Contém Etiqueta VIP</option>
                      <option>Não Contém Etiqueta VIP</option>
                      <option>Cliente já respondeu ao Direct</option>
                      <option>Cliente não respondeu em 15 minutos</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-[#E2E8F0] dark:border-[#1E293B] flex justify-end gap-2.5">
                <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)}>
                  Cancelar
                </Button>
                <Button className="bg-[#007BFF] hover:bg-[#0062cc] text-white text-xs h-9 px-4" onClick={handleSaveNode}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AutomationContext.Provider>
  );
}
