import crypto from 'node:crypto';

// Formato: "TFS1" | salt(16) | iv(12) | tag(16) | ciphertext
const MAGIC = Buffer.from('TFS1');
const SCRYPT = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

const derive = (senha, salt) => crypto.scryptSync(senha.normalize('NFC'), salt, 32, SCRYPT);

export function encrypt(plain, senha) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', derive(senha, salt), iv);
  const body = Buffer.concat([c.update(plain), c.final()]);
  return Buffer.concat([MAGIC, salt, iv, c.getAuthTag(), body]);
}

export function decrypt(buf, senha) {
  if (!buf.subarray(0, 4).equals(MAGIC)) throw new Error('bundle inválido');
  const salt = buf.subarray(4, 20), iv = buf.subarray(20, 32), tag = buf.subarray(32, 48);
  const d = crypto.createDecipheriv('aes-256-gcm', derive(senha, salt), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(buf.subarray(48)), d.final()]);
}
