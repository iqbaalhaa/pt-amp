import { Navbar } from "@/components/Navbar";

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen font-sans bg-zinc-50">
			<Navbar />
			{children}
			<footer className="border-t border-zinc-200 bg-white">
				<div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="text-sm text-zinc-600">© {new Date().getFullYear()} PT AMP</div>
					<div className="flex gap-6 text-sm text-zinc-600">
						<a href="/" className="hover:text-brand">Home</a>
						<a href="/#about" className="hover:text-brand">About</a>
						<a href="/#products" className="hover:text-brand">Product</a>
						<a href="/blog" className="hover:text-brand">Blog</a>
						<a href="/#contact" className="hover:text-brand">Contact</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
