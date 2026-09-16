"use client";

import { useEffect, useRef, useState } from "react";
import { PREVIEW_DEVICES, type PreviewDevice } from "./controls.js";

/** The caller supplies HTML from the safe renderer. No messages/scripts/origin privileges. */
export function DevicePreviewFrame({ html, device }: { html: string; device: PreviewDevice }) {
  const host = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const { label, width } = PREVIEW_DEVICES[device];
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setAvailable(entry.contentRect.width); });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const scale = available ? Math.min(1, available / width) : 1;
  return <section className="bw-ui-preview" aria-label="Prévia responsiva">
    <div className="bw-ui-preview-caption"><span>{label} · {width} px</span><span>Zoom {Math.round(scale * 100)}%</span></div>
    <div ref={host} className="bw-ui-preview-host"><div className="bw-ui-preview-size" style={{ width: width * scale, height: 820 * scale }}>
      <iframe title={`Prévia da página — ${label}`} sandbox="" referrerPolicy="no-referrer"
        allow="camera 'none'; microphone 'none'; geolocation 'none'" srcDoc={html}
        style={{ width, height: 820, transform: `scale(${scale})` }} />
    </div></div>
    <p className="bw-ui-preview-note">Prévia visual. Os links ficam inativos durante a edição.</p>
  </section>;
}
