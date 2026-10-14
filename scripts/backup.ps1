param([Parameter(Mandatory=$true)][string]$Destination)
$resolved = [System.IO.Path]::GetFullPath($Destination)
& node (Join-Path $PSScriptRoot "backup.mjs") $resolved
if ($LASTEXITCODE) { throw "Authenticated backup failed" }
