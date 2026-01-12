import { getContactInfo } from "@/actions/contact-info-actions";
import { getInquiries } from "@/actions/inquiry-actions";
import { getSocialMedias } from "@/actions/social-media-actions";
import { AdminContactClient } from "@/components/admin/contact/AdminContactClient";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const contactInfo = await getContactInfo();
  const inquiries = await getInquiries();
  const socialMedias = await getSocialMedias();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Manajemen Halaman Kontak</h1>
      <p className="text-zinc-600 mb-6">Kelola informasi kontak, link sosial media, dan pesan yang masuk dari website.</p>
      
      <AdminContactClient 
        contactInfo={contactInfo} 
        inquiries={inquiries} 
        socialMedias={socialMedias}
      />
    </div>
  );
}
