import { getContactInfo } from "@/actions/contact-info-actions";
import { getSocialMedias } from "@/actions/social-media-actions";
import { organizationJsonLd } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

export async function OrganizationJsonLd() {
  const [contact, socials] = await Promise.all([
    getContactInfo(),
    getSocialMedias().catch(() => []),
  ]);
  return <JsonLd data={organizationJsonLd(contact, socials)} />;
}
