#!/usr/bin/env node
// Bootstrap: pede a senha, decifra bundle.enc e roda o instalador que vem dentro dele.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as p from '@clack/prompts';
import { decrypt } from './crypto.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const bundle = fs.readFileSync(path.join(here, 'bundle.enc'));

let files;
for (let tentativa = 1; !files; tentativa++) {
  const senha = process.env.TF_SKILLS_SENHA ?? (await p.password({ message: 'Senha do instalador tf-skills:' }));
  if (p.isCancel(senha)) { p.cancel('Cancelado.'); process.exit(0); }
  try {
    files = JSON.parse(zlib.gunzipSync(decrypt(bundle, senha)).toString('utf8'));
  } catch {
    p.log.error('Senha incorreta.');
    if (process.env.TF_SKILLS_SENHA !== undefined || tentativa >= 3) process.exit(1);
  }
}

// Extrai dentro do diretório do pacote para que o instalador resolva @clack/prompts
// subindo a árvore até o node_modules do npx. Apagado ao sair.
const payload = fs.mkdtempSync(path.join(here, '.payload-'));
const limpar = () => fs.rmSync(payload, { recursive: true, force: true });
process.on('exit', limpar);
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(130));

for (const [rel, b64] of Object.entries(files)) {
  const dest = path.join(payload, rel);
  if (!dest.startsWith(payload + path.sep)) continue;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(b64, 'base64'));
}

await import(pathToFileURL(path.join(payload, 'installer', 'cli.mjs')).href);
