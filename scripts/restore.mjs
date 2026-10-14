import { createDecipheriv, createHash, scryptSync } from "node:crypto";
import { createReadStream, promises as fs, openSync, readSync, closeSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
const source = process.argv[2] && resolve(process.argv[2]);
if (!source || !process.env.RESTORE_DATABASE_URL || !process.env.BACKUP_PASSPHRASE) throw new Error("Backup, RESTORE_DATABASE_URL, and BACKUP_PASSPHRASE are required");
if (process.env.RESTORE_CONFIRM_ISOLATED !== "YES") throw new Error("Set RESTORE_CONFIRM_ISOLATED=YES only for an isolated drill database");
const buffer = Buffer.alloc(36); const descriptor = openSync(source, "r"); readSync(descriptor, buffer, 0, 36, 0); const size = (await fs.stat(source)).size; const tag = Buffer.alloc(16); readSync(descriptor, tag, 0, 16, size - 16); closeSync(descriptor);
if (buffer.subarray(0, 8).toString() !== "WZBKP001" || size < 53) throw new Error("Unsupported or truncated backup");
const manifest = JSON.parse(await fs.readFile(`${source}.manifest.json`, "utf8")); const hash = createHash("sha256"); for await (const chunk of createReadStream(source)) hash.update(chunk); if (hash.digest("hex") !== manifest.sha256) throw new Error("Backup checksum does not match its manifest");
const key = scryptSync(process.env.BACKUP_PASSPHRASE, buffer.subarray(8, 24), 32);
function authenticatedDecipher() { const decipher = createDecipheriv("aes-256-gcm", key, buffer.subarray(24, 36)); decipher.setAuthTag(tag); return decipher; }
await pipeline(createReadStream(source, { start: 36, end: size - 17 }), authenticatedDecipher(), new Writable({ write(_chunk, _encoding, done) { done(); } }));
const restore = spawn("pg_restore", ["--exit-on-error", "--no-owner", `--dbname=${process.env.RESTORE_DATABASE_URL}`], { stdio: ["pipe", "inherit", "inherit"], windowsHide: true });
await Promise.all([pipeline(createReadStream(source, { start: 36, end: size - 17 }), authenticatedDecipher(), restore.stdin), new Promise((accept, reject) => { restore.on("error", reject); restore.on("close", (code) => code === 0 ? accept() : reject(new Error(`pg_restore failed with code ${code}`))); })]);
console.log(JSON.stringify({ restored: true, source, verifiedSha256: manifest.sha256, completedAt: new Date().toISOString() }));
