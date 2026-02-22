"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Calendar, User, Eye, EyeOff, FileText, Image as ImageIcon, Trash2, Globe } from "lucide-react";
import BlogModal from "./BlogModal";
import { deletePost, togglePublish } from "@/actions/blog-actions";
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
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string | null;
    email: string;
  };
}

interface BlogCardProps {
  post: Post;
  currentUserId: string;
}

export default function BlogCard({ post, currentUserId }: BlogCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleTogglePublish = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await togglePublish(post.id, post.published);
        router.refresh();
      } catch (error) {
        console.error("Error toggling publish:", error);
        alert("Gagal mengubah status publikasi");
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        await deletePost(post.id);
        router.refresh();
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Gagal menghapus artikel");
      }
    });
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => setIsOpen(true)}
        className="group relative flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all h-full"
      >
        {/* Cover Image */}
        <div className="relative aspect-video bg-zinc-100 overflow-hidden">
          {post.image ? (
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${post.image}')` }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-300">
              <FileText size={48} opacity={0.5} />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              post.published 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}>
              {post.published ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(post.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <User size={12} />
              {post.author.name || "Admin"}
            </div>
          </div>

          <h3 className="text-base font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-[var(--brand)] transition-colors">
            {post.title}
          </h3>
          
          <div 
            className="text-sm text-zinc-600 line-clamp-3 mb-4 flex-1 prose-sm"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/<[^>]+>/g, ' ').substring(0, 150) + '...' }}
          />

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
            <span className="text-xs font-medium text-[var(--brand)] flex items-center gap-1 group-hover:underline">
              Edit Artikel
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className={`text-[10px] uppercase font-bold ${post.published ? "text-green-600" : "text-zinc-400"}`}>
                  {post.published ? "Publish" : "Private"}
                </span>
                <button
                  onClick={handleTogglePublish}
                  disabled={isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 border ${
                    post.published ? "bg-green-500 border-transparent" : "bg-zinc-200 border-zinc-200"
                  }`}
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  <span
                    className={`${
                      post.published ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm`}
                  />
                </button>
              </div>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="p-1.5 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <BlogModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        post={post}
        authorId={currentUserId}
      />

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Artikel"
      >
        <div className="flex flex-col gap-4">
          <p className="text-zinc-600">
            Apakah Anda yakin ingin menghapus artikel <strong>"{post.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <GlassButton 
              variant="secondary" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isPending}
            >
              Batal
            </GlassButton>
            <GlassButton 
              variant="danger" 
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </GlassButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
