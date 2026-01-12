import { getInquiries } from "@/actions/inquiry-actions";
import InquiryClient from "@/components/admin/InquiryClient";

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return <InquiryClient initialInquiries={inquiries} />;
}
