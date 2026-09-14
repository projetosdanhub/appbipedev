# Pesquisa aplicada à fundação BipeSend

Data de consulta: 2026-09-13. Escopo: padrões de CRM/inbox, design system, multi-tenant, autenticação, eventos, IA, acessibilidade, performance e governança. Resultado aplicado nesta branch; cobertura técnica efetivamente executada em `docs/audit/validation.md`.

## Conclusão e método

A direção recomendada para BipeSend é uma interface operacional fluida, com navegação persistente, contexto do cliente perto da conversa, densidade controlada e ação principal evidente. A fundação de segurança precisa resolver identidade, tenant, autorização, transações e eventos antes da ativação de funcionalidades reais. Design system, contratos e taskboard devem fornecer um ponto de consulta estável, com evolução versionada por necessidade.

A pesquisa usa documentação primária de produtos e normas, acompanhada de inspeção do repositório. Documentação comercial comprova o funcionamento descrito pelo fornecedor; não comprova uma taxa de conversão. Nenhuma alegação de “dashboard de alta conversão” ou aumento percentual foi inferida dessas fontes. As escolhas de composição para BipeSend são hipóteses de produto informadas por padrões observados, a validar com tarefas reais de usuários.

A amostra priorizou Intercom para atendimento, HubSpot para rotina comercial, W3C/Radix para interação, OWASP/PostgreSQL para controles e AWS para consistência de eventos. Ela não é um ranking exaustivo de CRMs. Não foram inspecionadas contas pagas, analytics de clientes ou produção do BipeSend; o histórico enviado pelo usuário foi tratado como relato até localizar evidência correspondente.

## Padrões observados no mercado

| Fonte primária | Observação documentada | Decisão proposta para BipeSend |
| --- | --- | --- |
| [Intercom: personalização do Inbox](https://www.intercom.com/help/en/articles/7911926-customize-the-inbox-to-suit-you-and-how-you-work-best) | Organização do inbox por views, equipes, layout e preferências de trabalho | Navegação por tarefa; visões salvas autorizadas; lista/conversa/contexto; preferência de layout sem duplicar dados |
| [Intercom: apps no Inbox](https://www.intercom.com/help/en/articles/6546031-customize-the-inbox-with-apps) | Apps e detalhes próximos à conversa permitem organizar o contexto de atendimento | Painel contextual com contato, negócio e histórico; integrações aparecem quando relevantes e autorizadas |
| [HubSpot: atividades no sales workspace](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace) | Workspace comercial organiza trabalho e atividades, com modos de visualização e filtros | Início focado em próxima ação e pendências; filtros úteis e estado preservado ao abrir um registro |

Essas observações justificam testar uma composição orientada a trabalho. Não justificam copiar marca, densidade ou toda a complexidade desses produtos. BipeSend está em estágio anterior: uma interface carregada de métricas fictícias, notificações vazias e ações sem efeito causaria uma expectativa incorreta.

A aplicação nesta branch é o shell com sidebar expansível, agrupamento de áreas, navegação móvel própria, refresh, tema e perfil. O início autenticado usa a identidade real e indica métricas indisponíveis. CRM/inbox/automações existentes continuam identificados como prévias. A galeria separa demonstrações de componentes das rotas protegidas.

## Modelo de experiência proposto

A unidade de navegação principal é a tarefa: acompanhar operação, atender conversa, gerir contato, avançar oportunidade e configurar uma integração. Uma tela tem título/contexto, ação principal, filtros e conteúdo. Ações de baixo uso vão para menu; indicadores só aparecem quando há dado confiável e definição do período.

No inbox desktop, lista e conversa devem coexistir; detalhes do contato podem abrir em painel. No mobile web, a tarefa muda de composição: lista → conversa → contexto, com retorno preservando filtro e rascunho. Redimensionar três colunas até caber no telefone não resolve a tarefa. O app nativo futuro precisa de arquitetura própria e contrato de autenticação/armazenamento apropriado.

CRM deve oferecer cards e lista, com ação acessível “Mover para etapa” além de drag. Importação precisa de preview, validação e feedback por linha. Seleção em massa deve explicar se atua na página ou em todos os resultados; uma simples caixa marcada não define um lote autorizado no servidor.

A avaliação de produto deve medir tarefas, não apenas cliques: tempo até encontrar uma conversa, conclusão da primeira configuração, primeira resposta útil, erros na importação e recuperação de uma falha. Definir evento, denominador, janela e população antes de medir conversão. Coletar somente dados necessários e sem conteúdo de conversa/senha. Nenhuma dessas métricas foi medida nesta auditoria.

## Design system e acessibilidade

A biblioteca canônica concentra cores semânticas, tipografia, radius, alturas, espaçamento e motion. Inter/Poppins e a marca existente foram preservadas; controles usam tons específicos para contraste em cada tema. Componentes nativos/Radix dão uma base para foco, teclado e semântica; a composição do produto ainda precisa de testes. [Documentação Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog).

A meta é WCAG 2.2 AA: contraste de texto comum 4,5:1, texto grande 3:1, identificação de controles/erros, teclado, foco não encoberto e reflow. O mínimo de alvo AA de 24 px tem condições/exceções; BipeSend escolhe 44 px como padrão confortável. Não bloquear paste ou gerenciador de senha. Um resultado sem violações no axe não certifica o fluxo completo. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

Combobox exige comportamento coerente de entrada, popup e opção ativa, não apenas aparência de select com pesquisa. Por isso seu contrato inclui setas, Enter, Escape, nome acessível e listbox. Validar abertura, filtragem, opção vazia e retorno de foco no navegador. [WAI-ARIA APG: Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

Princípios aplicados: erros junto ao campo persistem; credencial inválida usa mensagem genérica; loading impede duplicata; estado vazio explica o próximo passo; sucesso não cria atraso artificial. Light/dark alteram contraste, sem alterar significado. A marca raster existente permanece intacta sobre superfície clara quando necessário; não foi inventada uma segunda logo oficial.

## Identidade, recuperação e superfície

Recuperação exige resposta neutra, limite de tentativas, desafio imprevisível, expiração e uso único. Credenciais de recuperação não devem aparecer em URL/log; troca de senha demanda uma política clara de sessões. A implementação usa CSPRNG, HMAC com propósito, consumo transacional e prova em cookie HttpOnly. Ainda é necessário testar concorrência no banco real e reduzir diferenças de timing do envio síncrono. [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).

A documentação Next separa autenticação, sessão e autorização, e orienta verificar permissões perto do acesso aos dados. Um redirecionamento no proxy não é proteção suficiente. Nesta branch o layout protegido consulta a sessão no servidor; o proxy apenas facilita a navegação. Server Actions também precisam validar entrada e autoridade em cada operação. [Next.js: Authentication](https://nextjs.org/docs/app/guides/authentication).

Tenant e platform têm segredos/cookies distintos e classe de identidade validada. A revisão do usuário no banco invalida JWT antigo após mudança de senha. Contudo, logout local não revoga uma cópia do JWT por dispositivo; o registro de sessões ainda precisa ser consolidado. MFA obrigatório no platform não equivale a enrollment, recuperação, proteção da chave e prevenção de replay completos.

A política de senha de 9–128 caracteres com símbolo foi mantida por compatibilidade com o produto existente. Ela não é apresentada como padrão universal mais moderno. Uma futura revisão deve alinhar requisitos de autenticação, lista de senhas comprometidas e MFA, migrando simultaneamente todas as superfícies e testes.

## Multi-tenant e autorização

O identificador vindo do header, URL ou seletor é um pedido de escopo. Antes de acessar recurso, o servidor deve comprovar usuário, membership atual e permissão nesse escopo. Cache, busca vetorial, blob, fila e realtime precisam carregar o mesmo isolamento, não apenas as tabelas principais. Testes negativos devem tentar IDs de outro tenant, e não só consultar um filtro diferente. [OWASP Multi-Tenant Security](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html).

RLS tem nuances: proprietário/superuser/roles com BYPASSRLS podem evitar policies, e USING/WITH CHECK regulam leitura e escrita. O runtime deve operar com privilégios mínimos e contexto de transação. FORCE RLS e vínculos indiretos precisam de análise explícita. O histórico atual não comprova esses controles; foi entregue inventário e plano de reconciliação. [PostgreSQL 16: Row Security Policies](https://www.postgresql.org/docs/16/ddl-rowsecurity.html).

A matriz de papéis é centralizada e nega o que não foi concedido. Além de papel, decisões precisam considerar recurso, setor, estado da membership e operação. Não confiar apenas em esconder botão ou em permissão serializada no cliente. A camada de dados deve evitar TOCTOU nas mutações sensíveis e testes precisam abranger escalada horizontal e vertical. [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Para BipeSend, a prioridade é reconciliação de schema, papel de runtime, membership ativa e sessão consolidada. Não é seguro ativar CRM completo enquanto o cadastro cria somente user, o onboarding de tenant ainda não existe e os históricos geram colunas incompatíveis. Esses achados justificam reabrir cards previamente marcados DONE.

## Eventos, integrações e operação

Outbox resolve a escrita dupla entre banco e publicação: a mudança e o evento são persistidos na mesma transação; um relay publica depois. Isso implica entrega repetível e consumidores idempotentes. O helper de pacote é somente uma interface; a prova depende de storage, locks, relay e testes de falha. [AWS: Transactional Outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

Webhooks exigem verificação do protocolo real do provider nos bytes originais. Janela de timestamp reduz aceitação de mensagens antigas, mas não elimina replay dentro da janela. A deduplicação precisa de índice persistente por provider/tenant/event ID antes dos efeitos. Uma chave com prefixo reconhecível não é autenticação; API keys públicas precisam de hash, escopo, validade, rotação e revogação.

Logs devem apoiar investigação sem virar outro repositório de segredos ou dados sensíveis. Usar correlação, evento/resultado e metadados controlados; evitar corpo de mensagem, token, senha e stack pública. O helper allowlist e redaction de headers são parte da aplicação desse princípio; auditoria pesquisável e retenção ainda precisam de implementação. [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

ASVS oferece uma referência verificável para requisitos de aplicação; propõe-se usá-lo como base de revisão com escopo equivalente ao nível 2, sem declarar conformidade por checklist local. Referências de requisito devem carregar versão para evitar mudança de significado ao atualizar a norma. [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/).

## IA, chatbot e MCP

Prompt injection pode vir de mensagem, documento recuperado, metadata e retorno de ferramenta. Instruções embutidas nesses dados não devem conceder autoridade. Separar contexto confiável de conteúdo, validar saída/argumentos, minimizar ferramentas e testar exfiltração e mudança de objetivo. Aprovação humana útil precisa mostrar efeito concreto e escopo, não uma pergunta vaga. [OWASP: LLM Prompt Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

MCP amplia a superfície entre cliente, servidor, ferramentas e credenciais. Aplicar escopo mínimo, validação, auditoria e isolamento por tenant; não fornecer uma conexão administrativa global ao agente. A autoridade deve vir do usuário/sessão/ação permitida, não do texto produzido pelo modelo. [OWASP MCP Security](https://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html).

A evolução proposta é upload em quarentena → extração limitada → chunks versionados → retrieval com tenant e ACL → copiloto de leitura → tools autorizadas. O custo também é um recurso protegido: orçamento por tenant/modelo, timeout, limite de contexto e cancelamento. Exclusão de dados precisa atingir documento, chunks, embeddings e cache, conforme retenção definida. Nada disso está declarado como implementado pelo simples fato de os pacotes existirem.

## Performance, SEO e dados

Os alvos de experiência de campo são LCP até 2,5 s, INP até 200 ms e CLS até 0,1, avaliados no percentil 75. Um build bem-sucedido e uma auditoria local de layout não medem esses indicadores de usuários reais. [web.dev: Web Vitals](https://web.dev/articles/vitals).

A implementação limita a fronteira cliente, usa fontes carregadas no app e componentes compartilhados; busca tem debounce cancelável. Para dados reais, adicionar paginação, queries indexadas, cache autorizado e descarte de resposta obsoleta. Charts/canvas/editor pesados entram por rota e com medição de bundle. Não aplicar memoização indiscriminada como substituto de diagnóstico.

SEO tem duas superfícies: marketing/catálogo público indexável quando publicado, e painel/auth noindex. Robots não protege informação: autenticação/autorização fazem isso. Evitar OG/canonical para assets e domínios não verificados. Nesta branch foram corrigidas diretivas de indexação do painel; publicação pública precisa de revisão própria.

Governança deve classificar identidade, conversa, documentos, embeddings, billing e auditoria; definir finalidade, retenção, exportação, exclusão, suporte e incidente. A pesquisa técnica não substitui a definição jurídica/contratual do tratamento. Antes de produção, revisar a política aplicável ao negócio e a operação de atendimento aos titulares com responsáveis designados.

## Plano priorizado e limites

| Prioridade | Entrega | Evidência de saída |
| --- | --- | --- |
| P0 | Reconciliar schema e runtime role; consolidar sessão/MFA/tenant | integração com banco real e E2E negativo entre superfícies |
| P1 | Conectar cadastro verificado, onboarding e convites | fluxo completo com rollback/concorrência e e-mail local |
| P1 | Usar UI canônica no CRM/inbox | tarefas por teclado/mobile e backend autorizado, sem dados falsos |
| P2 | Persistir outbox/auditoria/health | testes de queda, repetição, isolamento e recuperação |
| P2 | Provider/IA/billing por adapter | contratos, sandbox, escopo/custo e tratamento de eventos |
| P3 | Nativo, offline e escala | ADR, segurança do aparelho, paridade e métricas de uso |

A branch entrega a fundação executável, a revisão das regras e 85 cards com instruções. A manutenção futura fica concentrada nas fontes canônicas e em gates reproduzíveis. Não existe configuração que dispense atualizar dependências, ameaças e regras quando o produto evolui.
