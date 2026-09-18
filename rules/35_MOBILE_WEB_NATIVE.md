# Mobile web e aplicação nativa

Mobile web compartilha contrato e tokens com desktop, com composição específica: `features/workspace/mobile-navigation.tsx` e renderMobileCard em DataTable. CSS decide o modo de navegação; não duplicar queries, estado de negócio ou sessões conforme viewport.

- 320 px deve refluir; 360 px é alvo de avaliação cotidiana. De 768 a 1023 px mantém navegação compacta; ≥1024 px libera sidebar. Testar também zoom/texto e teclado virtual.
- Drawer contém a navegação completa; barra inferior prioriza tarefas frequentes e respeita safe-area. Rota ativa inclui filhos, nunca colisão por prefixo simples.
- Foco não pode ficar sob header, toolbar ou barra inferior. Formularios usam controles confortáveis, rolagem previsível e ações primárias alcançáveis.
- Inbox mobile: lista → conversa → contexto, com retorno que preserva filtros/rascunho. CRM mobile: lista/card e ação explícita de mover etapa além de drag. Canvas: lista de passos acessível como alternativa.
- Mobile web usa o mesmo tema claro do workspace, sem seletor de tema. A composição e a navegação continuam próprias para telas pequenas.
- App nativo futuro compartilha schemas, termos e políticas do servidor, sem importar componentes DOM/Radix/Next. Exige ADR, OAuth/PKCE ou sessão móvel apropriada, armazenamento seguro do SO, revogação, notificações e acessibilidade nativas; nunca copiar cookie do navegador para armazenamento comum.
- Não prometer offline: definir reconciliação, conflito, retenção e proteção local antes de armazenar dados de cliente no aparelho.

MOB-001/002 cobrem o nativo; sua ausência não invalida o mobile web implementado nem autoriza declararem paridade concluída.
