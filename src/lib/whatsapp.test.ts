import { test } from "node:test";
import assert from "node:assert/strict";
import { buildWhatsAppUrl } from "./whatsapp";

const text = "Halo%20PT%20AMP%2C%20saya%20ingin%20menanyakan%20penawaran%20kayu%20manis";

test("format internasional dipakai apa adanya", () => {
	assert.equal(buildWhatsAppUrl("6281234567890"), `https://wa.me/6281234567890?text=${text}`);
});

test("spasi, tanda + dan strip dibuang; 0 di depan jadi 62", () => {
	assert.equal(buildWhatsAppUrl("+62 812-3456-7890"), `https://wa.me/6281234567890?text=${text}`);
	assert.equal(buildWhatsAppUrl("0812 3456 7890"), `https://wa.me/6281234567890?text=${text}`);
});

test("kosong atau tidak valid → null", () => {
	assert.equal(buildWhatsAppUrl(null), null);
	assert.equal(buildWhatsAppUrl(""), null);
	assert.equal(buildWhatsAppUrl("  "), null);
	assert.equal(buildWhatsAppUrl("abc"), null);
});
