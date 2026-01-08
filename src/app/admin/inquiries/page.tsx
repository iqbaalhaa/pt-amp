import { getInquiries } from "@/actions/inquiry-actions";
import InquiryClient from "./inquiry-client";

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return <InquiryClient initialInquiries={inquiries} />;
}
