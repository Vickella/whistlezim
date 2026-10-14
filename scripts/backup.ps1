param([Parameter(Mandatory=$true)][string]$Destination)
$resolved = [System.IO.Path]::GetFullPath($Destination)
if ($resolved.StartsWith([System.IO.Path]::GetFullPath((Get-Location).Path))) { throw "Backups must not be written inside the repository." }
if (-not $env:DATABASE_URL -or -not $env:BACKUP_PASSPHRASE) { throw "DATABASE_URL and BACKUP_PASSPHRASE are required." }
New-Item -ItemType Directory -Force -Path $resolved | Out-Null
$stamp = Get-Date -Format "yyyyMMddTHHmmssZ"
$dump = Join-Path $env:TEMP "whistlezim-$stamp.dump"
try { & pg_dump --format=custom --no-owner --file=$dump $env:DATABASE_URL; if ($LASTEXITCODE) { throw "pg_dump failed" }; & openssl enc -aes-256-cbc -salt -pbkdf2 -in $dump -out (Join-Path $resolved "whistlezim-$stamp.dump.enc") -pass env:BACKUP_PASSPHRASE; if ($LASTEXITCODE) { throw "encryption failed" } } finally { Remove-Item -LiteralPath $dump -Force -ErrorAction SilentlyContinue }
