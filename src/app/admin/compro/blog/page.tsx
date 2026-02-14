import { getPosts } from "@/actions/blog-actions";
import BlogCard from "@/components/admin/blog/BlogCard";
import CreatePostButton from "@/components/admin/blog/CreatePostButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { posts } = await getPosts(1, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Pengaturan Blog</h1>
          <p className="text-zinc-600 text-sm mt-1">Kelola artikel, berita, dan wawasan perusahaan.</p>
        </div>
        <CreatePostButton authorId={session.user.id} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post as any} currentUserId={session.user.id} />
        ))}
      </div>
      
      {posts.length === 0 && (
          <div className="text-center py-20 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
              <p className="text-zinc-500">Belum ada artikel blog.</p>
          </div>
      )}
    </div>
  );
}
