# Comandos e contrato para agentes de IA

## 1. Bootstrap

`!construibase` significa:

1. ler `00_MASTER.md`;
2. ler regras específicas do módulo;
3. inspecionar implementação existente;
4. propor plano curto;
5. implementar sem violar contratos;
6. validar com testes/checks;
7. relatar arquivos e riscos.

## 2. Proibições

Agente não deve:
- inventar credencial;
- remover segurança para "fazer funcionar";
- criar bypass temporário sem aprovação;
- misturar tenants;
- criar componente duplicado quando existe canônico;
- hardcodar cores/tamanhos para imitar screenshot;
- colocar lógica de autorização apenas na UI;
- afirmar que teste passou sem executar;
- alterar migration histórica aplicada;
- expor segredo em exemplo.

## 3. Regras de UI para IA

Antes de criar tela, consultar `12`, `14`, `22`, `24`, `29` quando auth e `30`.

A IA deve:
- montar tela com primitives canônicas;
- usar tokens;
- implementar todos os estados;
- incluir responsividade;
- incluir teclado/a11y;
- aplicar motion canônico;
- não criar "design próprio" por página.

## 4. Formato de entrega

Ao finalizar, informar:
- o que mudou;
- arquivos;
- contratos alterados;
- testes executados;
- riscos/pendências;
- se houve mudança de design system.

## 5. Mudança de design system

Novo token, componente base ou padrão global exige justificar reutilização, impacto e migração. Não adicionar só para uma tela.

## Revisão de fundação — 2026-09-13

Para !construibase <ID>, consultar o card completo e dependências, implementar a fatia, validar e atualizar evidência. Não bloquear tarefas reversíveis já autorizadas por mero ritual de confirmação. Se dependência impedir conclusão, trabalhar a preparação útil e registrar o impedimento. Nunca declarar uma etapa DONE por relato de chat.
