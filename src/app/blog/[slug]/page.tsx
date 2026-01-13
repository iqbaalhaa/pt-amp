import BlogDetailPage from "@/components/pages/blog/BlogDetailPage";
import { getPost } from "@/lib/blog";

type Props = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: Props }) {
    const params = await props.params;
	const post = getPost(params.slug);
	if (!post) return { title: "Blog | PT AMP" };
	return { 
		title: `${post.title} | PT AMP`,
		description: post.summary,
	};
}

export default async function Page(props: { params: Props }) {
    const params = await props.params;
	return <BlogDetailPage slug={params.slug} />;
}
