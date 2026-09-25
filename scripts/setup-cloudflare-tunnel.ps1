# PowerShell script to configure Cloudflare Tunnel for BipeSend
# Run after your domain is verified and active on Cloudflare

$domain = "bipesend.com.br"
$tunnelName = "bipesend"
$cloudflaredDir = "$HOME\.cloudflared"

Write-Host ""
Write-Host "=== BIPESEND - CONFIGURADOR CLOUDFLARE TUNNEL ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se cloudflared esta disponivel
if (-not (Get-Command "cloudflared" -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Users\Dan\bin\cloudflared.exe") {
        $env:Path += ";C:\Users\Dan\bin"
    } else {
        Write-Host "[ERRO] cloudflared nao encontrado no PATH." -ForegroundColor Red
        exit 1
    }
}

$version = & cloudflared --version
Write-Host "[OK] cloudflared detectado: $version" -ForegroundColor Green

# 2. Verificar se o login ja foi realizado (cert.pem)
$certPath = Join-Path $cloudflaredDir "cert.pem"
if (-not (Test-Path $certPath)) {
    Write-Host ""
    Write-Host "[ATENCAO] Autenticacao necessaria no Cloudflare:" -ForegroundColor Yellow
    Write-Host "Execute o comando abaixo no seu terminal para fazer login:" -ForegroundColor White
    Write-Host "   cloudflared tunnel login" -ForegroundColor Cyan
    Write-Host "Uma janela do navegador vai abrir. Selecione o dominio '$domain' e clique em Autorizar." -ForegroundColor Gray
    Write-Host ""
    exit 0
}

Write-Host "[OK] Certificado de autenticacao encontrado ($certPath)" -ForegroundColor Green

# 3. Criar ou obter o Tunnel existente
Write-Host ""
Write-Host "Verificando tunel '$tunnelName'..." -ForegroundColor Cyan
$tunnelListJson = & cloudflared tunnel list --output json
$tunnelList = $tunnelListJson | ConvertFrom-Json
$existingTunnel = $tunnelList | Where-Object { $_.name -eq $tunnelName }

if ($null -eq $existingTunnel) {
    Write-Host "Criando novo tunel '$tunnelName'..." -ForegroundColor Yellow
    & cloudflared tunnel create $tunnelName
    $tunnelListJson = & cloudflared tunnel list --output json
    $tunnelList = $tunnelListJson | ConvertFrom-Json
    $existingTunnel = $tunnelList | Where-Object { $_.name -eq $tunnelName }
}

if ($null -eq $existingTunnel) {
    Write-Host "[ERRO] Falha ao localizar ou criar o tunel '$tunnelName'." -ForegroundColor Red
    exit 1
}

$tunnelId = $existingTunnel.id
Write-Host "[OK] Tunel ativo: $tunnelName (ID: $tunnelId)" -ForegroundColor Green

# 4. Roteamento de DNS para cada subdominio
$subdomains = @(
    "app.$domain",
    "admin.$domain",
    "api.$domain",
    "hooks.$domain",
    "www.$domain",
    "$domain"
)

Write-Host ""
Write-Host "Criando rotas de DNS no Cloudflare..." -ForegroundColor Cyan
foreach ($sub in $subdomains) {
    Write-Host "Apontando $sub -> tunel..." -ForegroundColor Gray
    & cloudflared tunnel route dns $tunnelName $sub 2>$null
}
Write-Host "[OK] Rotas de DNS vinculadas ao tunel!" -ForegroundColor Green

# 5. Criar arquivo config.yml
$configFile = Join-Path $cloudflaredDir "config.yml"
$credentialsFile = Join-Path $cloudflaredDir "$tunnelId.json"

$lines = @(
    "tunnel: $tunnelId",
    "credentials-file: $credentialsFile",
    "",
    "ingress:",
    "  # App do cliente (tenant-web)",
    "  - hostname: app.$domain",
    "    service: http://localhost:3001",
    "",
    "  # Painel SuperAdmin",
    "  - hostname: admin.$domain",
    "    service: http://localhost:3002",
    "",
    "  # API Fastify",
    "  - hostname: api.$domain",
    "    service: http://localhost:4000",
    "",
    "  # Webhooks (WhatsApp Evolution, Meta, TikTok)",
    "  - hostname: hooks.$domain",
    "    service: http://localhost:4000",
    "",
    "  # Landing page / Marketing",
    "  - hostname: www.$domain",
    "    service: http://localhost:3001",
    "",
    "  # Dominio raiz",
    "  - hostname: $domain",
    "    service: http://localhost:3001",
    "",
    "  # Fallback catch-all",
    "  - service: http_status:404"
)

$configContent = $lines -join "`r`n"
Set-Content -Path $configFile -Value $configContent -Encoding utf8
Write-Host ""
Write-Host "[OK] Arquivo de configuracao gerado em: $configFile" -ForegroundColor Green

Write-Host ""
Write-Host "=== TUDO PRONTO PARA RODAR! ===" -ForegroundColor Cyan
Write-Host "Para iniciar o tunel no terminal:" -ForegroundColor White
Write-Host "   cloudflared tunnel run $tunnelName" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ou para registrar como servico automatico do Windows (iniciar com o PC):" -ForegroundColor White
Write-Host "   cloudflared service install" -ForegroundColor Yellow
Write-Host ""
