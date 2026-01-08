export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen font-sans">
			<header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-zinc-200">
				<div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
					<div
						className="text-xl font-semibold tracking-tight"
						style={{ color: "var(--brand)" }}
					>
						PT AMP
					</div>
					<nav className="hidden md:flex items-center gap-2 text-sm">
						<a href="/" className="inline-flex items-center h-9 px-3 rounded hover:bg-zinc-100">Home</a>
						<a href="/#about" className="inline-flex items-center h-9 px-3 rounded hover:bg-zinc-100">About Us</a>
						<a href="/#products" className="inline-flex items-center h-9 px-3 rounded hover:bg-zinc-100">Product</a>
						<a href="/blog" className="inline-flex items-center h-9 px-3 rounded hover:bg-zinc-100">Blog</a>
						<a href="/#contact" className="inline-flex items-center h-9 px-3 rounded hover:bg-zinc-100">Contact</a>
						<a
							href="/login"
							className="inline-flex items-center h-9 px-3 rounded text-white"
							style={{ backgroundColor: "var(--brand)" }}
						>
							Login
						</a>
					</nav>
					<a
						href="/login"
						className="md:hidden inline-block rounded px-3 py-2 text-white"
						style={{ backgroundColor: "var(--brand)" }}
					>
						Login
					</a>
				</div>
			</header>
			{children}
			<footer className="border-t border-zinc-200">
				<div className="mx-auto max-w-6xl px-4 py-8 flex items-center justify-between">
					<div className="text-sm">© {new Date().getFullYear()} PT AMP</div>
					<div className="flex gap-4 text-sm">
						<a href="/">Home</a>
						<a href="/#about">About</a>
						<a href="/#products">Product</a>
						<a href="/blog">Blog</a>
						<a href="/#contact">Contact</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
