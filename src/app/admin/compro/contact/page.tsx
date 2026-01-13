import { getContactInfo } from "@/actions/contact-info-actions";
import { getInquiries } from "@/actions/inquiry-actions";
import { getSocialMedias } from "@/actions/social-media-actions";
import { AdminContactClient } from "@/components/admin/contact/AdminContactClient";
import ContactPage from "@/components/pages/contact/ContactPage";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const contactInfo = await getContactInfo();
  const inquiries = await getInquiries();
  const socialMedias = await getSocialMedias();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Manajemen Halaman Kontak</h1>
      <p className="text-zinc-600">Kelola informasi kontak, link sosial media, dan pesan masuk.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <AdminContactClient 
            contactInfo={contactInfo} 
            inquiries={inquiries} 
            socialMedias={socialMedias}
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-700">Preview</h2>
          </div>
          <div className="max-h-[80vh] overflow-auto">
            <ContactPage />
          </div>
        </div>
      </div>
    </div>
  );
}
