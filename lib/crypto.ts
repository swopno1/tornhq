import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const hex = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "API_KEY_ENCRYPTION_SECRET must be exactly 64 hex characters (32 bytes). " +
        "Generate with: openssl rand -hex 32",
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 * Returns "ivHex:tagHex:ciphertextHex" — safe to store in DB.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a value produced by `encrypt`.
 */
export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted value format");
  const [ivHex, tagHex, encHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return (
    decipher.update(encrypted).toString("utf8") + decipher.final("utf8")
  );
}
