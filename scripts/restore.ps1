param([Parameter(Mandatory=$true)][string]$EncryptedBackup)
$source = [System.IO.Path]::GetFullPath($EncryptedBackup)
& node (Join-Path $PSScriptRoot "restore.mjs") $source
if ($LASTEXITCODE) { throw "Authenticated restore failed" }
