"use client";

import { useState } from "react";
import { createHeroSlide } from "@/actions/cms-actions";
import { Plus, X, Image as ImageIcon, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

export default function CreateHeroSlideButton({
  nextOrder,
}: {
  nextOrder: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    content: string;
    action: () => Promise<void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const handleConfirm = async () => {
    if (!confirmConfig) return;

    setConfirmBusy(true);
    try {
      await confirmConfig.action();
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmBusy(false);
      setConfirmConfig(null);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ y: -4, backgroundColor: "#fafafa" }}
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center gap-3 bg-white border border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-zinc-400 transition-all h-full min-h-[280px]"
      >
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-200 group-hover:text-zinc-600 transition-colors">
          <Plus size={24} />
        </div>
        <span className="text-sm font-medium text-zinc-500 group-hover:text-zinc-700">
          Tambah Slide Baru
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white">
                <h2 className="text-lg font-bold text-zinc-900">
                  Tambah Slide Baru
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    setConfirmConfig({
                      title: "Buat Slide Baru?",
                      content:
                        "Apakah Anda yakin ingin membuat slide baru ini?",
                      action: async () => {
                        await createHeroSlide(formData);
                        setIsOpen(false);
                      },
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Judul Slide
                    </label>
                    <input
                      name="title"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                      placeholder="Judul Slide"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Urutan
                      </label>
                      <input
                        name="order"
                        type="number"
                        defaultValue={nextOrder}
                        className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-700">
                        Tipe Media
                      </label>
                      <select
                        name="type"
                        className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                      >
                        <option value="image">Gambar</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                      placeholder="Deskripsi singkat..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Media Source (URL)
                    </label>
                    <input
                      name="src"
                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">
                      Upload File
                    </label>
                    <input
                      type="file"
                      name="file"
                      accept="image/*,video/*"
                      className="block w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                    />
                  </div>

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Batal
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Simpan
            </GlassButton>
          </div>
        </form>
      </SafeModal>

      <ConfirmationDialog
        open={!!confirmConfig}
        onClose={() => setConfirmConfig(null)}
        onConfirm={handleConfirm}
        loading={confirmBusy}
        title={confirmConfig?.title}
        content={confirmConfig?.content}
      />
    </>
  );
}
