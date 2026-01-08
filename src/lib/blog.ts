export interface BlogPost {
	slug: string;
	title: string;
	date: string; // ISO
	summary: string;
	content: string;
	tags?: string[];
}

export const BLOG_PAGE_SIZE = 9;

const POSTS: BlogPost[] = [
	{
		slug: "optimasi-penjemuran-kulit-manis",
		title: "Optimasi Penjemuran Kulit Manis",
		date: "2026-01-05",
		summary:
			"Memperbaiki durasi dan teknik penjemuran untuk mutu yang stabil.",
		content:
			"Penjemuran adalah tahap krusial dalam proses kulit manis. Kami melakukan evaluasi durasi, intensitas cahaya, dan aliran udara untuk mendapatkan kadar air yang sesuai sebelum pengemasan. Dengan SOP terbaru, kami menekan variasi mutu antar batch.",
		tags: ["proses", "quality"],
	},
	{
		slug: "kemitraan-petani-desa",
		title: "Kemitraan dengan Petani Desa",
		date: "2026-01-03",
		summary:
			"Program pembinaan mutu bahan baku dan transparansi penimbangan.",
		content:
			"Kami meningkatkan kerja sama dengan petani melalui pelatihan pembersihan awal dan transparansi penimbangan. Hal ini berdampak pada konsistensi grade dan kepercayaan mitra.",
		tags: ["kemitraan"],
	},
	{
		slug: "standar-pengemasan-ball",
		title: "Standar Pengemasan Ball 40–60 kg",
		date: "2025-12-28",
		summary:
			"Implementasi standar pengemasan untuk mempermudah handling dan distribusi.",
		content:
			"Ball standar 40–60 kg memudahkan penanganan di gudang dan saat pengiriman. Setiap ball memiliki label berat, tanggal, dan batch untuk pelacakan mutu.",
		tags: ["packaging"],
	},
	{
		slug: "kontrol-mutu-batch",
		title: "Kontrol Mutu Antar Batch",
		date: "2025-12-20",
		summary:
			"Pemeriksaan visual, kadar air, dan kebersihan sebelum penjualan.",
		content:
			"Setiap batch diperiksa visual, kadar air, dan kebersihan. Batch yang tidak memenuhi standar diproses ulang untuk menjaga reputasi kualitas.",
		tags: ["quality"],
	},
	{
		slug: "perbaikan-alur-gudang",
		title: "Perbaikan Alur Gudang",
		date: "2025-12-12",
		summary:
			"Penataan ulang alur masuk-keluar bahan untuk efisiensi kerja.",
		content:
			"Kami menata ulang area penerimaan, pembersihan, penjemuran, dan pengemasan agar alur kerja lebih lancar dan mengurangi bottleneck.",
		tags: ["operasional"],
	},
	{
		slug: "uji-coba-grade-baru",
		title: "Uji Coba Grade Baru",
		date: "2025-12-05",
		summary:
			"Eksperimen kombinasi grade untuk memenuhi permintaan tertentu.",
		content:
			"Dilakukan uji coba kombinasi grade untuk menyesuaikan kebutuhan klien tertentu sambil mempertahankan standar mutu keseluruhan.",
		tags: ["produk"],
	},
	{
		slug: "pelatihan-karyawan-bulanan",
		title: "Pelatihan Karyawan Bulanan",
		date: "2025-11-25",
		summary:
			"Pelatihan rutin terkait kebersihan, keselamatan kerja, dan SOP.",
		content:
			"Karyawan mendapatkan pelatihan rutin agar konsisten dalam menjalankan SOP pembersihan dan pengemasan dengan aman.",
		tags: ["sdm"],
	},
	{
		slug: "perawatan-peralatan-pengikisan",
		title: "Perawatan Peralatan Pengikisan",
		date: "2025-11-18",
		summary:
			"Perawatan berkala alat pengikisan untuk hasil yang lebih halus.",
		content:
			"Perawatan alat pengikisan mencegah kerusakan bahan dan menghasilkan serat yang lebih halus, memudahkan proses berikutnya.",
		tags: ["proses"],
	},
	{
		slug: "peningkatan-keamanan-gudang",
		title: "Peningkatan Keamanan Gudang",
		date: "2025-11-10",
		summary:
			"Pembaruan sistem pengawasan untuk mencegah kehilangan stok.",
		content:
			"Pengawasan gudang ditingkatkan dengan pencatatan keluar-masuk yang lebih ketat dan inspeksi berkala.",
		tags: ["operasional"],
	},
	{
		slug: "ekspor-perdana",
		title: "Ekspor Perdana",
		date: "2025-10-30",
		summary:
			"Pengiriman batch perdana ke klien luar negeri dengan standar dokumen.",
		content:
			"Kami melakukan ekspor perdana dengan memastikan dokumen dan kualitas memenuhi standar negara tujuan.",
		tags: ["penjualan"],
	},
	{
		slug: "penataan-area-penjemuran",
		title: "Penataan Area Penjemuran",
		date: "2025-10-22",
		summary:
			"Re-layout area penjemuran agar aliran udara lebih merata.",
		content:
			"Area penjemuran diatur ulang untuk memastikan aliran udara merata, mempercepat proses dan mengurangi variasi.",
		tags: ["proses"],
	},
	{
		slug: "pemilahan-bahan-mentah",
		title: "Pemilahan Bahan Mentah",
		date: "2025-10-15",
		summary:
			"Pemilahan awal sebelum pembersihan untuk efisiensi kerja.",
		content:
			"Pemilahan berdasarkan kondisi awal bahan mentah mempercepat pembersihan dan mengurangi beban kerja di tahap berikutnya.",
		tags: ["pengadaan"],
	},
];

export function listPosts(page = 1, q?: string) {
	const normalizedQ = (q || "").trim().toLowerCase();
	const filtered = normalizedQ
		? POSTS.filter(
				(p) =>
					p.title.toLowerCase().includes(normalizedQ) ||
					p.summary.toLowerCase().includes(normalizedQ) ||
					(p.tags || []).some((t) =>
						t.toLowerCase().includes(normalizedQ),
					),
		  )
		: POSTS;
	const total = filtered.length;
	const pageCount = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));
	const start = (Math.max(1, page) - 1) * BLOG_PAGE_SIZE;
	const posts = filtered.slice(start, start + BLOG_PAGE_SIZE);
	return { posts, total, page, pageCount };
}

export function getPost(slug: string) {
	if (!slug) return undefined;
	const s = slug.toLowerCase();
	return POSTS.find((p) => p.slug.toLowerCase() === s);
}

export function latestPosts(n = 3) {
	return POSTS.slice(0, n);
}

export function allSlugs() {
	return POSTS.map((p) => p.slug);
}
