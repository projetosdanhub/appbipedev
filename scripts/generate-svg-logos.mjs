import fs from "fs";
import path from "path";

const targets = [
  "apps/tenant-web/public/testimonials",
  "apps/superadmin-web/public/testimonials"
];

const svgs = {
  "logo-odonto-florescer.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="odontoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007BFF" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
  <g transform="translate(50, 24)">
    <path d="M50 8 C30 8 18 24 18 42 C18 64 28 82 36 94 C40 100 46 96 48 88 C50 78 50 78 52 88 C54 96 60 100 64 94 C72 82 82 64 82 42 C82 24 70 8 50 8 Z" fill="url(#odontoGrad)" />
    <path d="M50 22 C43 22 38 30 38 40 C38 54 46 66 50 72 C54 66 62 54 62 40 C62 30 57 22 50 22 Z" fill="#FFFFFF" opacity="0.95" />
    <circle cx="50" cy="40" r="6" fill="#10B981" />
  </g>
  <text x="100" y="150" font-family="'Inter', system-ui, sans-serif" font-size="12" font-weight="800" fill="#0F172A" text-anchor="middle" letter-spacing="1.5">ODONTO FLORESCER</text>
  <text x="100" y="168" font-family="'Poppins', system-ui, sans-serif" font-size="8" font-weight="600" fill="#10B981" text-anchor="middle" letter-spacing="1">CLÍNICAS INTEGRADAS</text>
</svg>`,

  "logo-burger-prime.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="burgerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="#0F172A" />
  <g transform="translate(50, 24)">
    <path d="M12 40 C12 18 30 12 50 12 C70 12 88 18 88 40 Z" fill="url(#burgerGrad)" />
    <rect x="16" y="46" width="68" height="8" rx="4" fill="#10B981" />
    <path d="M14 60 C18 56 26 56 30 60 C36 64 44 64 50 60 C56 56 64 56 70 60 C76 64 82 64 86 60" stroke="#EF4444" stroke-width="4.5" stroke-linecap="round" fill="none" />
    <rect x="10" y="69" width="80" height="13" rx="6.5" fill="#78350F" />
    <path d="M16 88 C16 94 28 98 50 98 C72 98 84 94 84 88 Z" fill="url(#burgerGrad)" />
    <circle cx="35" cy="24" r="2.2" fill="#FEF3C7" />
    <circle cx="50" cy="20" r="2.2" fill="#FEF3C7" />
    <circle cx="65" cy="24" r="2.2" fill="#FEF3C7" />
  </g>
  <text x="100" y="152" font-family="'Inter', system-ui, sans-serif" font-size="13" font-weight="900" fill="#F8FAFC" text-anchor="middle" letter-spacing="2">BURGER PRIME</text>
  <text x="100" y="170" font-family="'Poppins', system-ui, sans-serif" font-size="8" font-weight="600" fill="#F59E0B" text-anchor="middle" letter-spacing="1.5">HAMBURGUERIA ARTESANAL</text>
</svg>`,

  "logo-bella-napoli.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="pizzaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#DC2626" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="#FFFDF5" stroke="#FDE68A" stroke-width="2" />
  <g transform="translate(50, 22)">
    <circle cx="50" cy="52" r="42" fill="#FEF3C7" />
    <path d="M50 14 L86 78 C86 78 50 90 14 78 Z" fill="#F59E0B" />
    <path d="M48 24 L78 72 C78 72 48 82 22 72 Z" fill="#FBBF24" />
    <circle cx="45" cy="45" r="5.5" fill="#DC2626" />
    <circle cx="60" cy="62" r="4.5" fill="#DC2626" />
    <circle cx="35" cy="65" r="5" fill="#DC2626" />
    <circle cx="55" cy="35" r="2.5" fill="#16A34A" />
    <circle cx="42" cy="58" r="2" fill="#16A34A" />
    <path d="M14 78 C30 84 70 84 86 78" stroke="#B45309" stroke-width="5" stroke-linecap="round" fill="none" />
  </g>
  <text x="100" y="152" font-family="'Inter', system-ui, sans-serif" font-size="13.5" font-weight="900" fill="#78350F" text-anchor="middle" letter-spacing="1.5">BELLA NAPOLI</text>
  <text x="100" y="170" font-family="'Poppins', system-ui, sans-serif" font-size="7.8" font-weight="700" fill="#DC2626" text-anchor="middle" letter-spacing="1.2">PIZZARIA &amp; FORNO A LENHA</text>
</svg>`,

  "logo-techhouse.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#007BFF" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="#0F172A" />
  <g transform="translate(56, 20)">
    <rect x="12" y="8" width="64" height="92" rx="12" fill="#1E293B" stroke="url(#techGrad)" stroke-width="3" />
    <rect x="18" y="18" width="52" height="68" rx="6" fill="#0B1120" />
    <circle cx="44" cy="92" r="3" fill="#007BFF" />
    <rect x="34" y="12" width="20" height="3" rx="1.5" fill="#64748B" />
    <path d="M28 52 L38 62 L60 40" stroke="#10B981" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </g>
  <text x="100" y="152" font-family="'Inter', system-ui, sans-serif" font-size="14.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">TECHHOUSE</text>
  <text x="100" y="170" font-family="'Poppins', system-ui, sans-serif" font-size="7.5" font-weight="700" fill="#38BDF8" text-anchor="middle" letter-spacing="1.2">ASSISTÊNCIA DE CELULARES</text>
</svg>`,

  "logo-studio-detail.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8" />
      <stop offset="100%" stop-color="#007BFF" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="36" fill="#0B1120" stroke="#1E293B" stroke-width="2" />
  <g transform="translate(42, 28)">
    <path d="M10 56 C18 48 30 38 50 32 C72 26 95 34 106 48 L114 60 C114 64 108 66 98 66 L18 66 C10 66 8 62 10 56 Z" fill="url(#carGrad)" />
    <circle cx="34" cy="66" r="9" fill="#0F172A" stroke="#38BDF8" stroke-width="3" />
    <circle cx="88" cy="66" r="9" fill="#0F172A" stroke="#38BDF8" stroke-width="3" />
    <polygon points="58,16 64,24 74,24 66,30 69,40 58,34 47,40 50,30 42,24 52,24" fill="#FACC15" />
  </g>
  <text x="100" y="152" font-family="'Inter', system-ui, sans-serif" font-size="12.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">STUDIO DETAIL</text>
  <text x="100" y="170" font-family="'Poppins', system-ui, sans-serif" font-size="7.5" font-weight="700" fill="#38BDF8" text-anchor="middle" letter-spacing="1.2">ESTÉTICA AUTOMOTIVA</text>
</svg>`
};

targets.forEach((t) => {
  if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  for (const [name, content] of Object.entries(svgs)) {
    const p = path.join(t, name);
    fs.writeFileSync(p, content, "utf8");
    console.log("Created: " + p);
  }
});
