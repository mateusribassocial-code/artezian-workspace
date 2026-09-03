# Cria o atalho "Painel Artezian" na area de trabalho.
#
# Rode uma vez, clicando com o botao direito neste arquivo e escolhendo
# "Executar com o PowerShell". Depois disso, o painel abre pelo atalho.

$pasta   = Split-Path -Parent $MyInvocation.MyCommand.Path
$alvo    = Join-Path $pasta 'iniciar.bat'
$icone   = Join-Path $pasta 'painel.ico'
$destino = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Painel Artezian.lnk'

if (-not (Test-Path $alvo)) {
    Write-Host "Nao encontrei o iniciar.bat em $pasta" -ForegroundColor Red
    exit 1
}

$shell    = New-Object -ComObject WScript.Shell
$atalho   = $shell.CreateShortcut($destino)

$atalho.TargetPath       = $alvo
$atalho.WorkingDirectory = $pasta
$atalho.Description      = 'Abre o Painel Artezian em localhost:3131'
$atalho.WindowStyle      = 7          # inicia minimizado: o console nao atrapalha

if (Test-Path $icone) { $atalho.IconLocation = $icone }

$atalho.Save()

Write-Host ""
Write-Host "  Atalho criado: $destino" -ForegroundColor Green
Write-Host "  Da um duplo clique nele para abrir o painel."
Write-Host ""
