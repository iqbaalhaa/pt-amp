import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, allSlugs } from "@/lib/blog";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props) {
	const post = getPost(params.slug);
	if (!post) return { title: "Blog | PT AMP" };
	return { title: `${post.title} | PT AMP` };
}

export default function BlogDetailPage({ params }: Props) {
	const post = getPost(params.slug);
	if (!post) return notFound();

	return (
		<div className="min-h-screen">
			<section className="border-b border-zinc-200 bg-white">
				<div className="mx-auto max-w-4xl px-4 py-12">
					<Link href="/blog" className="text-sm text-zinc-600 hover:underline">
						← Kembali ke Blog
					</Link>
					<h1 className="text-4xl font-semibold mt-3">{post.title}</h1>
					<div className="text-sm text-zinc-500 mt-2">
						{new Date(post.date).toLocaleDateString("id-ID", {
							day: "2-digit",
							month: "long",
							year: "numeric",
						})}
					</div>
					{post.tags?.length ? (
						<div className="mt-3 flex flex-wrap gap-2">
							{post.tags.map((t) => (
								<span
									key={t}
									className="text-xs rounded bg-zinc-100 px-2 py-1"
								>
									#{t}
								</span>
							))}
						</div>
					) : null}
				</div>
			</section>

			<section>
				<div className="mx-auto max-w-4xl px-4 py-12">
					<p className="text-zinc-700 leading-7 whitespace-pre-line">
						{post.content}
					</p>
				</div>
			</section>
		</div>
	);
}

export function generateStaticParams() {
	return allSlugs().map((slug) => ({ slug }));
}
