"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseRealtimeOptions {
  tenantId: string;
  onEvent?: (event: string, payload: any) => void;
  token?: string; // Token de sessão, opcionalmente injetado se os cookies não funcionarem nativamente
}

export function useRealtime({ tenantId, onEvent, token }: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);

  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    // Evita múltiplas instâncias em React StrictMode
    if (wsRef.current) return;

    const connect = () => {
      let wsHost = "ws://127.0.0.1:4000/ws";
      if (typeof window !== "undefined") {
        if (process.env.NEXT_PUBLIC_WS_URL) {
          wsHost = process.env.NEXT_PUBLIC_WS_URL;
        } else if (process.env.NEXT_PUBLIC_API_URL) {
          wsHost = `${process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws')}/ws`;
        } else {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const host = window.location.hostname.includes("app.localhost") 
            ? window.location.host.replace("app.localhost", "api.localhost")
            : window.location.host;
          wsHost = `${protocol}//${host}/ws`;
        }
      }

      if (token) {
        wsHost += `?token=${token}`;
      }

      const ws = new WebSocket(wsHost);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectCountRef.current = 0; // reset reconnect counter
        // Ao conectar, assinar os eventos do Tenant atual
        ws.send(JSON.stringify({ action: "subscribe", tenantId }));
      };

      ws.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          if (data.event === "connected") {
            // Permite que o frontend faça catch-up
            if (reconnectCountRef.current > 0 && onEventRef.current) {
              onEventRef.current("reconnected", data.payload);
            }
          }
          
          // Dispara o callback customizado
          if (onEventRef.current) {
            onEventRef.current(data.event, data.payload);
          }
        } catch (err) {
          console.error("[WS] Erro ao fazer parse da mensagem", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        
        // Exponential backoff reconnect
        const timeout = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 30000);
        reconnectCountRef.current += 1;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, timeout);
      };

      ws.onerror = (_err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[WS] Conexão em tempo real interrompida. Tentando reconectar...");
        }
        ws.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, [tenantId, token]);

  return { isConnected };
}
