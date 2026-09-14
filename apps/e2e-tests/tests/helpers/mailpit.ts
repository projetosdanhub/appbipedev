export async function getRecentEmailLinks(recipient: string): Promise<string[]> {
  try {
    const res = await fetch("http://127.0.0.1:8025/api/v1/messages");
    if (!res.ok) return [];
    const data = await res.json();
    
    // Find the latest message for the recipient
    const msg = data.messages.find((m: any) => m.To.some((t: any) => t.Address === recipient));
    if (!msg) return [];

    const msgRes = await fetch(`http://127.0.0.1:8025/api/v1/message/${msg.ID}`);
    if (!msgRes.ok) return [];
    
    const msgData = await msgRes.json();
    const html = msgData.HTML || msgData.Text || "";
    
    // Extract links (very basic regex)
    const links = html.match(/href="([^"]*)"/g);
    if (!links) return [];
    
    return links.map((l: string) => l.replace('href="', '').replace('"', ''));
  } catch (err) {
    console.error("Mailpit API error", err);
    return [];
  }
}
