# Arquitetura modular

## 1. Módulo

Cada módulo possui contratos claros de UI, aplicação, domínio e infraestrutura. Importações entre módulos passam por APIs públicas internas, não por arquivos privados.

## 2. Organização

Referência:

```text
module/
  domain/
  application/
  infrastructure/
  http/
  ui/
  tests/
```

A forma exata pode variar por app, mantendo separação de responsabilidades.

## 3. Shared

Só mover para shared quando há reutilização real e semântica estável. "Shared" não pode virar depósito de utilitários.

## 4. UI

Primitives globais em `packages/ui`. Componentes específicos permanecem no módulo e compõem primitives.

## 5. Contratos

Schemas e tipos que cruzam app/pacote vivem em `packages/contracts` ou local equivalente. Evitar duplicar DTO manual.

## 6. Eventos

Módulos se desacoplam por eventos quando assíncrono fizer sentido, sem usar evento para esconder dependência síncrona obrigatória.

## Revisão de fundação — 2026-09-13

Pastas vazias são skeleton, não módulos concluídos. API/controllers e Next/app são entradas finas; feature contém caso de uso e composição, pacote contém contrato reutilizável. Só extrair abstração com limite e consumidor claros; evitar dependências circulares e o pacote compartilhado virar domínio monolítico.
