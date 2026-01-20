"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Trash2, Save } from "lucide-react";
import BlogEditor from "./BlogEditor";
import { createPost, updatePost, deletePost } from "@/actions/blog-actions";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string | null;
  published: boolean;
  authorId: string;
}

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: Post | null;
  authorId: string; // Current user ID for new posts
}

export default function BlogModal({ isOpen, onClose, post, authorId }: BlogModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  // Reset form when post changes or modal opens
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setPublished(post.published);
      setPreviewImage(post.image || "");
      setImageFile(null);
    } else {
      setTitle("");
      setContent("");
      setPublished(false);
      setPreviewImage("");
      setImageFile(null);
    }
  }, [post, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("published", String(published));
      formData.append("authorId", authorId);
      
      if (imageFile) {
        formData.append("imageFile", imageFile);
      }
      
      if (post) {
        // Update
        formData.append("existingImage", post.image || "");
        await updatePost(post.id, formData);
      } else {
        // Create
        await createPost(formData);
      }
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Gagal menyimpan artikel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;

    setLoading(true);
    try {
      await deletePost(post.id);
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Gagal menghapus artikel");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white z-10">
              <h2 className="text-lg font-bold text-zinc-900">
                {post ? "Edit Artikel" : "Buat Artikel Baru"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 custom-scrollbar">
              <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Judul Artikel</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all"
                        placeholder="Masukkan judul menarik..."
                      />
                    </div>

                    {/* Editor */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-700">Konten</label>
                      <BlogEditor content={content} onChange={setContent} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Status</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Publish</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={published} 
                            onChange={(e) => setPublished(e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brand)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Cover Image</h3>
                      
                      <div className="relative aspect-video bg-zinc-100 rounded-lg overflow-hidden border border-dashed border-zinc-300 flex items-center justify-center group">
                        {previewImage ? (
                          <>
                            <img src={previewImage} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-medium">Ganti Gambar</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <span className="text-xs text-zinc-400 block mb-2">Belum ada gambar</span>
                            <span className="text-[10px] text-zinc-400">Klik untuk upload</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        Format: JPG, PNG. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 bg-white flex items-center justify-between z-10">
              <div>
                {post && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="blog-form"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {post ? "Simpan Perubahan" : "Terbitkan"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
