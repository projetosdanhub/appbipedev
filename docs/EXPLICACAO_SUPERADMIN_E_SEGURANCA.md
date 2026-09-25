# BipeSend — Guia de Arquitetura: SuperAdmin, Multi-Administradores, 2FA e Segurança

Este documento explica em detalhes o funcionamento das contas SuperAdmin, a possibilidade de múltiplos administradores, as permissões de exclusão, o funcionamento do 2FA para clientes (Tenants) e as garantias de segurança da plataforma.

---

## 1. Como Funciona a Criação da Conta SuperAdmin?

No BipeSend, a arquitetura de usuários é unificada na tabela `User` do banco de dados (PostgreSQL via Prisma ORM), diferenciada por papéis e contextos:

```prisma
model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  name                 String?
  password             String?   // Hash Argon2id
  isSuperadmin         Boolean   @default(false) @map("is_superadmin")
  twoFactorEnabled     Boolean   @default(false) @map("two_factor_enabled")
  twoFactorSecret      String?   @map("two_factor_secret")
  twoFactorBackupCodes String[]  @default([]) @map("two_factor_backup_codes")
  // ...
}
```

### O que define um SuperAdmin?
1. **Flag `isSuperadmin = true`**: Concede acesso à superfície da plataforma (`surface: "platform"`).
2. **Independência de Tenant**: O Superadmin não precisa pertencer a uma empresa/workspace específica para existir.
3. **2FA Obrigatório**: O Superpainel bloqueia o acesso caso o 2FA não seja ativado no primeiro login.

---

## 2. Posso Criar Mais de uma Conta SuperAdmin?

**SIM, com certeza!** 

O banco de dados não restringe a quantidade de SuperAdmins. A restrição de unicidade é apenas no endereço de e-mail (`email @unique`).

### Como múltiplos SuperAdmins operam:
* Cada administrador tem seu próprio login (`dan@bipesend.com.br`, `socio@bipesend.com.br`, `suporte@bipesend.com.br`).
* Cada um possui sua própria senha criptografada em **Argon2id**.
* Cada um possui seu **próprio aplicativo autenticador** (seu próprio QR Code / Segredo TOTP e seus próprios códigos de backup).
* As ações de cada um ficam identificadas individualmente nos logs de auditoria (`AuditEvent` / `AuditLog`), permitindo saber exatamente qual administrador executou qual ação na plataforma.

> **Nota sobre o script de teste:** O arquivo `scripts/create-superadmin.ts` excluía registros anteriores apenas porque foi feito como utilitário de *reset* rápido para testes em ambiente local. Criamos um comando específico para adicionar administradores extras sem apagar ninguém.

---

## 3. Uma Conta Admin Pode Deletar Outra Conta Admin?

Atualmente, a gestão de Superadmins foi operada via scripts de linha de comando. Ao levar a gestão de administradores para a interface do Superpainel (UI), as seguintes **regras fundamentais de segurança** devem ser respeitadas:

1. **Prevenção de Auto-Exclusão:** Um superadmin nunca pode deletar a si mesmo (para não ficar bloqueado para fora imediatamente por engano).
2. **Prevenção do "Último Administrador":** O sistema deve bloquear a exclusão caso reste apenas 1 superadmin ativo no banco de dados.
3. **Confirmação Crítica com 2FA:** Para excluir outro administrador ou revogar acesso, deve ser solicitada a digitação do código 2FA de 6 dígitos de quem está efetuando a exclusão.
4. **Log Imutável:** A exclusão deve registrar um evento em `AuditEvent` com timestamp, IP e o ID de quem excluiu.

---

## 4. O QR Code / 2FA Também Funciona para as Contas dos Clientes (Tenants)?

**SIM! O sistema de 2FA já está totalmente implementado para os clientes.**

No painel do cliente (`apps/tenant-web`):
1. **Onde fica:** O cliente acessa **Configurações ➔ Segurança** (`/settings/security`).
2. **Ativação:** 
   - O cliente clica em *"Configurar 2FA"*.
   - Uma ação segura de servidor (`generate2FASecret`) gera a URI e o QR Code em tempo real.
   - O cliente aponta o aplicativo (*Google Authenticator*, *Microsoft Authenticator*, *Authy*, etc.) ou insere a chave manual.
   - Digita o código de 6 dígitos para validar e ativar.
   - O sistema devolve **10 Códigos de Recuperação (Backup Codes)** para guardar em local seguro.
3. **No Login do Cliente:**
   - Ao acessar `http://localhost:3000/login`, após digitar e-mail e senha, o cliente com 2FA ativado é direcionado para a tela de autenticação de duas etapas.
4. **Desativação Segura:**
   - Se o cliente desejar desligar o 2FA, ele é obrigado a digitar a senha da sua conta para confirmar que é ele mesmo.

Como o pacote de autenticação `@bipesend/auth` é compartilhado por todo o monorepo, a calibração de *guardrails* e a tolerância de relógio (±60s) que realizamos hoje **já está funcionando de forma robusta e idêntica para todos os clientes**.

---

## 5. Garantias de Segurança Contra Injections e Códigos Falsos

| Camada | Proteção Implementada no BipeSend |
| :--- | :--- |
| **SQL Injection** | O sistema utiliza **Prisma ORM** com *Prepared Statements* nativos em PostgreSQL. Nenhum input do usuário é concatenado diretamente como texto no SQL. Parâmetros são tratados como tipos de dados rígidos pelo protocolo binário do banco. |
| **Códigos Falsos (TOTP)** | Algoritmo **RFC 6238 (HMAC-SHA1)** com segredo de 160 bits gerado por CSPRNG (`randomBytes`). O código é baseado na rotação matemática de tempo (janela de 30s). É impossível forjar ou adivinhar o código sem ter a chave secreta armazenada no banco. |
| **Força Bruta (Brute-Force)** | O pacote `@bipesend/security` acoplado ao `@bipesend/auth` executa controle de taxa (**Rate Limiting em Redis com scripts Lua atômicos**). Múltiplas tentativas incorretas bloqueiam temporariamente o atacante (`AUTH_RATE_LIMITED`). |
| **Roubo de Credenciais** | Criptografia com **Argon2id**, resistente a ataques massivos usando hardware dedicado (GPUs/ASICs). |
| **Sequestro de Sessão (XSS/CSRF)** | Cookies de autenticação protegidos por flags `HttpOnly` (inacessíveis via JavaScript malicioso), `SameSite: "lax"/"strict"` e assinados com HMAC pela chave secreta do servidor. |
| **Isolamento de Tenants** | O cliente nunca define o tenant ou permissões por payload confiado. O servidor valida a sessão, busca as `memberships` no banco e aplica as políticas RBAC do pacote `contracts`. |

---

## 6. Sugestões de Melhorias Recomendadas

Para elevar ainda mais a maturidade da plataforma, sugerimos as seguintes melhorias graduais:

1. **Tela de Gestão de SuperAdmins no Superpainel:**
   - Criar uma aba *"Equipe da Plataforma"* em `apps/superadmin-web/src/app/team` ou `settings/admins`.
   - Permitir convidar novos sócios/administradores por e-mail, onde o convidado define sua própria senha e escaneia o 2FA no primeiro acesso.
2. **Dispositivos Confiáveis (Remember Device por 30 dias):**
   - Permitir ao usuário marcar *"Não pedir 2FA neste dispositivo por 30 dias"*, criando um cookie seguro assinado que reduz o atrito sem abrir mão da segurança em novos dispositivos.
3. **Notificação por E-mail de Novo Login Administrativo:**
   - Sempre que um SuperAdmin fizer login a partir de um novo IP ou navegador, disparar um e-mail de alerta: *"Novo login detectado no Superpainel às 21:30"*.
4. **Exportação / Download dos Códigos de Backup:**
   - Permitir baixar os 10 códigos de backup em um arquivo `.txt` formatado ou imprimir com um clique na tela de ativação.
