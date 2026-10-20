$ErrorActionPreference = 'Stop'
Remove-Item Env:PYTHONHOME, Env:PYTHONPATH -ErrorAction SilentlyContinue
if (-not $env:QUARTO_PYTHON) {
  $candidates = @((Join-Path $PSScriptRoot '.venv\Scripts\python.exe'), (Join-Path $PSScriptRoot '..\prosem-pt\.venv\Scripts\python.exe'))
  $env:QUARTO_PYTHON = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $env:QUARTO_PYTHON) { throw 'Set QUARTO_PYTHON to a compatible Python environment before rendering.' }
}
Push-Location $PSScriptRoot
try { quarto render slides.qmd; if ($LASTEXITCODE -ne 0) { throw 'Quarto render failed' } } finally { Pop-Location }
