# Tenancy

## 1. Regra principal

Todo dado pertencente a cliente deve possuir contexto de tenant explícito. `tenant_id` nunca é confiado a partir de campo livre enviado pelo frontend quando puder ser derivado da sessão/credencial.

## 2. Isolamento

- autorização e filtro por tenant em toda leitura/mutação;
- joins precisam preservar tenant;
- cache e chave de fila incluem tenant;
- storage usa namespace/prefixo não enumerável e autorização;
- eventos incluem tenant quando necessário ao consumidor;
- busca/RAG nunca mistura corpus de tenants;
- logs evitam payloads e identificadores desnecessários.

## 3. Defesa em profundidade

A aplicação deve impedir cross-tenant mesmo se um ID válido de outro tenant for fornecido. RLS pode ser usada como camada adicional, mas não substitui autorização no serviço.

## 4. Seleção de tenant

Usuário com acesso a múltiplos tenants deve selecionar contexto de forma explícita. Troca de tenant invalida caches de UI, escopos de consulta e dados sensíveis da superfície anterior.

## 5. Convites

Convite tem tenant, papel/capacidades permitidas, expiração, uso único e auditoria. Aceitar convite não concede permissão maior do que a emitida.

## 6. Exclusão e suspensão

Suspensão bloqueia operação sem apagar dados. Exclusão segue retenção, exportação, billing e LGPD; operações destrutivas exigem autorização forte e registro.
