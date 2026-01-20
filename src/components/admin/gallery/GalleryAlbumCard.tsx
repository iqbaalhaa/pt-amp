"use client";

import { useState, useRef } from "react";
import { Album } from "@/components/GalleryAlbums";
import {
  updateGalleryAlbum,
  deleteGalleryAlbum,
  createGalleryMedia,
  updateGalleryMedia,
  deleteGalleryMedia,
} from "@/actions/cms-actions";
import { 
  Trash2, 
  Image as ImageIcon, 
  Film, 
  Upload,
  Save,
  X,
  MoreHorizontal,
  Edit2,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryAlbumCard({ album }: { album: Album }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hasFile, setHasFile] = useState(false);
  const [hasCoverFile, setHasCoverFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaFormRef = useRef<HTMLFormElement>(null);

  // Fallback gradient if no cover image
  const bgImage = album.coverImage 
    ? `url('${album.coverImage}')` 
    : "linear-gradient(to bottom right, #f4f4f5, #e4e4e7)";

  return (
    <>
      {/* --- CARD TRIGGER --- */}
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => setIsOpen(true)}
        className="group relative flex flex-col bg-white border border-zinc-200 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all h-full"
      >
        {/* Cover Image Area */}
        <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
          {album.coverImage ? (
             <div 
               className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
               style={{ backgroundImage: `url('${album.coverImage}')` }}
             />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-300">
               <ImageIcon size={48} opacity={0.5} />
            </div>
          )}
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          {/* Badge Count */}
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
             <ImageIcon size={12} />
             {album.items.length}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col gap-1 flex-1">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                 #{album.order ?? 0}
              </span>
           </div>
           <h3 className="text-base font-semibold text-zinc-900 line-clamp-1 group-hover:text-[var(--brand)] transition-colors">
             {album.title || "Tanpa Judul"}
           </h3>
           <p className="text-xs text-zinc-500 line-clamp-2">
             {album.description || "Tidak ada deskripsi"}
           </p>
        </div>
        
        {/* Hover Action Hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
            <span className="bg-white text-zinc-900 px-4 py-2 rounded-full text-xs font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
               Kelola Album
            </span>
        </div>

        {/* Quick Delete Button (Moved to Root for better visibility) */}
        <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            className="absolute top-2 right-2 z-30 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
            title="Hapus Album"
        >
            <Trash2 size={16} />
        </button>
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
              className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white z-10">
                <div>
                   <h2 className="text-lg font-bold text-zinc-900">Edit Album: {album.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm"
                        title="Hapus Album"
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
                 <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
                    
                    {/* LEFT COLUMN: Album Settings */}
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                           <div className="flex items-center justify-between">
                             <button 
                               type="button" 
                               onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                               className="flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-zinc-700 transition-colors"
                             >
                                <div className="flex items-center gap-2">
                                  <Edit2 size={14} /> Informasi Album
                                </div>
                                {isInfoExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                             </button>
                           </div>
                           
                           {isInfoExpanded && (
                             <form
                                action={async (formData) => {
                                  await updateGalleryAlbum(album.id, formData);
                                }}
                                className="space-y-4 pt-2 border-t border-zinc-100 animate-in slide-in-from-top-2 duration-200"
                              >
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-zinc-700">Judul Album</label>
                                  <input
                                    name="title"
                                    defaultValue={album.title}
                                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                      <label className="text-xs font-medium text-zinc-700">Urutan</label>
                                      <input
                                        name="order"
                                        type="number"
                                        defaultValue={album.order ?? 0}
                                        className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                      />
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-zinc-700">Deskripsi</label>
                                  <textarea
                                    name="description"
                                    defaultValue={album.description ?? ""}
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 resize-none"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-700">Cover URL</label>
                                    <input
                                      name="coverImage"
                                      defaultValue={album.coverImage}
                                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900"
                                      placeholder="https://..."
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-700">Upload Cover</label>
                                    <label className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                                         hasCoverFile 
                                           ? "bg-red-50 border-red-200 text-red-700" 
                                           : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                    }`}>
                                        <div className={`p-1 rounded-full ${hasCoverFile ? "bg-red-100" : "bg-zinc-100"}`}>
                                           {hasCoverFile ? <Upload size={12} className="text-red-600" /> : <Upload size={12} className="text-zinc-500" />}
                                        </div>
                                        <span className="text-[10px] font-medium">
                                           {hasCoverFile ? "Cover Siap" : "Pilih Cover"}
                                        </span>
                                        <input
                                            name="coverFile"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setHasCoverFile((e.target.files?.length || 0) > 0)}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-all">
                                  <Save size={14} />
                                  Simpan Perubahan
                                </button>
                              </form>
                           )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Media Gallery */}
                    <div className="space-y-6">
                        {/* Add Media Box */}
                        <div className="bg-white p-5 rounded-xl border border-dashed border-zinc-300">
                           <h4 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                              <Upload size={16} /> Tambah Media Baru
                           </h4>
                           <form
                              ref={mediaFormRef}
                              action={async (formData) => {
                                setIsUploading(true);
                                try {
                                  await createGalleryMedia(formData);
                                  mediaFormRef.current?.reset();
                                  setHasFile(false);
                                } catch (error) {
                                  console.error("Upload error:", error);
                                  alert("Gagal mengupload media. Pastikan file tidak terlalu besar.");
                                } finally {
                                  setIsUploading(false);
                                }
                              }}
                              className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr_auto] gap-3 items-end"
                           >
                              <input type="hidden" name="albumId" value={album.id} />
                              
                              <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Tipe</label>
                                  <select
                                      name="type"
                                      className="w-full px-2 py-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50"
                                  >
                                      <option value="image">Image</option>
                                      <option value="video">Video</option>
                                  </select>
                              </div>
                              
                              <div className="space-y-1">
                                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Caption / Judul</label>
                                  <input
                                      name="caption"
                                      placeholder="Keterangan..."
                                      className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg"
                                  />
                              </div>

                              <div className="space-y-1">
                                   <label className="text-[10px] text-zinc-500 font-bold uppercase">Upload Media</label>
                                   <div className="flex gap-2">
                                       <label className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border ${
                                        hasFile 
                                          ? "bg-red-50 border-red-200 text-red-700" 
                                          : "bg-white border-red-200 text-red-600 hover:bg-red-50"
                                   }`}>
                                       <div className={`p-1.5 rounded-full ${hasFile ? "bg-red-100" : "bg-red-50"}`}>
                                          <Upload size={14} className="text-red-600" />
                                       </div>
                                       <span className="text-xs font-bold">
                                          {hasFile ? "File Siap Diupload" : "Pilih File Gambar / Video"}
                                       </span>
                                           <input
                                               name="file"
                                               type="file"
                                               multiple
                                               accept="image/*,video/*"
                                               onChange={(e) => setHasFile((e.target.files?.length || 0) > 0)}
                                               className="hidden"
                                           />
                                       </label>
                                   </div>
                              </div>

                              <button 
                                disabled={!hasFile || isUploading}
                                className={`w-full px-4 py-2 h-[38px] rounded-lg text-white text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                  hasFile && !isUploading
                                    ? "bg-red-600 hover:bg-red-700 shadow-md transform hover:-translate-y-0.5" 
                                    : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                                }`}
                              >
                                  {isUploading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-zinc-400 border-t-zinc-600" />
                                      <span>Proses...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={14} /> 
                                      {hasFile ? "Upload Sekarang" : "Pilih File"}
                                    </>
                                  )}
                              </button>
                           </form>
                        </div>

                        {/* Media Grid */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-zinc-800">Media Library</h3>
                                <span className="text-xs text-zinc-500">{album.items.length} items</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                                {album.items.map((item) => (
                                    <MediaItemCard key={item.id} item={item} />
                                ))}
                                {album.items.length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                                        <ImageIcon size={32} className="mb-2 opacity-20" />
                                        <p className="text-xs">Belum ada media</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
             <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-600">
                   <div className="p-2 bg-red-100 rounded-full"><AlertTriangle size={24} /></div>
                   <h3 className="text-lg font-bold text-zinc-900">Hapus Album?</h3>
                </div>
                <p className="text-sm text-zinc-600">
                   Tindakan ini permanen. Semua media di dalam album ini akan ikut terhapus.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                   <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                   <form action={async () => {
                       await deleteGalleryAlbum(album.id);
                       setIsDeleteModalOpen(false);
                       setIsOpen(false);
                   }}>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Ya, Hapus</button>
                   </form>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function MediaItemCard({ item }: { item: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    return (
        <div className="group relative bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Thumbnail */}
            <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                        <Film size={24} />
                    </div>
                ) : (
                    <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${item.src}')` }}
                    />
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button 
                        onClick={() => setIsEditing(true)}
                        className="p-2 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform"
                        title="Edit"
                     >
                        <Edit2 size={14} />
                     </button>
                     <button 
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 hover:scale-110 transition-transform" 
                        title="Hapus"
                     >
                        <Trash2 size={14} />
                     </button>
                </div>
            </div>

            {/* Caption */}
            <div className="p-2">
                <p className="text-[11px] font-medium text-zinc-700 truncate">
                    {item.caption || "Tanpa caption"}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-zinc-400 uppercase">{item.type}</span>
                    <span className="text-[10px] text-zinc-400">#{item.order}</span>
                </div>
            </div>

            {/* Edit Modal (Nested) */}
            {isEditing && (
                <div className="absolute inset-0 z-10 bg-white p-3 flex flex-col gap-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold">Edit Media</span>
                        <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-900"><X size={14} /></button>
                    </div>
                    <form
                        action={async (formData) => {
                            await updateGalleryMedia(item.id, formData);
                            setIsEditing(false);
                        }}
                        className="flex-1 flex flex-col gap-2"
                    >
                        <input name="caption" defaultValue={item.caption ?? ""} placeholder="Caption" className="w-full text-[10px] p-1 border rounded" />
                        <input name="src" defaultValue={item.src} placeholder="URL" className="w-full text-[10px] p-1 border rounded" />
                        <div className="flex gap-1">
                             <input name="order" type="number" defaultValue={item.order ?? 0} className="w-12 text-[10px] p-1 border rounded" />
                             <select name="type" defaultValue={item.type} className="flex-1 text-[10px] p-1 border rounded">
                                <option value="image">Img</option>
                                <option value="video">Vid</option>
                             </select>
                        </div>
                        <button className="mt-auto w-full bg-zinc-900 text-white text-[10px] py-1 rounded">Simpan</button>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal - Moved to Portal/Fixed High Z-Index Context */}
            {isDeleteModalOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
                 <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4 relative z-10 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 text-red-600">
                       <div className="p-2 bg-red-100 rounded-full"><AlertTriangle size={24} /></div>
                       <h3 className="text-lg font-bold text-zinc-900">Hapus Media?</h3>
                    </div>
                    <p className="text-sm text-zinc-600">
                       Apakah Anda yakin ingin menghapus media ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                       <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg">Batal</button>
                       <form action={async () => {
                           await deleteGalleryMedia(item.id);
                           setIsDeleteModalOpen(false);
                       }}>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Hapus</button>
                       </form>
                    </div>
                 </div>
              </div>
            )}
        </div>
    );
}
