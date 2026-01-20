"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Trash2, Save, Calendar, User, Tag, Eye } from "lucide-react";
import BlogEditor from "./BlogEditor";
import { createPost, updatePost, deletePost } from "@/actions/blog-actions";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import GlassButton from "@/components/ui/GlassButton";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleDelete = () => {
    if (!post) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!post) return;
    setLoading(true);
    try {
      await deletePost(post.id);
      router.refresh();
      setIsDeleteModalOpen(false);
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
            className="relative w-full max-w-[98vw] h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
            <div className="flex-1 overflow-hidden bg-zinc-50 w-full flex relative min-h-0">
              <form id="blog-form" onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full h-full">
                {/* Left Column - Editor */}
                <div className="w-full md:w-[70%] md:max-w-[70%] md:flex-shrink-0 overflow-y-auto p-6 custom-scrollbar h-full border-r border-zinc-200 bg-zinc-50">
                  <div className="space-y-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Judul Artikel</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)] transition-all font-medium text-lg"
                          placeholder="Masukkan judul menarik..."
                        />
                      </div>

                      {/* Editor */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700">Konten</label>
                        <BlogEditor content={content} onChange={setContent} />
                      </div>

                      {/* Settings Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-200">
                        {/* Status */}
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                          <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Status Publikasi</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600">Publish ke Website</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={published} 
                                onChange={(e) => setPublished(e.target.checked)} 
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                          </div>
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                          <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Gambar Sampul</h3>
                          
                          <div className="flex gap-4 items-start">
                            <div className="relative w-24 aspect-[3/2] bg-zinc-100 rounded-lg overflow-hidden border border-dashed border-zinc-300 flex-shrink-0 flex items-center justify-center group">
                              {previewImage ? (
                                <>
                                  <img src={previewImage} alt="Cover" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-[10px] font-medium text-center px-1">Ganti</span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-[10px] text-zinc-400 text-center px-1">Upload</span>
                              )}
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                                <p className="text-xs text-zinc-500">
                                  Format: JPG, PNG. Max 5MB. Rasio disarankan 16:9.
                                </p>
                                <button type="button" className="text-xs text-[var(--brand)] font-medium hover:underline relative">
                                    Pilih File
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>

                {/* Right Column - Live Preview */}
                <div className="hidden md:flex flex-col w-[30%] max-w-[30%] flex-shrink-0 bg-zinc-100/50 h-full overflow-hidden border-l border-zinc-200">
                  <div className="p-3 border-b border-zinc-200 bg-white flex items-center justify-between shadow-sm z-10 shrink-0">
                        <div className="flex items-center gap-2 text-zinc-600">
                            <Eye size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Live Preview</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar overflow-x-hidden">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden min-h-[500px] origin-top w-full max-w-full relative">
                            {/* Header Section */}
                            <div className="bg-zinc-900 p-6 text-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider mb-3">
                                        <Tag size={10} />
                                        <span>Preview</span>
                                    </div>
                                    <h1 className="text-xl font-bold text-white mb-3 leading-tight">
                                        {title || "Judul Artikel Akan Muncul Disini"}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-zinc-400">
                                        <div className="flex items-center bg-white/5 rounded-full px-2 py-1">
                                            <Calendar size={10} className="mr-1 text-[var(--brand)]" />
                                            <span>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                        <div className="flex items-center bg-white/5 rounded-full px-2 py-1">
                                            <User size={10} className="mr-1 text-[var(--brand)]" />
                                            <span>Admin</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="px-4 -mt-4 relative z-20">
                                <div className="aspect-video bg-zinc-100 rounded-lg shadow-lg border-2 border-white overflow-hidden relative">
                                    {previewImage ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                                            <img 
                                                src={previewImage} 
                                                alt="Preview" 
                                                className="w-full h-full object-contain" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-2 pointer-events-none">
                                                <span className="text-[10px] text-white/80 font-medium">Fit to Screen</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                            <span className="text-xs text-zinc-400">No Cover Image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-6">
                                <div className="prose prose-sm prose-red max-w-none">
                                    {content ? (
                                        <div dangerouslySetInnerHTML={{ __html: content }} />
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="h-2 bg-zinc-100 rounded w-full"></div>
                                            <div className="h-2 bg-zinc-100 rounded w-5/6"></div>
                                            <div className="h-2 bg-zinc-100 rounded w-4/6"></div>
                                            <p className="text-xs text-zinc-400 italic mt-4">Konten artikel akan muncul di sini...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* make text transparent */}
                        <div className="text-center mt-4 text-[10px] text-zinc-400" style={{ opacity: 0 }}>
                            * Preview ini adalah representasi visual. Tampilan sebenarnya mungkin sedikit berbeda tergantung perangkat user.
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

          <Modal
            open={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Hapus Artikel"
          >
            <div className="flex flex-col gap-4">
              <p className="text-zinc-600">
                Apakah Anda yakin ingin menghapus artikel <strong>"{post?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <GlassButton 
                  variant="secondary" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={loading}
                >
                  Batal
                </GlassButton>
                <GlassButton 
                  variant="danger" 
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? "Menghapus..." : "Hapus"}
                </GlassButton>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </AnimatePresence>
  );
}
