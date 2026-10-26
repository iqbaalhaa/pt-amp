export const WHATSAPP_DEFAULT_MESSAGE =
	"Halo PT AMP, saya ingin menanyakan penawaran kayu manis";

// Nomor dari CMS → link wa.me. Kosong/tidak valid → null (tombol disembunyikan).
export function buildWhatsAppUrl(
	number: string | null | undefined,
	message = WHATSAPP_DEFAULT_MESSAGE,
): string | null {
	let digits = (number ?? "").replace(/\D/g, "");
	if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
	if (digits.length < 8) return null;
	return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
