import BlogPage from "@/components/pages/blog/BlogPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Blog — Wawasan Kayu Manis & Rempah",
  "Berita, artikel, dan wawasan seputar industri kayu manis (cinnamon), rempah, dan ekspor dari PT AMP.",
  "/blog"
);

export const dynamic = "force-dynamic";

export default BlogPage;
