import Link from "next/link";
import { listPosts } from "@/lib/blog";

export const metadata = {
	title: "Blog & News | PT AMP",
	description:
		"Berita dan pembaruan operasional perusahaan kulit manis PT AMP.",
};

export default function BlogPage({
	searchParams,
}: {
	searchParams?: { page?: string; q?: string };
}) {
	const page = Number(searchParams?.page || "1");
	const q = searchParams?.q || "";
	const { posts, pageCount, total } = listPosts(page, q);

	return (
		<div className="min-h-screen">
			<section className="border-b border-zinc-200 bg-white">
				<div className="mx-auto max-w-6xl px-4 py-12">
					<h1 className="text-4xl font-semibold">Blog & News</h1>
					<p className="text-zinc-600 mt-2">
						Total {total} artikel.{" "}
						{q ? (
							<span>
								Filter: <span className="font-medium">"{q}"</span>
							</span>
						) : null}
					</p>
					<form className="mt-6 flex gap-3" action="/blog" method="GET">
						<input
							className="rounded border border-zinc-300 px-3 py-2 w-full md:w-96"
							placeholder="Cari artikel..."
							name="q"
							defaultValue={q}
						/>
						<button
							className="rounded px-4 py-2 text-white"
							style={{ backgroundColor: "var(--brand)" }}
						>
							Cari
						</button>
					</form>
				</div>
			</section>

			<section>
				<div className="mx-auto max-w-6xl px-4 py-12">
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{posts.map((p) => (
							<Link
								key={p.slug}
								href={`/blog/${p.slug}`}
								className="rounded-lg border border-zinc-200 overflow-hidden group"
							>
								<div className="h-40 bg-zinc-100 group-hover:bg-zinc-200 transition-colors" />
								<div className="p-4">
									<div className="text-sm text-zinc-500">
										{new Date(p.date).toLocaleDateString("id-ID", {
											day: "2-digit",
											month: "short",
											year: "numeric",
										})}
									</div>
									<div className="font-medium mt-1 group-hover:underline">
										{p.title}
									</div>
									<p className="text-zinc-600 text-sm mt-2">{p.summary}</p>
								</div>
							</Link>
						))}
					</div>

					<div className="mt-10 flex items-center justify-between">
						<div className="text-sm text-zinc-600">
							Halaman {page} dari {pageCount}
						</div>
						<div className="flex gap-2">
							<Link
								className="rounded border border-zinc-300 px-3 py-2 disabled:opacity-50"
								aria-disabled={page <= 1}
								href={`/blog?page=${Math.max(1, page - 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
							>
								Prev
							</Link>
							<Link
								className="rounded border border-zinc-300 px-3 py-2 disabled:opacity-50"
								aria-disabled={page >= pageCount}
								href={`/blog?page=${Math.min(pageCount, page + 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
							>
								Next
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
