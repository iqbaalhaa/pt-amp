export default function Home() {
	return (
		<div className="min-h-screen font-sans">
			<header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-200">
				<div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
					<div className="text-xl font-semibold tracking-tight" style={{ color: "var(--brand)" }}>
						PT AMP
					</div>
					<nav className="hidden md:flex gap-6 text-sm">
						<a href="#about" className="hover:text-zinc-900">About Us</a>
						<a href="#products" className="hover:text-zinc-900">Product</a>
						<a href="/blog" className="hover:text-zinc-900">Blog</a>
						<a href="#contact" className="hover:text-zinc-900">Contact</a>
						<a
							href="/login"
							className="rounded px-3 py-2 text-white"
							style={{ backgroundColor: "var(--brand)" }}
						>
							Login
						</a>
					</nav>
					<a
						href="#contact"
						className="md:hidden inline-block rounded px-3 py-2 text-white"
						style={{ backgroundColor: "var(--brand)" }}
					>
						Contact
					</a>
				</div>
			</header>

			<section className="relative overflow-hidden bg-white">
				<div className="mx-auto max-w-6xl px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
					<div>
						<h1 className="text-5xl md:text-6xl font-semibold leading-tight mb-4">
							<span className="bg-gradient-to-r from-[#d50e0c] to-orange-400 bg-clip-text text-transparent">
								Company Profile
							</span>
						</h1>
						<p className="text-zinc-600 mb-8">
							Perusahaan kulit manis skala UMKM–menengah. Fokus pada pembelian bahan mentah,
							proses pembersihan dan preparasi, hingga penjualan produk berkualitas.
						</p>
						<div className="flex gap-3">
							<a
								href="#products"
								className="rounded px-5 py-3 text-white"
								style={{ backgroundColor: "var(--brand)" }}
							>
								Lihat Produk
							</a>
							<a
								href="/blog"
								className="rounded px-5 py-3 border border-zinc-300"
							>
								Lihat Blog
							</a>
						</div>
					</div>
					<div className="rounded-xl h-64 md:h-80 bg-gradient-to-br from-zinc-100 to-zinc-200 shadow-inner" />
				</div>
			</section>

			<section id="about" className="bg-white">
				<div className="mx-auto max-w-6xl px-4 py-16">
					<h2 className="text-3xl font-semibold mb-4">About Us</h2>
					<p className="text-zinc-600 max-w-3xl">
						Kami membeli kulit manis dari petani, melakukan pembersihan, pengikisan, penjemuran,
						dan pengemasan dalam ball 40–60 kg. Dengan tim ±10 orang, kami menjaga kualitas
						untuk memenuhi kebutuhan pasar lokal dan ekspor.
					</p>
					<div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="rounded-xl border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
							<div className="text-lg font-medium mb-2">Pengadaan</div>
							<p className="text-zinc-600">Kemitraan dengan petani untuk bahan baku berkualitas.</p>
						</div>
						<div className="rounded-xl border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
							<div className="text-lg font-medium mb-2">Proses</div>
							<p className="text-zinc-600">Pembersihan, pengikisan, penjemuran, dan pengemasan standar.</p>
						</div>
						<div className="rounded-xl border border-zinc-200 p-6 hover:shadow-lg transition-shadow">
							<div className="text-lg font-medium mb-2">Penjualan</div>
							<p className="text-zinc-600">Distribusi produk siap jual dengan kontrol mutu.</p>
						</div>
					</div>
				</div>
			</section>

			<section id="products" className="bg-white">
				<div className="mx-auto max-w-6xl px-4 py-16">
					<h2 className="text-3xl font-semibold mb-4">Product</h2>
					<p className="text-zinc-600 mb-8">Produk kulit manis siap jual dalam berbagai grade.</p>
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow">
							<div className="h-40 bg-gradient-to-br from-zinc-100 to-zinc-200" />
							<div className="p-4">
								<div className="font-medium">Cinnamon Grade A</div>
								<div className="text-zinc-600 text-sm">Ball 40–60 kg</div>
							</div>
						</div>
						<div className="rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow">
							<div className="h-40 bg-gradient-to-br from-zinc-100 to-zinc-200" />
							<div className="p-4">
								<div className="font-medium">Cinnamon Grade B</div>
								<div className="text-zinc-600 text-sm">Ball 40–60 kg</div>
							</div>
						</div>
						<div className="rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow">
							<div className="h-40 bg-gradient-to-br from-zinc-100 to-zinc-200" />
							<div className="p-4">
								<div className="font-medium">Cinnamon Mixed</div>
								<div className="text-zinc-600 text-sm">Ball 40–60 kg</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-white">
				<div className="mx-auto max-w-6xl px-4 py-16">
					<h2 className="text-3xl font-semibold mb-4">Latest News</h2>
					<p className="text-zinc-600 mb-8">
						Update terbaru operasional dan mutu. Lihat selengkapnya di halaman Blog.
					</p>
					<div className="grid md:grid-cols-3 gap-6">
						<a className="rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow" href="/blog">
							<div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200" />
							<div className="p-4">
								<div className="font-medium">Optimasi Penjemuran Kulit Manis</div>
								<p className="text-zinc-600 text-sm">Mutu stabil melalui SOP penjemuran.</p>
							</div>
						</a>
						<a className="rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow" href="/blog">
							<div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200" />
							<div className="p-4">
								<div className="font-medium">Kemitraan dengan Petani Desa</div>
								<p className="text-zinc-600 text-sm">Transparansi dan pembinaan mutu.</p>
							</div>
						</a>
						<a className="rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow" href="/blog">
							<div className="h-32 bg-gradient-to-br from-zinc-100 to-zinc-200" />
							<div className="p-4">
								<div className="font-medium">Standar Pengemasan Ball 40–60 kg</div>
								<p className="text-zinc-600 text-sm">Kontrol berat dan pelacakan batch.</p>
							</div>
						</a>
					</div>
				</div>
			</section>

			<section id="contact" className="bg-white">
				<div className="mx-auto max-w-6xl px-4 py-16">
					<h2 className="text-3xl font-semibold mb-4">Contact</h2>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="rounded-lg border border-zinc-200 p-6">
							<div className="font-medium mb-2">Alamat</div>
							<p className="text-zinc-600">Kantor dan produksi. Hubungi untuk detail alamat.</p>
							<div className="mt-4">
								<div className="text-sm">Telp: +62</div>
								<div className="text-sm">Email: info@pt-amp.com</div>
							</div>
						</div>
						<form className="rounded-lg border border-zinc-200 p-6 grid gap-3">
							<input className="rounded border border-zinc-300 px-3 py-2" placeholder="Nama" />
							<input className="rounded border border-zinc-300 px-3 py-2" placeholder="Email" />
							<textarea className="rounded border border-zinc-300 px-3 py-2" placeholder="Pesan" rows={4} />
							<button
								type="button"
								className="rounded px-4 py-2 text-white"
								style={{ backgroundColor: "var(--brand)" }}
							>
								Kirim
							</button>
						</form>
					</div>
				</div>
			</section>

			<footer className="border-t border-zinc-200">
				<div className="mx-auto max-w-6xl px-4 py-8 flex items-center justify-between">
					<div className="text-sm">© {new Date().getFullYear()} PT AMP</div>
					<div className="flex gap-4 text-sm">
						<a href="#about">About</a>
						<a href="#products">Product</a>
						<a href="/blog">Blog</a>
						<a href="#contact">Contact</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
