"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200 shadow-sm">
			<div className="container mx-auto px-4 md:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="text-2xl font-bold tracking-tight text-brand hover:opacity-90 transition-opacity" style={{ color: "var(--brand)" }}>
						PT AMP
					</Link>

					{/* Desktop Nav */}
					<nav className="hidden md:flex items-center gap-8 text-sm font-medium">
						<Link href="/about" className="text-zinc-600 hover:text-brand transition-colors">
							About Us
						</Link>
						<Link href="/products" className="text-zinc-600 hover:text-brand transition-colors">
							Product
						</Link>
						<Link href="/gallery" className="text-zinc-600 hover:text-brand transition-colors">
							Gallery
						</Link>
						<Link href="/blog" className="text-zinc-600 hover:text-brand transition-colors">
							Blog
						</Link>
						<Link href="/contact" className="text-zinc-600 hover:text-brand transition-colors">
							Contact
						</Link>
						<Link
							href="/login"
							className="px-4 py-2 rounded-lg text-white font-medium transition-transform hover:scale-105 active:scale-95"
							style={{ backgroundColor: "var(--brand)" }}
						>
							Login
						</Link>
					</nav>

					{/* Mobile Menu Button */}
					<button
						className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
						onClick={() => setIsOpen(!isOpen)}
						aria-label="Toggle menu"
					>
						{isOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile Nav Dropdown */}
			{isOpen && (
				<div className="md:hidden border-t border-zinc-100 bg-white absolute w-full left-0 shadow-lg animate-in slide-in-from-top-2">
					<div className="flex flex-col p-4 space-y-4">
						<Link
							href="/about"
							className="text-zinc-600 hover:text-brand hover:bg-zinc-50 px-4 py-2 rounded-md transition-colors font-medium"
							onClick={() => setIsOpen(false)}
						>
							About Us
						</Link>
						<Link
							href="/products"
							className="text-zinc-600 hover:text-brand hover:bg-zinc-50 px-4 py-2 rounded-md transition-colors font-medium"
							onClick={() => setIsOpen(false)}
						>
							Product
						</Link>
						<Link
							href="/gallery"
							className="text-zinc-600 hover:text-brand hover:bg-zinc-50 px-4 py-2 rounded-md transition-colors font-medium"
							onClick={() => setIsOpen(false)}
						>
							Gallery
						</Link>
						<Link
							href="/blog"
							className="text-zinc-600 hover:text-brand hover:bg-zinc-50 px-4 py-2 rounded-md transition-colors font-medium"
							onClick={() => setIsOpen(false)}
						>
							Blog
						</Link>
						<Link
							href="/contact"
							className="text-zinc-600 hover:text-brand hover:bg-zinc-50 px-4 py-2 rounded-md transition-colors font-medium"
							onClick={() => setIsOpen(false)}
						>
							Contact
						</Link>
						<div className="pt-2 border-t border-zinc-100">
							<Link
								href="/login"
								className="block w-full text-center px-4 py-2 rounded-lg text-white font-medium transition-transform active:scale-95"
								style={{ backgroundColor: "var(--brand)" }}
								onClick={() => setIsOpen(false)}
							>
								Login
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
