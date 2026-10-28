$ErrorActionPreference='Stop'
$platform=Split-Path -Parent $PSScriptRoot
$logs=Join-Path $platform 'App_Data/concurso'
try {
 $current=Invoke-RestMethod -Uri 'http://127.0.0.1:3000/health' -TimeoutSec 3
 if($current.service -eq 'neibora-concurso'){Write-Output 'La API del concurso ya está activa.';return}
 throw 'El puerto 3000 está ocupado por otro servicio.'
} catch {
 if($_.Exception.Message -eq 'El puerto 3000 está ocupado por otro servicio.'){throw}
}
New-Item -ItemType Directory -Force -Path $logs | Out-Null
$node=(Get-Command node -ErrorAction Stop).Source
Start-Process -FilePath $node -ArgumentList 'concurso/runner.cjs' -WorkingDirectory $platform -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'service.log') -RedirectStandardError (Join-Path $logs 'service-errors.log')
Write-Output 'Servicio del concurso iniciado. Abre /concurso/ en la plataforma.'
