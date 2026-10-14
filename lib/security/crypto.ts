import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export type EncryptedValue = { algorithm: "AES-256-GCM"; keyVersion: number; wrappedKey: string; wrappedKeyNonce: string; wrappedKeyTag: string; ciphertext: string; nonce: string; tag: string };
function key(value: string) { const decoded = Buffer.from(value, "base64"); if (decoded.length !== 32) throw new Error("Key must be 32 bytes encoded as base64"); return decoded; }
function seal(plaintext: Buffer, encryptionKey: Buffer) {
  const nonce = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", encryptionKey, nonce);
  return { ciphertext: Buffer.concat([cipher.update(plaintext), cipher.final()]), nonce, tag: cipher.getAuthTag() };
}
function open(ciphertext: Buffer, nonce: Buffer, tag: Buffer, encryptionKey: Buffer) {
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey, nonce); decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
export function encryptText(value: string, encodedKek: string, keyVersion = 1): EncryptedValue {
  const dek = randomBytes(32); const body = seal(Buffer.from(value, "utf8"), dek); const wrapped = seal(dek, key(encodedKek));
  return { algorithm: "AES-256-GCM", keyVersion, wrappedKey: wrapped.ciphertext.toString("base64"), wrappedKeyNonce: wrapped.nonce.toString("base64"), wrappedKeyTag: wrapped.tag.toString("base64"), ciphertext: body.ciphertext.toString("base64"), nonce: body.nonce.toString("base64"), tag: body.tag.toString("base64") };
}
export function decryptText(value: EncryptedValue, encodedKek: string) {
  if (value.algorithm !== "AES-256-GCM") throw new Error("Unsupported encryption algorithm");
  const dek = open(Buffer.from(value.wrappedKey, "base64"), Buffer.from(value.wrappedKeyNonce, "base64"), Buffer.from(value.wrappedKeyTag, "base64"), key(encodedKek));
  return open(Buffer.from(value.ciphertext, "base64"), Buffer.from(value.nonce, "base64"), Buffer.from(value.tag, "base64"), dek).toString("utf8");
}
export function generateRecoveryCredential(year = new Date().getUTCFullYear()) {
  return { reference: `WZ-${year}-${randomBytes(12).toString("hex").toUpperCase()}`, secret: randomBytes(32).toString("base64url") };
}
export function secretVerifier(reference: string, secret: string, encodedPepper: string) { return createHmac("sha256", key(encodedPepper)).update(`${reference}\0${secret}`, "utf8").digest(); }
export function verifySecret(reference: string, secret: string, expectedBase64: string, encodedPepper: string) {
  const actual = secretVerifier(reference, secret, encodedPepper); const expected = Buffer.from(expectedBase64, "base64"); return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function pseudonymize(value: string, purpose: string, encodedKey: string) { return createHmac("sha256", key(encodedKey)).update(`${purpose}\0${value}`, "utf8").digest("base64url"); }
