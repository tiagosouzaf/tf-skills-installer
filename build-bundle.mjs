// Uso: node build-bundle.mjs <repo-git> <ref> <arquivo-senha>
// Empacota os arquivos versionados de <ref> em bundle.enc, cifrado com a senha.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { encrypt } from './crypto.mjs';

const [repo, ref, senhaFile] = process.argv.slice(2);
const senha = fs.readFileSync(senhaFile, 'utf8').trim();
const git = (...a) => execFileSync('git', ['-C', repo, ...a], { maxBuffer: 1 << 28 });

const files = {};
for (const f of git('ls-tree', '-r', '-z', '--name-only', ref).toString().split('\0').filter(Boolean)) {
  files[f] = git('show', `${ref}:${f}`).toString('base64');
}
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'bundle.enc');
fs.writeFileSync(out, encrypt(zlib.gzipSync(JSON.stringify(files)), senha));
console.log(`bundle.enc: ${Object.keys(files).length} arquivos`);
