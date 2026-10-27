import assert from "node:assert/strict";
import { test } from "node:test";
import { setCredentialPassword } from "./reset-password";

function fakeDb(userExists: boolean, credentialCount: number) {
  const calls: { op: string; args: any }[] = [];
  return {
    calls,
    user: { findUnique: async () => (userExists ? { id: "u1" } : null) },
    account: {
      updateMany: async (args: any) => (calls.push({ op: "update", args }), { count: credentialCount }),
      create: async (args: any) => calls.push({ op: "create", args }),
    },
  };
}
const hash = async (p: string) => `hashed:${p}`;

test("update password di akun credential, bukan field User", async () => {
  const db = fakeDb(true, 1);
  assert.equal(await setCredentialPassword(db, hash, "u1", "rahasia123"), "updated");
  assert.deepEqual(db.calls, [
    { op: "update", args: { where: { userId: "u1", providerId: "credential" }, data: { password: "hashed:rahasia123" } } },
  ]);
});

test("akun credential belum ada → dibuat", async () => {
  const db = fakeDb(true, 0);
  assert.equal(await setCredentialPassword(db, hash, "u1", "rahasia123"), "created");
  const { data } = db.calls[1].args;
  assert.equal(db.calls[1].op, "create");
  assert.deepEqual({ ...data, id: undefined }, {
    id: undefined, userId: "u1", providerId: "credential", accountId: "u1", password: "hashed:rahasia123",
  });
  assert.ok(data.id);
});

test("user tidak ada → not-found tanpa menulis", async () => {
  const db = fakeDb(false, 0);
  assert.equal(await setCredentialPassword(db, hash, "x", "rahasia123"), "not-found");
  assert.equal(db.calls.length, 0);
});
