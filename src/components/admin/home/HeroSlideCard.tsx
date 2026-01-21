"use client";

import { useState } from "react";
import { 
  updateHeroSlide, 
  deleteHeroSlide,
  createHeroButton,
  updateHeroButton,
  deleteHeroButton
} from "@/actions/cms-actions";
import { 
  Trash2, 
  Image as ImageIcon, 
  Video,
  Edit2,
  X,
  Plus,
  ExternalLink,
  MoreVertical,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define type locally since we don't have a shared type file yet
interface HeroButton {
  id: string;
  text: string;
  href: string;
  isPrimary: boolean;
  slideId: string;
}

interface HeroSlide {
  id: string;
  type: string;
  src: string;
  title: string;
  description: string;
  order: number;
  buttons: HeroButton[];
}

export default function HeroSlideCard({ slide }: { slide: HeroSlide }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      {/* --- CARD TRIGGER --- */}
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => setIsOpen(true)}
        className="group relative flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all h-full"
      >
        {/* Media Preview Area */}
        <div className="relative aspect-video bg-zinc-100 overflow-hidden">
          {slide.src ? (
            slide.type === "video" ? (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900 relative">
                 <video src={slide.src} className="w-full h-full object-cover opacity-60" muted />
                 <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Play size={48} fill="currentColor" className="opacity-80" />
                 </div>
              </div>
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${slide.src}')` }}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-300">
               <ImageIcon size={48} opacity={0.5} />
            </div>
          )}
          
          {/* Badge Order */}
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
             Slide #{slide.order}
          </div>

           {/* Type Badge */}
           <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-zinc-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
             {slide.type === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
             <span className="uppercase">{slide.type}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col gap-1 flex-1">
           <h3 className="text-base font-semibold text-zinc-900 line-clamp-1 group-hover:text-[var(--brand)] transition-colors">
             {slide.title || "Tanpa Judul"}
           </h3>
           <p className="text-xs text-zinc-500 line-clamp-2">
             {slide.description || "Tidak ada deskripsi"}
           </p>
           
           <div className="mt-3 flex items-center gap-2">
              {slide.buttons.map(btn => (
                <span key={btn.id} className={`text-[10px] px-2 py-0.5 rounded border ${btn.isPrimary ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'}`}>
                    {btn.text}
                </span>
              ))}
              {slide.buttons.length === 0 && (
                  <span className="text-[10px] text-zinc-400 italic">No buttons</span>
              )}
           </div>
        </div>
        
        {/* Hover Action Hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
            <span className="bg-white text-zinc-900 px-4 py-2 rounded-full text-xs font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
               Edit Slide
            </span>
        </div>
      </motion.div>


      {/* --- MODAL DIALOG --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white z-10">
                <div>
                   <h2 className="text-lg font-bold text-zinc-900">Edit Slide</h2>
                   <p className="text-xs text-zinc-500">Update konten dan tombol slide ini.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm"
                        title="Hapus Slide"
                    >
                        <Trash2 size={14} /> Hapus
                    </button>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto p-6 bg-zinc-50/50 flex-1 custom-scrollbar">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* LEFT COLUMN: Slide Settings */}
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                           <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-3">
                              <Edit2 size={16} /> Informasi Utama
                           </div>
                           
                           <form
                              action={async (formData) => {
                                await updateHeroSlide(slide.id, formData);
                                setIsOpen(false); // Close on save? Or keep open? Let's keep open for better UX, maybe add toast.
                                // For now, just let it update.
                              }}
                              className="space-y-4"
                            >
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700">Judul Slide</label>
                                <input
                                  name="title"
                                  defaultValue={slide.title}
                                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                  placeholder="Contoh: Company Profile"
                                />
                              </div>
                              
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-700">Deskripsi</label>
                                <textarea
                                  name="description"
                                  defaultValue={slide.description}
                                  rows={3}
                                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                  placeholder="Deskripsi singkat slide..."
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                      <label className="text-xs font-medium text-zinc-700">Urutan</label>
                                      <input
                                        name="order"
                                        type="number"
                                        defaultValue={slide.order}
                                        className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                      />
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-xs font-medium text-zinc-700">Tipe Media</label>
                                      <select
                                        name="type"
                                        defaultValue={slide.type}
                                        className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                      >
                                          <option value="image">Gambar</option>
                                          <option value="video">Video</option>
                                      </select>
                                  </div>
                              </div>

                              <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-zinc-700">Media Source (URL)</label>
                                  <input
                                    name="src"
                                    defaultValue={slide.src}
                                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                    placeholder="https://..."
                                  />
                              </div>

                              <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-zinc-700">Upload File (Optional)</label>
                                  <input
                                    type="file"
                                    name="file"
                                    accept="image/*,video/*"
                                    className="block w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                                  />
                              </div>

                              <div className="pt-2">
                                <button type="submit" className="w-full py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors">
                                    Simpan Perubahan
                                </button>
                              </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Buttons & Preview */}
                    <div className="space-y-6">
                         {/* Buttons Manager */}
                         <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                           <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                                  <ExternalLink size={16} /> Tombol Aksi
                              </div>
                           </div>
                           
                           <div className="space-y-3">
                              {slide.buttons.map((btn) => (
                                  <div key={btn.id} className="flex flex-col gap-2 p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                                      <form
                                          action={async (formData) => {
                                              await updateHeroButton(btn.id, formData);
                                          }}
                                          className="flex flex-col gap-2"
                                      >
                                          <div className="flex gap-2">
                                              <input 
                                                  name="text" 
                                                  defaultValue={btn.text} 
                                                  placeholder="Label Tombol"
                                                  className="flex-1 px-2 py-1.5 text-xs border border-zinc-200 rounded bg-white"
                                              />
                                              <select 
                                                  name="isPrimary" 
                                                  defaultValue={String(btn.isPrimary)}
                                                  className="px-2 py-1.5 text-xs border border-zinc-200 rounded bg-white"
                                              >
                                                  <option value="true">Primary</option>
                                                  <option value="false">Secondary</option>
                                              </select>
                                          </div>
                                          <div className="flex gap-2">
                                              <input 
                                                  name="href" 
                                                  defaultValue={btn.href} 
                                                  placeholder="Link URL (e.g. /contact)"
                                                  className="flex-1 px-2 py-1.5 text-xs border border-zinc-200 rounded bg-white"
                                              />
                                              <button type="submit" className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-medium rounded">
                                                  Save
                                              </button>
                                              <button 
                                                  type="button" 
                                                  onClick={async () => await deleteHeroButton(btn.id)}
                                                  className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                                              >
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                      </form>
                                  </div>
                              ))}

                              {/* Add New Button */}
                              <div className="pt-2 border-t border-zinc-100">
                                  <p className="text-xs font-medium text-zinc-500 mb-2">Tambah Tombol Baru</p>
                                  <form 
                                      action={async (formData) => {
                                          await createHeroButton(slide.id, formData);
                                      }}
                                      className="flex flex-col gap-2"
                                  >
                                      <div className="flex gap-2">
                                          <input name="text" placeholder="Label" className="flex-1 px-2 py-1.5 text-xs border border-zinc-200 rounded" required />
                                          <select name="isPrimary" className="px-2 py-1.5 text-xs border border-zinc-200 rounded">
                                              <option value="true">Primary</option>
                                              <option value="false">Secondary</option>
                                          </select>
                                      </div>
                                      <div className="flex gap-2">
                                          <input name="href" placeholder="URL" className="flex-1 px-2 py-1.5 text-xs border border-zinc-200 rounded" required />
                                          <button type="submit" className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded hover:bg-zinc-800">
                                              <Plus size={14} /> Add
                                          </button>
                                      </div>
                                  </form>
                              </div>
                           </div>
                         </div>
                    </div>

                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
         {isDeleteModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                 onClick={() => setIsDeleteModalOpen(false)}
               />
               <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
               >
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Hapus Slide?</h3>
                  <p className="text-sm text-zinc-500 mb-6">
                    Tindakan ini tidak dapat dibatalkan. Slide akan dihapus permanen.
                  </p>
                  <div className="flex justify-end gap-3">
                     <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg"
                     >
                        Batal
                     </button>
                     <form action={async () => {
                        await deleteHeroSlide(slide.id);
                        setIsDeleteModalOpen(false);
                     }}>
                        <button 
                           type="submit"
                           className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                        >
                           Ya, Hapus
                        </button>
                     </form>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </>
  );
}