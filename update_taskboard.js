const fs = require('fs');

const data = JSON.parse(fs.readFileSync('docs/taskboard.json', 'utf8'));

const newCard = {
  "id": "CRM-010",
  "title": "Implement Visual Automations (IMPLEMENTATION)",
  "milestone": "Milestone 4 - automações",
  "acceptance": [
    "React Flow canvas renderizado",
    "Sidebar de configuração funcionando",
    "API route mockada"
  ],
  "dependencies": [],
  "status": "DONE",
  "objective": "Implementar uma interface de automação visual semelhante ao n8n.",
  "steps": [
    "Instalar e configurar @xyflow/react",
    "Criar os nós customizados e sidebar",
    "Criar api route"
  ],
  "codeAreas": [
    "apps/tenant-web/src/app/(dashboard)/automations",
    "apps/tenant-web/src/features/automations"
  ],
  "tests": [
    "pnpm rules:check",
    "pnpm taskboard:check"
  ],
  "evidence": [
    "apps/tenant-web/src/app/(dashboard)/automations/page.tsx",
    "apps/tenant-web/src/app/api/automations/route.ts"
  ],
  "blockers": [],
  "owner": "Engenharia BipeSend"
};

const existingIndex = data.cards.findIndex(c => c.id === 'CRM-010');
if (existingIndex > -1) {
  data.cards[existingIndex] = newCard;
} else {
  data.cards.push(newCard);
}

fs.writeFileSync('docs/taskboard.json', JSON.stringify(data, null, 2));
console.log("Added CRM-010 to taskboard.json");
