import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CONTACT, contactWhatsApp, seedContactInfo } from "./contact-default";
import { buildWhatsAppUrl } from "./whatsapp";

function fakeStore(row: { id: string; whatsapp: string | null } | null) {
  const calls: { op: string; args: unknown }[] = [];
  return {
    calls,
    contactInfo: {
      findFirst: async () => row,
      create: async (args: unknown) => calls.push({ op: "create", args }),
      update: async (args: unknown) => calls.push({ op: "update", args }),
    },
  };
}

test("nomor WA default menghasilkan link wa.me", () => {
  assert.ok(buildWhatsAppUrl(DEFAULT_CONTACT.whatsapp)?.startsWith("https://wa.me/6281234567890"));
});

test("seed membuat ContactInfo bila belum ada", async () => {
  const store = fakeStore(null);
  assert.equal(await seedContactInfo(store), "created");
  assert.deepEqual(store.calls, [{ op: "create", args: { data: DEFAULT_CONTACT } }]);
});

test("seed mengisi WA yang kosong", async () => {
  const store = fakeStore({ id: "c1", whatsapp: " " });
  assert.equal(await seedContactInfo(store), "whatsapp");
  assert.deepEqual(store.calls, [
    { op: "update", args: { where: { id: "c1" }, data: { whatsapp: DEFAULT_CONTACT.whatsapp } } },
  ]);
});

test("seed tidak menimpa WA dari admin", async () => {
  const store = fakeStore({ id: "c1", whatsapp: "628111" });
  assert.equal(await seedContactInfo(store), null);
  assert.equal(store.calls.length, 0);
});

test("tombol WA tetap punya nomor walau ContactInfo.whatsapp kosong (tanpa seed)", () => {
  for (const info of [null, undefined, {}, { whatsapp: null }, { whatsapp: "  " }]) {
    assert.equal(contactWhatsApp(info), DEFAULT_CONTACT.whatsapp);
  }
  assert.equal(contactWhatsApp({ whatsapp: "0812 9999 0000" }), "0812 9999 0000");
  assert.ok(buildWhatsAppUrl(contactWhatsApp({ whatsapp: "" }))?.startsWith("https://wa.me/6281234567890"));
});
