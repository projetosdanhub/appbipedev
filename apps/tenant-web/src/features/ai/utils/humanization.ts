/**
 * Utilitário de Humanização para Agentes de IA do BipeSend
 * Simula comportamento real de digitação e gravação de áudio no WhatsApp e canais Omnichannel.
 */

export function calculateTypingDelayMs(text: string): number {
  if (!text) return 1000;
  
  // Média de velocidade humana: ~35 caracteres por segundo
  // Adiciona variabilidade de 15% para não parecer mecânico
  const baseMs = (text.length / 35) * 1000;
  const jitter = (Math.random() * 0.3 - 0.15) * baseMs;
  const calculated = baseMs + jitter;

  // Limites ergonômicos: no mínimo 1.2s (para a pessoa ver "digitando...") e no máximo 4.0s
  return Math.min(Math.max(calculated, 1200), 4000);
}

export function calculateAudioRecordingDelayMs(text: string, speed = 1.0): number {
  if (!text) return 2000;

  // Estimativa de fala natural em português: ~140 palavras por minuto (~2.3 palavras por segundo)
  const words = text.trim().split(/\s+/).length;
  const estimatedSeconds = (words / (2.3 * speed));
  
  // Delay de simulação de "Gravando áudio..." (mín 2s, máx 5.5s na interface)
  return Math.min(Math.max(estimatedSeconds * 600, 2000), 5500);
}

export function formatAudioDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
