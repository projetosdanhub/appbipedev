"use client";

import { useState, useCallback } from "react";
import { Play, Settings, Plus, DollarSign, Users, Clock, Zap, MessageCircle, Mail, X } from "lucide-react";
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
  { id: '1', type: 'trigger', position: { x: 250, y: 150 }, data: { label: 'Carrinho Abandonado' } },
  { id: '2', type: 'condition', position: { x: 250, y: 350 }, data: { label: 'Condição: VIP?' } },
  { id: '3', type: 'action', position: { x: 100, y: 550 }, data: { label: 'Enviar Mensagem' } },
  { id: '4', type: 'add', position: { x: 450, y: 550 }, data: {} },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', style: { stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 3 }, animated: true },
  { id: 'e2-3', source: '2', target: '3', sourceHandle: 'yes', style: { stroke: '#10B981', strokeWidth: 3 } },
  { id: 'e2-4', source: '2', target: '4', sourceHandle: 'no', style: { stroke: '#EF4444', strokeWidth: 3, strokeDasharray: '5,5' } },
];

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
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [drawerLabel, setDrawerLabel] = useState("");
  const [drawerDescription, setDrawerDescription] = useState("");
  const [drawerFilterRule, setDrawerFilterRule] = useState("Contém Etiqueta VIP");
  const [menuConfig, setMenuConfig] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });

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
              },
            }
          : n
      )
    );
    setSelectedNode(null);
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

  return (
    <AutomationContext.Provider value={{ openNodeConfig }}>
      <div className="flex flex-col h-full w-full bg-[#F8FAFC] dark:bg-[#0B1120] overflow-hidden relative">
        {/* Top Header */}
        <div className="h-[60px] flex items-center justify-between px-6 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0 z-20 shadow-sm relative">
          <div className="flex items-center gap-3">
            <h1 className="text-[16px] font-bold text-[#0F172A] dark:text-white">Recuperação de Carrinho - VIP</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">ATIVO</span>
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
          className="fixed z-50 w-[300px] p-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl rounded-2xl"
          style={{ top: menuConfig.y, left: menuConfig.x }}
        >
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl">
            <h3 className="text-[15px] font-bold text-[#0F172A] dark:text-white">Adicionar Nó</h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">Selecione um bloco para adicionar ao fluxo</p>
          </div>
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-3">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <h4 className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2 px-1">{cat.title}</h4>
                <div className="space-y-1.5">
                  {cat.items.map((item) => (
                    <button 
                      key={item.id} 
                      onClick={() => setMenuConfig((prev) => ({ ...prev, show: false }))}
                      className="w-full flex items-center gap-3 p-2.5 bg-transparent hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-xl transition-colors text-left group"
                    >
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
        </div>
      )}
      </div>

      {/* Node Configuration Sidebar */}
      <Sheet modal={false} open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <SheetContent className="w-full sm:w-[400px] bg-white dark:bg-[#0F172A] border-l border-[#E2E8F0] dark:border-[#1E293B] p-0 z-40">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <h2 className="text-[18px] font-bold text-[#0F172A] dark:text-white">
                {String(selectedNode?.data?.label || 'Configuração')}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Nome do Passo</label>
                <input 
                  type="text" 
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#0A74FF]"
                  value={drawerLabel}
                  onChange={(e) => setDrawerLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Descrição</label>
                <textarea 
                  className="w-full h-24 p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#0A74FF] resize-none"
                  value={drawerDescription}
                  onChange={(e) => setDrawerDescription(e.target.value)}
                />
              </div>
              {/* Fake conditional render for specific node types */}
              {selectedNode?.type === 'condition' && (
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">Regra de Filtro</label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-white"
                    value={drawerFilterRule}
                    onChange={(e) => setDrawerFilterRule(e.target.value)}
                  >
                    <option>Contém Etiqueta VIP</option>
                    <option>Não Contém Etiqueta VIP</option>
                  </select>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-[#E2E8F0] dark:border-[#1E293B] flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSelectedNode(null)}>Cancelar</Button>
              <Button className="bg-[#0A74FF] hover:bg-[#0056b3] text-white" onClick={handleSaveNode}>Salvar Alterações</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </AutomationContext.Provider>
  );
}
