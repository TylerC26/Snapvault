/**
 * Seed Events Script (Firebase Admin SDK)
 * ----------------------------------------
 * Populates the `events` collection in Firestore so the app can validate
 * event codes dynamically instead of using a hardcoded array.
 *
 * Firestore structure written by this script:
 *   events/{CODE}  →  { title, heroImage, active, createdAt }
 *
 * ── Setup (one-time) ──────────────────────────────────────────────────────────
 * 1. Install the Admin SDK:
 *      npm install --save-dev firebase-admin
 *
 * 2. Download a service-account key:
 *      Firebase Console → Project Settings → Service accounts
 *      → "Generate new private key" → save as scripts/serviceAccountKey.json
 *      (this file is gitignored — never commit it)
 *
 * 3. Run:
 *      node scripts/seed-events.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let admin;
try {
  admin = require("firebase-admin");
} catch {
  console.error(
    "firebase-admin is not installed.\nRun:  npm install --save-dev firebase-admin"
  );
  process.exit(1);
}

const KEY_PATH = new URL("./serviceAccountKey.json", import.meta.url).pathname;

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(KEY_PATH, "utf8"));
} catch {
  console.error(
    `Service account key not found at:\n  ${KEY_PATH}\n\nDownload it from:\n  Firebase Console → Project Settings → Service accounts → Generate new private key`
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── Add / edit events here ──────────────────────────────────────────────────
const EVENTS = [
  {
    code: "TESTWEDDING",
    title: "SnapVault Demo",
    heroImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
    active: true,
  },
  {
    code: "CONNIEMAN",
    title: "Connie & Man's Wedding",
    heroImage: "/connieman-hero-v2.png",
    active: true,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  for (const event of EVENTS) {
    const { code, ...data } = event;
    await db
      .collection("events")
      .doc(code)
      .set({ ...data, createdAt: new Date().toISOString() }, { merge: true });
    console.log(`✓  events/${code}  →  "${data.title}"  (active: ${data.active})`);
  }
  console.log("\nDone! All events seeded.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
