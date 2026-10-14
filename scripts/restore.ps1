param([Parameter(Mandatory=$true)][string]$EncryptedBackup)
$source = [System.IO.Path]::GetFullPath($EncryptedBackup)
if (-not (Test-Path -LiteralPath $source) -or -not $env:RESTORE_DATABASE_URL -or -not $env:BACKUP_PASSPHRASE) { throw "Backup, RESTORE_DATABASE_URL and BACKUP_PASSPHRASE are required." }
if ($env:RESTORE_CONFIRM_ISOLATED -ne "YES") { throw "Set RESTORE_CONFIRM_ISOLATED=YES only after verifying the target is an isolated drill database." }
$dump = Join-Path $env:TEMP "whistlezim-restore-$([guid]::NewGuid()).dump"
try { & openssl enc -d -aes-256-cbc -pbkdf2 -in $source -out $dump -pass env:BACKUP_PASSPHRASE; if ($LASTEXITCODE) { throw "decryption failed" }; & pg_restore --exit-on-error --no-owner --dbname=$env:RESTORE_DATABASE_URL $dump; if ($LASTEXITCODE) { throw "restore failed" } } finally { Remove-Item -LiteralPath $dump -Force -ErrorAction SilentlyContinue }
