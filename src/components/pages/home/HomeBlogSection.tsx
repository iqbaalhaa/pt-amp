import Link from "next/link";
import { ArrowLink } from "@/components/ArrowLink";
import { getDictionary, type Locale } from "@/lib/i18n";
import { HomeBlogImage } from "./HomeBlogImage";
import { formatPostDate } from "@/lib/format-date";

type HomePost = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  image: string | null;
};

// Hidden when there are no published posts (like TrustSection): no empty white area.
export function HomeBlogSection({
  posts,
  locale = "id",
}: {
  posts: HomePost[];
  locale?: Locale;
}) {
  const t = getDictionary(locale).home;
  if (posts.length === 0) return null;

  return (
        <section id="blog" className="py-20 bg-zinc-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">
                  {t.blogTitle}
                </h2>
                <p className="text-lg text-zinc-600">
                  {t.blogDescription}
                </p>
              </div>
              <ArrowLink href="/blog" className="hidden md:inline-flex items-center text-brand font-medium hover:underline shrink-0">
                {t.allNews}
              </ArrowLink>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block h-full flex flex-col"
                >
                  <HomeBlogImage image={post.image} title={post.title} />
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-sm text-zinc-500 mb-2">{formatPostDate(post.date, locale)}</div>
                    <h3
                      className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-brand transition-colors"
                      style={{ color: "var(--brand)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-zinc-600 line-clamp-3 text-sm flex-grow">
                      {post.summary}
                    </p>
                    <div
                      className="mt-4 text-brand font-medium text-sm flex items-center"
                      style={{ color: "var(--brand)" }}
                    >
                      {t.readMore}{" "}
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center md:hidden">
              <ArrowLink href="/blog" className="inline-flex items-center text-brand font-medium hover:underline">
                {t.allNews}
              </ArrowLink>
            </div>
          </div>
        </section>
  );
}
