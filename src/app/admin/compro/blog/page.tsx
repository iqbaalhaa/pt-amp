import BlogPage from "@/components/pages/blog/BlogPage";

export default function AdminBlogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Pengaturan Blog</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
          <p className="text-zinc-600">Kelola artikel blog dan berita.</p>
          <div className="mt-4">
            <button className="px-4 py-2 rounded-lg bg-[var(--brand)] text-white text-sm">
              Simpan Perubahan
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-700">Preview</h2>
          </div>
          <div className="max-h-[80vh] overflow-auto">
            <BlogPage />
          </div>
        </div>
      </div>
    </div>
  );
}
