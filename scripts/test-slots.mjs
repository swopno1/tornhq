/**
 * One-shot test script: fetch API key from DB, decrypt, play 1 slot spin at 10 tokens.
 * Run: node --env-file=.env scripts/test-slots.mjs
 */
import { createDecipheriv } from "crypto";
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const ENCRYPTION_SECRET = process.env.API_KEY_ENCRYPTION_SECRET;

if (!DATABASE_URL || !ENCRYPTION_SECRET) {
  console.error("Missing DATABASE_URL or API_KEY_ENCRYPTION_SECRET in environment.");
  process.exit(1);
}

function decrypt(ciphertext) {
  const key = Buffer.from(ENCRYPTION_SECRET, "hex");
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted value format");
  const [ivHex, tagHex, encHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const { rows } = await pool.query(
    'SELECT id, "tornId", "apiKeyEnc" FROM "User" WHERE "apiKeyEnc" IS NOT NULL LIMIT 1',
  );

  if (!rows.length) {
    console.error("No users with API keys found.");
    process.exit(1);
  }

  const user = rows[0];
  console.log(`Using user: id=${user.id} tornId=${user.tornId}`);

  const apiKey = decrypt(user.apiKeyEnc);
  console.log(`API key decrypted: ${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`);

  // ── Step 1: Probe money selection ─────────────────────────────────────────
  console.log("\n── Balance check (GET /user?selections=money) ──");
  const balRes = await fetch(`https://api.torn.com/user?selections=money&key=${apiKey}`);
  const balData = await balRes.json();
  console.log("Full money response:", JSON.stringify(balData, null, 2));
  console.log("  points_balance field:", balData.points_balance ?? "(absent)");
  console.log("  points field:        ", balData.points ?? "(absent)");

  // ── Step 2: Probe basic selection for casino fields ────────────────────────
  console.log("\n── User basic (GET /user?selections=basic) — checking for casino fields ──");
  const basicRes = await fetch(`https://api.torn.com/user?selections=basic&key=${apiKey}`);
  const basicData = await basicRes.json();
  // Only print top-level keys to avoid noise
  console.log("  Top-level keys:", Object.keys(basicData));
  if (basicData.casino_tokens !== undefined) console.log("  casino_tokens:", basicData.casino_tokens);
  if (basicData.points !== undefined) console.log("  points:", basicData.points);

  // ── Step 3: Try v1 casino selection ───────────────────────────────────────
  console.log("\n── v1 casino selection (GET /user/?selections=casino) ──");
  const casinoRes = await fetch(`https://api.torn.com/user/?selections=casino&key=${apiKey}`);
  const casinoData = await casinoRes.json();
  console.log("Casino v1 response:", JSON.stringify(casinoData, null, 2));

  // ── Step 4: Check API key access level ────────────────────────────────────
  console.log("\n── Key info (GET /key/?selections=info) ──");
  const keyRes = await fetch(`https://api.torn.com/key/?selections=info&key=${apiKey}`);
  const keyData = await keyRes.json();
  console.log("Key info:", JSON.stringify(keyData, null, 2));

  // ── Step 4: Try slots with param name 'bet' ────────────────────────────────
  console.log("\n── Slots spin attempt A: param=bet, value=10 ──");
  const slotsResA = await fetch(`https://api.torn.com/v2/user/slots?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ bet: "10" }).toString(),
  });
  const slotsDataA = await slotsResA.json();
  console.log("HTTP:", slotsResA.status, "| Response:", JSON.stringify(slotsDataA, null, 2));

  // ── Step 5: Try slots with param name 'amount' ────────────────────────────
  console.log("\n── Slots spin attempt B: param=amount, value=10 ──");
  const slotsResB = await fetch(`https://api.torn.com/v2/user/slots?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ amount: "10" }).toString(),
  });
  const slotsDataB = await slotsResB.json();
  console.log("HTTP:", slotsResB.status, "| Response:", JSON.stringify(slotsDataB, null, 2));

  // ── Step 6: Try with JSON body ─────────────────────────────────────────────
  console.log("\n── Slots spin attempt C: JSON body {\"bet\":10} ──");
  const slotsResC = await fetch(`https://api.torn.com/v2/user/slots?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bet: 10 }),
  });
  const slotsDataC = await slotsResC.json();
  console.log("HTTP:", slotsResC.status, "| Response:", JSON.stringify(slotsDataC, null, 2));

  // ── Step 7: Try with bet in query string ───────────────────────────────────
  console.log("\n── Slots spin attempt D: bet in query string ──");
  const slotsResD = await fetch(`https://api.torn.com/v2/user/slots?key=${apiKey}&bet=10`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "",
  });
  const slotsDataD = await slotsResD.json();
  console.log("HTTP:", slotsResD.status, "| Response:", JSON.stringify(slotsDataD, null, 2));

  // ── Step 8: Try alternative v2 endpoint paths ──────────────────────────────
  const altPaths = [
    "/v2/casino/slots",
    "/v2/user/casino/slots",
    "/v2/user/casino",
    "/v2/casino/play",
  ];
  for (const path of altPaths) {
    console.log(`\n── Alt path: POST ${path} (body: bet=10) ──`);
    const r = await fetch(`https://api.torn.com${path}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ bet: "10" }).toString(),
    });
    const d = await r.json();
    console.log("HTTP:", r.status, "| Response:", JSON.stringify(d, null, 2));
  }

  // ── Step 9: GET /v2/user/casino — get casino state ────────────────────────
  console.log("\n── GET /v2/user/casino ──");
  const casinoV2Res = await fetch(`https://api.torn.com/v2/user/casino?key=${apiKey}`);
  const casinoV2Data = await casinoV2Res.json();
  console.log("Casino v2 GET:", JSON.stringify(casinoV2Data, null, 2));

  // ── Step 10: Try various combos to trigger a real spin ────────────────────
  const baseState = JSON.stringify(casinoV2Data);

  // A: game param in query string
  const queryVariants = [
    `game=slots&bet=10`,
    `game=slots&amount=10`,
    `game=slots`,
    `action=slots&bet=10`,
  ];
  for (const qs of queryVariants) {
    console.log(`\n── POST /v2/user/casino?key=...&${qs} (empty body) ──`);
    const r = await fetch(`https://api.torn.com/v2/user/casino?key=${apiKey}&${qs}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "",
    });
    const d = await r.json();
    console.log("Response:", JSON.stringify(d, null, 2));
    if (JSON.stringify(d) !== baseState) console.log("*** DIFFERENT RESPONSE ***");
  }

  // B: JSON body to /v2/user/casino
  const jsonVariants = [
    { game: "slots", bet: 10 },
    { game: "slots", amount: 10 },
    { slots: 10 },
    { type: "slots", bet: 10 },
  ];
  for (const body of jsonVariants) {
    console.log(`\n── POST /v2/user/casino JSON body=${JSON.stringify(body)} ──`);
    const r = await fetch(`https://api.torn.com/v2/user/casino?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    console.log("Response:", JSON.stringify(d, null, 2));
    if (JSON.stringify(d) !== baseState) console.log("*** DIFFERENT RESPONSE ***");
  }

  // C: GET variants with game param
  const getVariants = [
    `/v2/user/casino/slots`,
    `/v2/user/casino?game=slots`,
    `/v2/user/casino?selections=slots`,
  ];
  for (const path of getVariants) {
    console.log(`\n── GET https://api.torn.com${path} ──`);
    const r = await fetch(`https://api.torn.com${path}&key=${apiKey}`);
    const d = await r.json();
    console.log("Response:", JSON.stringify(d, null, 2));
    if (JSON.stringify(d) !== baseState) console.log("*** DIFFERENT RESPONSE ***");
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
