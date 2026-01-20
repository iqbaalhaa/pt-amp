"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, User, Eye, EyeOff, FileText, Image as ImageIcon } from "lucide-react";
import BlogModal from "./BlogModal";

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
          </div>
        </div>
      </motion.div>

      <BlogModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        post={post}
        authorId={currentUserId}
      />
    </>
  );
}
