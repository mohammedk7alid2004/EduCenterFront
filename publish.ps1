# Build and publish script for MonsterASP / RunASP
$ErrorActionPreference = "Stop"

$user = $env:WEBDEPLOY_USERNAME
$pass = $env:WEBDEPLOY_PASSWORD

if (-not $user -or -not $pass) {
    Write-Host "Please enter WebDeploy credentials (or set `$env:WEBDEPLOY_USERNAME and `$env:WEBDEPLOY_PASSWORD):" -ForegroundColor Yellow
    if (-not $user) {
        $user = Read-Host "Username"
    }
    if (-not $pass) {
        $pass = Read-Host "Password" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pass)
        $pass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
}

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
    -dest:contentPath="site105749",computerName="https://site105749.siteasp.net:8172/msdeploy.axd?site=site105749",userName="$user",password="$pass",authType="Basic" `
    -allowUntrusted

Write-Host "`nSuccessfully published to http://adminaducenter.runasp.net/!" -ForegroundColor Green
