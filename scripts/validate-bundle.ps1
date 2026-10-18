param(
  [string]$IndexPath = (Join-Path $PSScriptRoot '..\index.html')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $IndexPath)) {
  throw "Arquivo de bundle não encontrado: $IndexPath"
}

$html = Get-Content -LiteralPath $IndexPath -Raw
$requiredMarkers = @(
  '<script type="__bundler/manifest">',
  '<script type="__bundler/template">',
  '<script type="__bundler/ext_resources">',
  'id="__bundler_loading"'
)

foreach ($marker in $requiredMarkers) {
  if ($html.IndexOf($marker, [StringComparison]::Ordinal) -lt 0) {
    throw "Marcador obrigatório ausente: $marker"
  }
}

if (-not (Test-Path -LiteralPath (Join-Path (Split-Path $IndexPath) 'manifest.json'))) {
  throw 'manifest.json não encontrado'
}

$manifest = Get-Content -LiteralPath (Join-Path (Split-Path $IndexPath) 'manifest.json') -Raw | ConvertFrom-Json
if (-not $manifest.name -or -not $manifest.start_url) {
  throw 'manifest.json inválido: name e start_url são obrigatórios'
}

# O conteúdo dentro dos scripts do bundle usa \u002F para não fechar a tag HTML.
$templateMatch = [regex]::Match($html, '<script type="__bundler/template">(?<template>.*?)</script>', [Text.RegularExpressions.RegexOptions]::Singleline)
if (-not $templateMatch.Success) {
  throw 'Bloco __bundler/template não encontrado ou malformado'
}
if ($templateMatch.Groups['template'].Value -match '(?i)</script') {
  throw 'Encontrado </script> literal no bundle; a publicação pode ser truncada pelo navegador'
}

Write-Output "Bundle válido: $IndexPath"
Write-Output "PWA: $($manifest.name)"
