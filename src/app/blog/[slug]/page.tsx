import BlogDetailPage from "@/components/pages/blog/BlogDetailPage";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: Props }) {
    const params = await props.params;
	const post = await getPost(params.slug);
	if (!post) return { title: "Blog | PT AMP" };
	return pageMetadata(post.title, post.summary, `/blog/${params.slug}`);
}

export default async function Page(props: { params: Props }) {
    const params = await props.params;
	return <BlogDetailPage slug={params.slug} />;
}
