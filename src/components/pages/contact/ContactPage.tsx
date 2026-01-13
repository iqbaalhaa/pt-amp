import { ContactForm } from "@/components/ContactForm";
import { Navbar } from "@/components/Navbar";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube, Linkedin, Info, Link as LinkIcon } from "lucide-react";
import { getContactInfo } from "@/actions/contact-info-actions";
import { getSocialMedias } from "@/actions/social-media-actions";

function getSocialIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return <Facebook className="w-5 h-5" />;
  if (p.includes("instagram")) return <Instagram className="w-5 h-5" />;
  if (p.includes("twitter") || p.includes("x")) return <Twitter className="w-5 h-5" />;
  if (p.includes("youtube")) return <Youtube className="w-5 h-5" />;
  if (p.includes("linkedin")) return <Linkedin className="w-5 h-5" />;
  if (p.includes("tiktok")) return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>;
  return <LinkIcon className="w-5 h-5" />;
}

function getSocialColorClass(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return "hover:bg-[#1877F2]";
  if (p.includes("instagram")) return "hover:bg-[#E4405F]";
  if (p.includes("twitter") || p.includes("x")) return "hover:bg-black";
  if (p.includes("youtube")) return "hover:bg-[#FF0000]";
  if (p.includes("linkedin")) return "hover:bg-[#0A66C2]";
  if (p.includes("tiktok")) return "hover:bg-[#000000]";
  return "hover:bg-zinc-600";
}

export default async function ContactPage() {
  const contactInfo = await getContactInfo();
  const socialMedias = await getSocialMedias();

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      {/* Hero Header */}
      <section className="bg-zinc-900 text-white py-20 md:py-28 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Hubungi Kami
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Siap menjadi partner terpercaya Anda. Diskusikan kebutuhan bahan baku, jadwal pengiriman, atau spesifikasi grade dengan tim kami.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Contact Info Side */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-zinc-900">Informasi Kontak</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white transition-colors duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Alamat Kantor & Gudang</h3>
                    <p className="text-zinc-600 leading-relaxed">
                      {contactInfo?.address || "Jl. Raya Padang - Solok, KM 20, Indarung, Padang, Sumatera Barat, Indonesia"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white transition-colors duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Telepon & WhatsApp</h3>
                    <p className="text-zinc-600 mb-1">
                      Office: {contactInfo?.phone || "+62 751 123456"}
                    </p>
                    <p className="text-zinc-600">
                      WhatsApp: {contactInfo?.whatsapp ? `+${contactInfo.whatsapp}` : "+62 812 3456 7890"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white transition-colors duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Email</h3>
                    <p className="text-zinc-600">
                      {contactInfo?.email || "info@pt-amp.com"}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      Untuk penawaran harga resmi dan kerjasama ekspor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-zinc-900 mb-6">Ikuti Kami</h3>
                <div className="flex gap-4 flex-wrap">
                  {socialMedias.map((social) => (
                    <a 
                      key={social.id}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:text-white transition-all duration-300 ${getSocialColorClass(social.platform)}`}
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                  {socialMedias.length === 0 && (
                     <p className="text-zinc-500 text-sm italic">Belum ada media sosial yang ditambahkan.</p>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-12 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex gap-3 mb-2">
                   <Info className="w-5 h-5 text-zinc-400" />
                   <h4 className="font-semibold text-zinc-900">Ingin berkunjung langsung?</h4>
                </div>
                <p className="text-zinc-600 text-sm pl-8">
                  Silakan buat janji temu minimal 1 hari sebelumnya untuk memastikan ketersediaan tim kami di lokasi gudang.
                </p>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:sticky lg:top-24">
               <ContactForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
