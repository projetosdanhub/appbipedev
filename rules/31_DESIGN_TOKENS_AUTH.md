# Composição de autenticação — v2

Preservar a identidade visual de login e cadastro já existente, com títulos Inter e corpo Poppins. Tokens e acessibilidade seguem `14`; implementação compartilhada em `AuthLayout`, `Input`, `Button` e componentes de formulário.

- Auth tem superfície clara explícita e composição própria, com painel institucional apenas onde houver espaço. Mobile elimina decoração que atrapalha o formulário.
- Campos e CTA auth usam 54 px; operacional usa 44 px. Removida a disputa com valores locais de 46/52 px.
- Labels persistem acima do campo. Erro de formato fica associado por `aria-describedby`; erro de credencial é genérico e global. Nunca encobrir o valor ou remover erro por timeout.
- Permitir gerenciador de senha, colagem e autofill. OTP é um campo semântico que aceita o código completo; múltiplas caixas visuais não são requisito.
- Política de senha deve corresponder a `packages/contracts`; a política atual de compatibilidade é 9–128 caracteres com símbolo. Não afirmar consulta a senhas comprometidas se não implementada.
- Gradientes de ação usam tons AA do design system. A imagem de marca mantém as cores originais.
- Sucesso não cria espera artificial. Reduced motion é respeitado; loading nunca simula operação inexistente.
- E-mail na URL é dado pessoal: reduzir sua circulação e retirar do fluxo ao introduzir desafio opaco. OTP, prova e senha jamais na URL.

Veja AUTH-003/005/010/014 no taskboard para os gates de backend ainda pendentes. Aprovação visual não comprova segurança, e teste de UI sem banco não comprova envio de e-mail.
