export default function AdminAboutPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-zinc-900">Pengaturan About Us</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
                <p className="text-zinc-600">Halaman ini akan berisi pengaturan untuk:</p>
                <ul className="list-disc list-inside mt-2 text-zinc-600 space-y-1">
                    <li>Carousel Banner</li>
                    <li>Konten Text About Us</li>
                    <li>Tampilan Produk Unggulan</li>
                    <li>Pilihan Gallery</li>
                </ul>
            </div>
        </div>
    );
}