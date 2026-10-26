import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Rahasia (salinan .env) tidak boleh ter-commit. .env.example boleh: nilainya dummy.
const SECRET_KEYS =
  /^\s*(DATABASE_URL|BETTER_AUTH_SECRET|S3_ACCESS_KEY_ID|S3_SECRET_ACCESS_KEY|SUPERADMIN_PASSWORD|SEED_PASSWORD)\s*=\s*"?([^"\s#]+)/m;
const ALLOWED = new Set([".env.example", ".env.test"]);

test("tidak ada file ter-commit berisi rahasia env", () => {
  const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split("\n")
    .filter((f) => f && !ALLOWED.has(f) && !f.startsWith("node_modules/"));
  const leaked = files.filter((f) => {
    try {
      return SECRET_KEYS.test(readFileSync(f, "utf8"));
    } catch {
      return false; // file dihapus di working tree / bukan teks
    }
  });
  assert.deepEqual(leaked, []);
});
