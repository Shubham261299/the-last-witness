param([ValidateSet('ollama', 'scripted')][string]$Dialogue = 'ollama', [switch]$Test)
$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $repoRoot
if (-not (Test-Path -LiteralPath 'backend/.venv/Scripts/python.exe')) { throw 'Run scripts/setup.ps1 first.' }
if ($Test) {
    $env:WITNESS_DB = '.cache/browser.db'
    $env:WITNESS_TEST_MODE = '1'
    $env:WITNESS_DIALOGUE_MODE = 'scripted'
} else {
    $env:WITNESS_DB = 'backend/data/witness.db'
    $env:WITNESS_TEST_MODE = '0'
    $env:WITNESS_DIALOGUE_MODE = $Dialogue
}
& '.\backend\.venv\Scripts\python.exe' -m uvicorn witness.app:create_app --factory --app-dir backend --host 127.0.0.1 --port 8000
