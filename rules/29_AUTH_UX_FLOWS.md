# Fluxos de autenticação — UX, segurança e estados

## 1. Objetivo

Este arquivo é o contrato detalhado das telas de Login, Registro, Verificação de e-mail, Recuperação de senha, Código de verificação e Nova senha no `tenant-web`.

Todas usam `AuthShell` e tokens/componentes dos arquivos `12`, `14`, `22` e `24`.

---

## 2. Tela: Login

### Conteúdo

Título: **Bem-vindo de volta**  
Descrição: **Entre na sua conta para acessar o BipeSend.**

Campos:
- `E-mail`
- `Senha`

Ações:
- checkbox `Lembrar de mim` somente se existir semântica real de sessão;
- link `Esqueci minha senha`;
- botão `Entrar no BipeSend`;
- link `Criar conta`.

### Comportamento Visual e Validação (Global para Auth)

- **Tamanhos Desktop**: Campos (Inputs) devem ter altura de `46px` (`h-[46px]`), fonte de `14px` (`text-[14px]`), e ícones de `18px` (`w-[18px] h-[18px]`).
- **Comportamento de Validação**: Validação de formulários deve ser disparada no evento de **onBlur** (quando o usuário sai do campo ou clica em Enviar), e **NÃO no onChange** (durante a digitação).
- **Cores dos Ícones**: 
  - Se o campo possui erro, o ícone fica **Vermelho** (`text-red-500`).
  - Se o campo está preenchido corretamente e foi tocado, o ícone fica **Azul** (`text-[#1478FF]`).
  - Estado inicial/padrão: **Cinza** (`text-[#7F90B2]`).
- **Erros de Servidor (Login/Recuperação)**: Em caso de falha de login (credenciais inválidas), exibir uma mensagem genérica no topo do formulário ("Confira os dados inseridos."). **Não** exibir os erros inline dentro de cada input para evitar vazar informações sobre qual campo exatamente falhou.

### Comportamento (Login)

- e-mail usa `autocomplete="email"`;
- senha usa `autocomplete="current-password"`;
- Enter envia quando formulário válido;
- toggle de senha não perde foco/contexto;
- submit desabilita repetição e mostra `Entrando...`;
- erro de credencial: mensagem genérica;
- não revelar se e-mail existe;
- não limpar e-mail por erro;
- senha pode ser limpa após falha conforme política de segurança, sem impedir password manager;
- após sucesso, transição para app sem animação longa.

### Erros

- formato de e-mail inválido: local;
- credenciais inválidas: geral;
- rate limit: informar tentativa posterior sem detalhes de defesa;
- conta pendente de verificação: fluxo pode oferecer reenviar verificação sem vazar informação para usuário não autenticado de forma insegura.

---

## 3. Tela: Criar conta

### Conteúdo

Título: **Crie sua conta**  
Descrição: **Comece a organizar sua operação com o BipeSend.**

Campos:
- Nome completo
- Nome da empresa
- E-mail profissional
- Senha
- Confirmar senha

Checkbox:
- aceite de Termos de Uso e Política de Privacidade, com links acessíveis.

CTA:
- `Criar minha conta`

Secundário:
- `Já possui uma conta? Entrar`

### Senha

Mostrar requisitos em tempo real:
- comprimento mínimo definido pela política;
- senha não comum/comprometida quando serviço estiver disponível;
- demais requisitos somente se realmente exigidos pelo backend.

Evitar regras artificiais excessivas. O frontend deve refletir exatamente a política do servidor.

Medidor de força de senha:
- Exigir no mínimo **9 caracteres** totais e **1 caractere especial** (ex: `!@#`).
- Barra indicadora de força deve possuir **3 segmentos** de cores crescendo conforme a força (Vermelho, Amarelo, Verde).
- Os textos informativos ("Mínimo 9 caracteres" centralizado, "1 especial (ex: !@#)" à direita) devem ficar visíveis permanentemente abaixo da barra.
- Quando as condições forem atendidas, o respectivo texto fica com cor verde e estilo bold/semibold.

### Submit

- validar confirmação;
- `Criando conta...`;
- impedir duplo submit;
- sucesso leva para verificação de e-mail/onboarding;
- erro por e-mail já usado deve seguir decisão de produto/segurança sem facilitar enumeração indevida.

---

## 4. Tela: Solicitar recuperação de senha

### Conteúdo

Título: **Recupere sua senha**  
Descrição: **Informe seu e-mail e enviaremos as instruções para redefinir sua senha.**

Campo:
- E-mail

CTA:
- `Enviar código`

Secundário:
- `Voltar para o login`

### Resposta segura

Após envio, sempre responder de forma neutra:

**Se existir uma conta com esse e-mail, enviaremos um código de verificação.**

Não variar tempo/mensagem de forma facilmente enumerável quando puder ser evitado.

### Loading

Botão: `Enviando...` + spinner discreto.

---

## 5. Tela: Código de verificação

### Conteúdo

Título: **Digite o código**  
Descrição: **Enviamos um código de 6 dígitos para o e-mail informado.**

Para privacidade, mascarar endereço quando necessário:
`jo***@empresa.com`.

### Componente `OtpInput`

Visualmente, 6 caixas. Semanticamente, preferir implementação robusta que suporte:

- digitação contínua;
- apenas caracteres permitidos;
- `inputmode="numeric"`;
- `autocomplete="one-time-code"`;
- Ctrl+V / Cmd+V com os 6 dígitos;
- colar pelo menu contextual/toque no mobile;
- remover espaços/hífens comuns do texto colado quando seguro;
- se colagem tiver exatamente o tamanho esperado, preencher todas as posições;
- se colagem for inválida, não destruir conteúdo existente;
- Backspace apaga posição atual e navega de forma previsível;
- setas podem mover o cursor/foco;
- ao completar, pode validar automaticamente somente se não criar chamadas duplicadas; alternativa preferível é botão `Verificar código`.

### CTA

`Verificar código`

### Reenvio

Texto durante cooldown:
`Reenviar código em 00:45`

Depois:
`Reenviar código`

Regras:
- cooldown visível;
- clique não inicia múltiplos envios;
- rate limit real no servidor;
- reenviar deve seguir política sobre invalidar código anterior;
- contador é UX, não mecanismo de segurança.

### Erro

`Código inválido. Confira os dígitos e tente novamente.`

Código expirado:
`Este código expirou. Solicite um novo código.`

Não limpar automaticamente os seis dígitos em erro comum. Selecionar/focar a primeira posição apropriada para facilitar correção.

### Segurança

- número de tentativas limitado por desafio;
- desafio de uso único;
- expiração curta;
- auditoria sem OTP;
- não aceitar desafio de outro usuário/tenant;
- proteção contra replay.

---

## 6. Tela: Criar nova senha

### Conteúdo

Título: **Crie uma nova senha**  
Descrição: **Escolha uma senha nova para proteger sua conta.**

Campos:
- Nova senha
- Confirmar nova senha

Ambos com toggle acessível.

### Requisitos

Lista atualizada em tempo real com ícone + texto. Estados não dependem apenas de verde/vermelho.

Exemplo:
- `Possui pelo menos X caracteres`
- `Não aparece em lista de senhas comprometidas` quando validável
- requisitos adicionais conforme backend

Confirmação:
- `As senhas coincidem` ou mensagem de divergência após interação.

### CTA

`Redefinir senha`

Loading:
`Atualizando...`

### Segurança

- token/desafio de recuperação não fica exposto em log;
- redefinição invalida desafio;
- revogar sessões conforme política;
- não fazer login automático se política exigir nova autenticação;
- se login automático for aprovado, rotacionar sessão e registrar evento.

---

## 7. Tela: Sucesso

Ícone/check animado discretamente.

Título:
**Senha alterada com sucesso**

Descrição:
**Sua senha foi atualizada. Entre novamente para continuar.**

CTA:
`Ir para o login`

Não deixar a tela parada sem próxima ação.

---

## 8. Verificação de e-mail no registro

Mesmo padrão do OTP:
- mensagem segura;
- 6 dígitos ou link assinado, conforme backend;
- reenvio com cooldown;
- expiração;
- uso único;
- Ctrl/Cmd+V;
- mobile;
- sucesso leva para onboarding.

---

## 9. Motion do fluxo

- entrada da etapa: fade + deslocamento de 4–8 px, 180–280 ms;
- troca login ↔ registro: fade/slide curto;
- foco de campo: ring instantâneo + transição 140 ms;
- button hover: elevação mínima;
- pressed: feedback 80 ms;
- success check: até 320 ms;
- não usar shake em erro;
- reduced motion remove deslocamentos e desenho animado do check.

---

## 10. Mobile

- largura mínima suportada: 360 px;
- painel decorativo oculto;
- teclado não pode cobrir CTA crítico sem possibilidade de scroll;
- OTP usa teclado numérico;
- colagem por toque funciona;
- botão principal pode ocupar largura inteira;
- links possuem área de toque confortável.

---

## 11. Acessibilidade

- headings em ordem;
- labels explícitas;
- erros conectados aos campos;
- live region para feedback de envio/reenvio;
- foco vai para mensagem/primeiro erro somente quando melhora a navegação;
- OTP possui nome do grupo e instrução;
- contador de reenvio não deve anunciar a cada segundo para leitor de tela; atualizar texto visual e anunciar apenas quando disponível.

---

## 12. Analytics seguros

Eventos permitidos sem PII:
- `auth_login_submitted`
- `auth_login_succeeded`
- `auth_login_failed_category`
- `auth_recovery_requested`
- `auth_code_submitted`
- `auth_password_reset_succeeded`

Nunca enviar e-mail, senha, OTP, token, cookie ou motivo interno sensível ao analytics.

---

## 13. Critérios de aceite

- login e registro consistentes visualmente;
- recuperação completa sem enumeração de conta;
- código aceita digitar e colar;
- reenvio tem cooldown e backend rate limit;
- código inválido não apaga tudo;
- nova senha e confirmação funcionam;
- loading impede duplo submit;
- sucesso tem próxima ação;
- teclado completo;
- mobile 360 px;
- reduced motion;
- testes E2E de sucesso, erro, expirado, rate limit e paste.
