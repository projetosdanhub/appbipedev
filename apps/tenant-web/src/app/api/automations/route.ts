import { NextResponse } from 'next/server';

const MOCK_AUTOMATION = {
  id: "wf_123",
  name: "Recuperação de Carrinho - VIP",
  status: "active",
  nodes: [
    { id: '1', type: 'trigger', position: { x: 250, y: 150 }, data: { label: 'Carrinho Abandonado' } },
    { id: '2', type: 'condition', position: { x: 250, y: 350 }, data: { label: 'Condição: VIP?' } },
    { id: '3', type: 'action', position: { x: 100, y: 550 }, data: { label: 'Enviar Mensagem' } },
    { id: '4', type: 'add', position: { x: 450, y: 550 }, data: {} },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2', style: { stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 3 }, animated: true },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: 'yes', style: { stroke: '#10B981', strokeWidth: 3 } },
    { id: 'e2-4', source: '2', target: '4', sourceHandle: 'no', style: { stroke: '#EF4444', strokeWidth: 3, strokeDasharray: '5,5' } },
  ]
};

export async function GET() {
  return NextResponse.json(MOCK_AUTOMATION);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Simulate save
    return NextResponse.json({ success: true, saved: data });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
}
