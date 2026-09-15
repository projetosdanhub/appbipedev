# Auth & RBAC (Atualizado)

Este documento define as regras de autenticação e controle de acesso para a plataforma BipeSend, refletindo o modelo de identidade canônica, vínculos separados e cargos compostos por escopo.

## 1. Identidade e Vínculo (User vs Membership)

O sistema separa a pessoa física (`User`) do seu vínculo empregatício/comercial (`Membership`):
- **User (Global):** E-mail, senha, MFA e auditoria de login. Apenas prova *quem* é a pessoa.
- **Tenant (Empresa):** A organização que assina o serviço e é dona dos dados.
- **Membership (Vínculo):** A relação entre um User e um Tenant. Um User pode ter vários Memberships (ex: dono da sua loja e consultor em outra loja). O acesso a um Tenant depende exclusivamente do Membership, não do User.

> **Regra de Ouro:** Nenhuma verificação de autorização deve usar apenas o `userId`. Toda ação em um contexto de tenant deve validar e utilizar o `membershipId`.

## 2. Departamentos e Setores (Department)

Os Tenants podem ser divididos em Departamentos (ex: Vendas, Suporte, Diretoria).
- Um Membership pode pertencer a um ou mais departamentos.
- Cada vínculo a um departamento pode possuir um cargo específico para aquele departamento (escopo `DEPARTMENT`).

## 3. Cargos e Escopos (Role & Scope)

A autorização é baseada na soma das permissões de todos os cargos que o Membership possui. O sistema não utiliza herança obrigatória de privilégios.

Existem três tipos principais de atribuição de cargo:
1. **Cargo Global (Tenant Role):** Permissões que se aplicam a todo o Tenant. Exemplo: "Gerente Geral" com permissões irrestritas (proprietário).
2. **Cargo Departamental (Department Role):** Permissões restritas aos dados de um departamento. Exemplo: "Atendente Sênior" apenas no departamento "Suporte B2B".
3. **Exceção Direta (Membership Role):** Permissões concedidas diretamente a um membro sem a necessidade de criar um cargo inteiro para ele. Reservado a necessidades específicas e geridas pelo proprietário.

### Níveis de Escopo da Permissão
As verificações de acesso nas rotas devem validar o escopo da permissão que o usuário possui:
- **`TENANT`:** Acesso irrestrito a todos os registros da empresa (ex: Administrador).
- **`DEPARTMENT`:** Acesso aos registros que pertencem ou foram roteados para os departamentos aos quais o usuário pertence.
- **`OWN`:** Acesso apenas a registros criados pelo próprio usuário.
- **`ASSIGNED`:** Acesso a registros atribuídos (assigned) diretamente ao usuário.

## 4. Convites e Provisionamento

- Convites (`Invitation`) devem gravar um snapshot do acesso proposto no momento da criação (quais cargos e departamentos).
- Se os privilégios do cargo forem alterados entre a emissão do convite e o aceite pelo usuário, o convite precisará de re-validação.
- Não existem senhas provisórias em texto claro ou URLs abertas. O convite é aceito mediante prova de controle do e-mail.

## 5. Implementação (Camada de Aplicação)

- As rotas (Fastify/TRPC) devem usar a função utilitária `resolveTenantContext` (ou middleware equivalente) que carrega as permissões cumulativas baseadas no `membershipId`.
- As políticas são definidas no pacote `contracts` e executadas no pacote `auth/policies`.
- Nenhuma rota deve confiar cegamente no payload do cliente. Todas as validações devem extrair o Tenant da sessão/token criptográfico seguro gerado pelo servidor.

## 6. Auditoria

Todas as alterações de cargos, criações de departamentos e alterações em vínculos críticos geram um log imutável no banco (`AuditEvent`). O sistema deve capturar: *quem fez*, *o que fez*, *quando* e *o recurso afetado*.

## 7. Godmode e Contas Gerenciadas

Existem duas camadas de privilégios absolutos para manutenção e suporte:

1. **Godmode do Sistema (Superadmin):**
   - Reservado aos proprietários da plataforma (`User.isSuperadmin = true`).
   - Permite impersonar qualquer usuário no sistema e redefinir senhas, independente do tenant, ignorando políticas RBAC (ações auditadas em `AuditLog`).

2. **Godmode do Contratante (Sócio/Admin Master):**
   - Cargo `tenant_admin` ou roles com as permissões `team.members.impersonate` e `team.members.manage_security`.
   - Podem impersonar e resetar senhas de usuários dentro do seu próprio Tenant.
   - **Contas Gerenciadas:** O reset de senha de um membro pelo administrador do tenant só é permitido se a conta for considerada interna/gerenciada (`User.isManagedAccount = true`), geralmente criadas via domínio personalizado, para não comprometer usuários globais convidados.
