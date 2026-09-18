const STAGE_COLORS: Record<string, string> = {
  "blue-500": "#2f7ff7",
  "green-500": "#0e9f6e",
  "red-500": "#df4c6c",
  "yellow-500": "#d98b16",
  "purple-500": "#7067e8",
  "pink-500": "#db5790",
  "indigo-500": "#5c63dc",
  "teal-500": "#10968c",
  "orange-500": "#dc7626",
  "gray-500": "#6b7280",
  "slate-500": "#64748b",
  "cyan-500": "#0891b2",
};

export function stageColor(token: string): string {
  return STAGE_COLORS[token.replace(/^bg-/, "")] ?? "#64748b";
}
