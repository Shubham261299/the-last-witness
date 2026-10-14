param([switch]$SkipFrontend)
$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $repoRoot
if (-not (Test-Path -LiteralPath 'backend/.venv/Scripts/python.exe')) {
    python -m venv backend/.venv
    if ($LASTEXITCODE -ne 0) { throw 'Creating the Python environment failed.' }
}
& '.\backend\.venv\Scripts\python.exe' -m pip install -r backend/requirements-lock.txt
if ($LASTEXITCODE -ne 0) { throw 'Python dependency installation failed.' }
if (-not $SkipFrontend) {
    npm ci --prefix frontend --ignore-scripts
    if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
}
Write-Host 'Setup finished. Use scripts/start-backend.ps1 and npm --prefix frontend run dev in separate terminals.'
