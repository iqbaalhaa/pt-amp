import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { getContactInfo } from "@/actions/contact-info-actions";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { contactWhatsApp } from "@/lib/contact-default";
import { getDictionary, type Locale } from "@/lib/i18n";

// Tombol WhatsApp melayang untuk halaman publik. Nomor dari CMS Kontak; kosong → nomor default.
export async function WhatsAppButton({ locale = "id" }: { locale?: Locale }) {
	const t = getDictionary(locale).whatsapp;
	const contactInfo = await getContactInfo();
	const href = buildWhatsAppUrl(contactWhatsApp(contactInfo), t.message);
	if (!href) return null;

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={t.ariaLabel}
			title={t.title}
			className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
		>
			<WhatsAppIcon sx={{ fontSize: { xs: 28, md: 32 } }} />
		</a>
	);
}
