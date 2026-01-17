import { listPosts } from "@/lib/blog";
import Link from "next/link";
import { Calendar, User, ArrowRight, FileText } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const { posts } = listPosts(1);

  return (
    <div className="flex flex-col flex-1">
      <section className="bg-zinc-50 border-b border-zinc-200 py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <span className="text-[var(--brand)] font-semibold tracking-wider text-sm uppercase mb-3 block">
            Wawasan & Berita
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-zinc-900 tracking-tight">
            Blog Industri Rempah
          </h1>
          <p className="text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Informasi terkini tentang tren pasar, budidaya kulit manis, dan kegiatan perusahaan.
          </p>
        </div>
      </section>

      {/* Blog List Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-100">
               <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-zinc-900 mb-2">Belum ada artikel</h3>
               <p className="text-zinc-500">Kunjungi kembali nanti untuk update terbaru.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.slug} className="flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[var(--brand)]/30 transition-all duration-300 group">
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden aspect-[16/9] relative">
                    <div className="w-full h-full bg-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-zinc-300" />
                    </div>
                    {post.tags && post.tags.length > 0 && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[var(--brand)] shadow-sm">
                        {post.tags[0]}
                        </div>
                    )}
                  </Link>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.date)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Admin
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-zinc-900 mb-3 line-clamp-2 group-hover:text-[var(--brand)] transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>
                    
                    <p className="text-zinc-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                      {post.summary}
                    </p>

                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center text-[var(--brand)] font-semibold text-sm hover:underline"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
