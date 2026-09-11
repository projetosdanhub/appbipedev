# Governanca de dados

## Classificacao

Publico, interno, pessoal, sensivel e segredo. Cada campo novo declara classificacao, finalidade, retencao, acesso e se entra em logs/IA.

## PII e IA

Minimizar contexto enviado a provedores. Tenant escolhe politicas de uso quando aplicavel; superadmin define limites globais. Mensagens e documentos nao devem treinar modelos por padrao. Redacao e exclusao devem respeitar o fluxo de dados.

## Retencao

Cada modulo define retencao, exportacao e exclusao. Jobs de limpeza sao idempotentes e auditados. Backups sao criptografados, com acesso restrito e teste de restore.

## Incidentes

Ter runbook para segredo exposto, cross-tenant, conta comprometida, provider indisponivel, fila travada e documento malicioso. Preservar evidencias minimas sem ampliar exposicao.
