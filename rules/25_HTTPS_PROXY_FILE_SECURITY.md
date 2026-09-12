# HTTPS, proxy e segurança de arquivos

## 1. Borda

Todo tráfego de navegador e webhook público usa HTTPS. Proxy confiável encaminha apenas hosts e upstreams aprovados.

## 2. Serviços internos

PostgreSQL, Redis, storage e serviços de apoio não são publicados em proxy/ngrok.

## 3. Forwarded headers

API confia em forwarded headers somente do proxy conhecido. Validar host/origin e protocolo conforme ambiente.

## 4. Headers

Aplicar HSTS em produção quando domínio estiver pronto, CSP, `X-Content-Type-Options`, política de frame e referrer adequada.

## 5. Arquivos públicos

Bloquear dotfiles, `.env`, backups, dumps, logs, chaves, certificados, configs, source code e artefatos de build indevidos.

## 6. Download

Autorização por tenant/recurso antes de emitir URL assinada. Validade curta e método/objeto limitados. Nome de arquivo exibido é sanitizado.

## 7. Upload

Não montar path com entrada do usuário. Nome físico é gerado pelo sistema. MIME/extensão/tamanho são validados; conteúdo ativo é tratado como não confiável.

## 8. Preview

PDF/imagem/documento em preview deve usar sandbox/política apropriada. Não executar macro/script.

## 9. CDN/cache

Conteúdo autenticado não entra em cache público sem política explícita. URL assinada não deve aparecer em log completo.
