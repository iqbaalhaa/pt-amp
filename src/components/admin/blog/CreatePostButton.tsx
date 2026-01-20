"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import BlogModal from "./BlogModal";

export default function CreatePostButton({ authorId }: { authorId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg text-sm font-medium hover:bg-[var(--brand)]/90 transition-colors shadow-sm"
      >
        <Plus size={16} />
        Buat Artikel Baru
      </button>

      <BlogModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        authorId={authorId}
      />
    </>
  );
}
