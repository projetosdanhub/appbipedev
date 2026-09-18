export interface CreateConnectionBody {
  name: string;
}

export interface ConnectionResponse {
  id?: string;
  name?: string;
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qrcode?: string | null; // Apenas retornado na criação
}

export interface ConnectionStatusResponse {
  instanceName: string;
  status: 'connected' | 'disconnected' | 'connecting';
}
