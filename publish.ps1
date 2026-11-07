# Build and publish script for MonsterASP / RunASP
$ErrorActionPreference = "Stop"

Write-Host "1. Building project..." -ForegroundColor Cyan
npm run build

$msdeployPath = "C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe"
if (-not (Test-Path $msdeployPath)) {
    $msdeployPath = "C:\Program Files (x86)\IIS\Microsoft Web Deploy V3\msdeploy.exe"
}

if (-not (Test-Path $msdeployPath)) {
    Write-Error "msdeploy.exe not found. Please install Microsoft Web Deploy."
    exit 1
}

Write-Host "2. Publishing via Web Deploy to http://adminaducenter.runasp.net/..." -ForegroundColor Cyan

& $msdeployPath `
    -verb:sync `
    -source:contentPath="$PSScriptRoot\dist" `
    -dest:contentPath="site105749",computerName="https://site105749.siteasp.net:8172/msdeploy.axd?site=site105749",userName="site105749",password="4d+E@6Apt?2Y",authType="Basic" `
    -allowUntrusted

Write-Host "`nSuccessfully published to http://adminaducenter.runasp.net/!" -ForegroundColor Green
