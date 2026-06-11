$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$fullPath = "$machinePath;$userPath"
$paths = $fullPath -split ';'

foreach ($p in $paths) {
    if ($p -and (Test-Path "$p\git.exe")) {
        Write-Host "FOUND: $p\git.exe"
    }
}
