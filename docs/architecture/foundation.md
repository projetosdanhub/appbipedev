# ADR — fundação de pacotes e superfícies

Status: adotado nesta branch para desenvolvimento; migração de banco e produção exigem gates separados. Data: 2026-09-13.

## Problema

Config/contracts/security/events eram diretórios descritivos sem bibliotecas executáveis. UI tinha primitives, mas faltavam tokens dark e interações reutilizáveis. As regras mantinham definições contraditórias e o taskboard marcava recursos de identidade como DONE sem correspondência integral no código. Auth.js e Fastify expunham implementações diferentes de recuperação/sessão, com históricos de banco incompatíveis.

## Decisões

1. Fontes canônicas: contracts para schemas, auth/policies para permissões, UI CSS para tokens, taskboard.json para execução. Guias descrevem intenção/limites, sem copiar valores para cada app.
2. Novos pacotes Node compilam dist; UI e runtime Auth.js/DB são consumidos por Next como fonte. API importa policies compiladas e não Next/Auth.js.
3. Auth.js é a entrada de identidade do navegador. Os seis endpoints HTTP legados /auth/* retornam 410, pois permitiam contornar rate limit/recovery novo. Não reativá-los antes de unificar a identidade. A ponte entre sessão web e API de dados permanece em AUTH-004/015, sem fingir que um JWT web é token_hash legado.
4. Cookies/segredos e validação de classe tenant/platform separados. Layout protegido consulta sessão no servidor; proxy é só navegação. JWT usa revisão de usuário com consulta ao banco, mas não há revogação individual por dispositivo pronta.
5. Recovery é desafio com HMAC, expiração e transação; prova de reset fica em cookie HttpOnly. E-mail permanece no fluxo existente e exige evolução para desafio opaco; envio assíncrono/timing entra no gate de integração.
6. Shell desktop/mobile tem composições próprias e estado compartilhado. Dados inexistentes são indisponíveis ou exemplos identificados, nunca métricas simuladas aparentando conta real. O catálogo público existe só em desenvolvimento.
7. Não reescrever nem executar migrations incompatíveis. Entregar inventário e plano por origem antes de escolher/aplicar a nova baseline. API continua com runtime legado para dados até reconciliação/ponte de identidade.
8. Outbox/AEAD/limiter são helpers e contratos. Workers, armazenamento de secrets existentes e auditoria durável precisam dos adapters/gates definidos, sem prometer implementação por existência de export.
9. Regras 34/35 cobrem evidência e mobile. DONE exige dependência satisfeita e evidência; a validação técnica local não certifica produção.

## Consequências e migração de consumidores

- Consumidores HTTP externos dos endpoints /auth/* precisam migrar para a superfície web ou aguardar o contrato de máquina apropriado. Não foi localizado um cliente externo autorizado no repositório.
- Componentes novos usam tokens. Telas CRM/inbox/canvas ainda possuem hardcodes e comportamentos de protótipo; sua migração completa acompanha o backend por card.
- Mudança de senha também invalida sessões web por updatedAt. Mudança inocente de perfil pode igualmente invalidar a sessão; futura authVersion dedicada elimina esse acoplamento.
- Logout atual não inutiliza cópia de JWT fora do navegador; tratar registro de sessão/revogação como bloqueio antes da produção.
- Serviços reais, MFA operacional, RLS e integração entre superfícies ainda exigem ambiente reconciliado e testes próprios.

## Verificação

Comandos e cobertura em docs/audit/validation.md. Pesquisa em docs/research/saas-foundation-2026-09.md. Nenhuma afirmação de conformidade, disponibilidade de domínio, branch protection ou taxa de conversão decorre deste ADR.
