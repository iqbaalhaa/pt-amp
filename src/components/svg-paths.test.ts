import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Browser menolak path SVG rusak (console "attribute d: Expected number"). Cek sintaks semua d="..." statis di src/.
const ARGS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
const NUM = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i;

function pathError(d: string): string | null {
  let i = 0;
  const skip = () => {
    while (i < d.length && /[\s,]/.test(d[i])) i++;
  };
  skip();
  if (!/[Mm]/.test(d[i] ?? "")) return "harus mulai dengan M";
  let cmd = "";
  while (i < d.length) {
    if (/[a-z]/i.test(d[i])) {
      cmd = d[i++].toLowerCase();
      if (!(cmd in ARGS)) return `perintah tak dikenal di ${i}`;
    } else if (cmd === "z" || !cmd) return `angka tanpa perintah di ${i}`;
    for (let k = 0; k < ARGS[cmd]; k++) {
      skip();
      if (cmd === "a" && (k === 3 || k === 4)) {
        if (!/[01]/.test(d[i] ?? "")) return `flag arc salah di ${i}: "${d.slice(i, i + 20)}"`;
        i++;
        continue;
      }
      const m = NUM.exec(d.slice(i));
      if (!m) return `angka diharapkan di ${i}: "${d.slice(i, i + 20)}"`;
      i += m[0].length;
    }
    skip();
    if (cmd === "m") cmd = "l";
  }
  return null;
}

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : /\.tsx$/.test(e.name) ? [join(dir, e.name)] : []
  );
}

test("validator: path rusak dari QA ditolak, path benar diterima", () => {
  assert.ok(pathError("M1 1c.335-.096.658-.25 1.126-.27 3.28-3.28 0 001.2-1.196z"));
  assert.equal(pathError("M12 6.865a5.135 5.135 0 110 10.27z"), null);
});

test("semua path SVG statis di src/ valid", () => {
  const bad: string[] = [];
  for (const f of files("src")) {
    for (const m of readFileSync(f, "utf8").matchAll(/\sd="([^"]+)"/g)) {
      const err = pathError(m[1]);
      if (err) bad.push(`${f}: ${err}`);
    }
  }
  assert.deepEqual(bad, []);
});
