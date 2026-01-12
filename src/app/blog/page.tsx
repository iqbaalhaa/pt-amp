import Link from "next/link";
import { listPosts } from "@/lib/blog";
import { Search, Calendar, Tag, ArrowRight, Clock } from "lucide-react";

export const metadata = {
  title: "Blog & News | PT AMP",
  description: "Berita, wawasan, dan pembaruan operasional dari PT AMP.",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page || "1");
  const q = params?.q || "";
  const { posts, pageCount, total } = listPosts(page, q);

  // Extract all unique tags from posts (for display purposes - could be dynamic later)
  // In a real app, this would come from a DB aggregation
  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="bg-white border-b border-zinc-200 pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block animate-in fade-in slide-in-from-bottom-2 duration-500">
              Newsroom
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-zinc-900 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Wawasan & Berita
            </h1>
            <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
              Ikuti perkembangan terbaru, cerita dari lapangan, dan inovasi dalam industri kulit manis bersama PT AMP.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-12 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            <form className="relative w-full md:w-96" action="/blog" method="GET">
              <div className="relative">
                <input
                  className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all text-zinc-900 placeholder:text-zinc-400"
                  placeholder="Cari artikel..."
                  name="q"
                  defaultValue={q}
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
              </div>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <Link 
                href="/blog"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!q ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}
              >
                Semua
              </Link>
              {allTags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?q=${tag}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${q === tag ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'}`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {q && (
             <div className="mb-8 flex items-center gap-2 text-zinc-600">
               <span>Hasil pencarian untuk: <span className="font-bold text-zinc-900">&quot;{q}&quot;</span></span>
               <Link href="/blog" className="text-sm text-[var(--brand)] hover:underline ml-2">Clear</Link>
             </div>
          )}

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl hover:border-[var(--brand)]/30 transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="h-56 bg-zinc-100 relative overflow-hidden">
                    {/* Abstract Pattern / Placeholder since we don't have real images in post data yet */}
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                       <div className="text-zinc-300 transform group-hover:scale-110 transition-transform duration-700">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                       </div>
                    </div>
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-zinc-100 flex items-center gap-2 text-xs font-semibold text-zinc-800">
                      <Calendar className="w-3 h-3 text-[var(--brand)]" />
                      {new Date(post.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex gap-2 mb-4">
                      {post.tags?.map(tag => (
                        <span key={tag} className="px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-xs font-medium uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-[var(--brand)] transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-zinc-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {post.summary}
                    </p>

                    <div className="flex items-center text-[var(--brand)] font-semibold text-sm group/btn">
                      Baca Artikel
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-zinc-200">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Tidak ada artikel ditemukan</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                Coba gunakan kata kunci lain atau kembali ke daftar semua artikel.
              </p>
              <Link href="/blog" className="inline-block mt-6 px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors">
                Lihat Semua Artikel
              </Link>
            </div>
          )}

          {/* Simple Pagination */}
          {pageCount > 1 && (
             <div className="mt-16 flex justify-center gap-2">
               {Array.from({ length: pageCount }).map((_, i) => (
                 <Link
                   key={i}
                   href={`/blog?page=${i + 1}${q ? `&q=${q}` : ''}`}
                   className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                     page === i + 1
                       ? "bg-zinc-900 text-white"
                       : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                   }`}
                 >
                   {i + 1}
                 </Link>
               ))}
             </div>
          )}
        </div>
      </section>

      {/* Newsletter / CTA Section (Optional for "coolness") */}
      
    </div>
  );
}
