#!/usr/bin/env node
// Bootstrap: pede a senha, decifra bundle.enc e roda o instalador que vem dentro dele.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as p from '@clack/prompts';
import { decrypt } from './crypto.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
// Sempre tenta o bundle mais recente do GitHub: o npx guarda o pacote em cache,
// então o bundle.enc local pode estar velho. Busca pelo SHA atual da main (o raw
// de "main" fica até 5 min em cache no CDN). Sem rede ou com erro, usa o local.
const REPO = 'tiagosouzaf/tf-skills-installer';
const baixar = async (url, headers = {}) => {
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
};
let bundle;
try {
  const sha = (await baixar(`https://api.github.com/repos/${REPO}/commits/main`, { Accept: 'application/vnd.github.sha' }))
    .toString().trim();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error('sha inválido');
  bundle = await baixar(`https://raw.githubusercontent.com/${REPO}/${sha}/bundle.enc`);
  if (bundle.subarray(0, 4).toString() !== 'TFS1') throw new Error('bundle inválido');
} catch {
  bundle = fs.readFileSync(path.join(here, 'bundle.enc'));
}

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
