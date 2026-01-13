import { notFound } from "next/navigation";
import Link from "next/link";
import { getPost, getRelatedPosts } from "@/lib/blog";
import { ArrowLeft, Calendar, Tag, User, Clock, Facebook, Twitter, Linkedin, Link as LinkIcon, Share2 } from "lucide-react";
import { ReadingProgress } from "@/components/ReadingProgress";

type Props = { slug: string };

export default async function BlogDetailPage({ slug }: Props) {
	const post = getPost(slug);
	if (!post) return notFound();

    const relatedPosts = getRelatedPosts(slug, 3);

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

	return (
		<div className="min-h-screen bg-white">
            <ReadingProgress />
            
			{/* Breadcrumb & Navigation */}
			<div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100">
				<div className="container mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
					<Link 
						href="/blog" 
						className="group inline-flex items-center text-sm font-medium text-zinc-600 hover:text-[var(--brand)] transition-colors"
					>
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center mr-3 group-hover:bg-red-50 group-hover:text-[var(--brand)] transition-colors">
						    <ArrowLeft className="w-4 h-4" />
                        </div>
						Kembali ke Blog
					</Link>
                    
                    <div className="hidden sm:flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-[var(--brand)] transition-colors" aria-label="Share">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
				</div>
			</div>

			<article>
				{/* Hero Section */}
				<header className="relative bg-zinc-900 text-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent"></div>
                    </div>
                    
					<div className="relative container mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-28">
						<div className="max-w-4xl mx-auto text-center">
							{/* Tags */}
							{post.tags?.length ? (
								<div className="flex flex-wrap justify-center gap-2 mb-8">
									{post.tags.map((t) => (
										<span
											key={t}
											className="inline-flex items-center text-xs font-bold uppercase tracking-wider rounded-full bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-1.5"
										>
											<Tag className="w-3 h-3 mr-2" />
											{t}
										</span>
									))}
								</div>
							) : null}

							<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
								{post.title}
							</h1>

							<div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
								<div className="flex items-center bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
									<Calendar className="w-4 h-4 mr-2 text-[var(--brand)]" />
									{new Date(post.date).toLocaleDateString("id-ID", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</div>
								<div className="flex items-center bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
									<User className="w-4 h-4 mr-2 text-[var(--brand)]" />
									<span>Admin PT AMP</span>
								</div>
                                <div className="flex items-center bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
									<Clock className="w-4 h-4 mr-2 text-[var(--brand)]" />
									<span>{readingTime} menit baca</span>
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* Content */}
				<div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-16 relative z-10">
					<div className="max-w-4xl mx-auto">
						{/* Featured Image Placeholder */}
						<div className="w-full aspect-video bg-zinc-100 rounded-2xl shadow-2xl border-4 border-white mb-12 flex items-center justify-center text-zinc-300 overflow-hidden relative group">
							<div className="absolute inset-0 bg-gradient-to-tr from-zinc-200 to-zinc-50 group-hover:scale-105 transition-transform duration-700"></div>
                            
                            {/* Decorative Icon */}
							<svg className="w-24 h-24 opacity-20 relative z-10 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
							</svg>
						</div>

						<div className="flex flex-col md:flex-row gap-12">
                            {/* Main Content */}
                            <div className="flex-1">
                                <div className="prose prose-lg prose-red max-w-none text-zinc-700 leading-relaxed">
                                    <p className="lead text-xl md:text-2xl text-zinc-600 font-light mb-8 border-l-4 border-[var(--brand)] pl-6 italic">
                                        {post.summary}
                                    </p>
                                    <div className="whitespace-pre-line">
                                        {post.content}
                                    </div>
                                </div>

                                {/* Share Section */}
                                <div className="mt-16 pt-8 border-t border-zinc-100">
                                    <h3 className="text-zinc-900 font-bold mb-6 flex items-center">
                                        <Share2 className="w-5 h-5 mr-2 text-[var(--brand)]" />
                                        Bagikan Artikel
                                    </h3>
                                    <div className="flex gap-3">
                                        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
                                            <Facebook className="w-5 h-5" />
                                        </button>
                                        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm hover:shadow-md">
                                            <Twitter className="w-5 h-5" />
                                        </button>
                                        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm hover:shadow-md">
                                            <Linkedin className="w-5 h-5" />
                                        </button>
                                        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors shadow-sm hover:shadow-md ml-auto">
                                            <LinkIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
					</div>
				</div>
			</article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-20 bg-zinc-50 mt-20 border-t border-zinc-200">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-8 flex items-center">
                                <span className="w-1 h-8 bg-[var(--brand)] rounded-full mr-4"></span>
                                Artikel Terkait
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                {relatedPosts.map((related) => (
                                    <Link 
                                        href={`/blog/${related.slug}`} 
                                        key={related.slug}
                                        className="group bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="h-48 bg-zinc-100 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                                            <div className="w-full h-full bg-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                                <svg className="w-12 h-12 text-zinc-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(related.date).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-[var(--brand)] transition-colors line-clamp-2">
                                                {related.title}
                                            </h3>
                                            <p className="text-sm text-zinc-600 line-clamp-2">
                                                {related.summary}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}
		</div>
	);
}
