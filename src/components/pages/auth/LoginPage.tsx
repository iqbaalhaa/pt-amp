import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

export default function LoginPage() {
	return (
		<div className="min-h-screen w-full flex">
			{/* Left Side - Branding & Visuals */}
			<div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 flex-col justify-between p-12 overflow-hidden">
				{/* Background Pattern/Image */}
				<div className="absolute inset-0 z-0">
					<div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black opacity-90" />
					<div 
						className="absolute inset-0 opacity-20"
						style={{
							backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')",
							backgroundSize: "cover",
							backgroundPosition: "center",
						}}
					/>
					{/* Decorative blobs */}
					<div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--brand)] opacity-20 blur-[100px]" />
					<div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600 opacity-20 blur-[100px]" />
				</div>

				{/* Content */}
				<div className="relative z-10">
					<div className="flex items-center gap-2 text-white/90 mb-8">
						<div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
							<Building2 className="w-6 h-6" />
						</div>
						<span className="text-xl font-bold tracking-tight">PT AMP Dashboard</span>
					</div>
					
					<div className="space-y-6 max-w-lg">
						<h2 className="text-4xl font-bold text-white leading-tight">
							Sistem Manajemen Produksi & Inventaris Terpadu
						</h2>
						<p className="text-lg text-zinc-400 leading-relaxed">
							Kelola seluruh proses bisnis dari hulu ke hilir dalam satu platform yang efisien, aman, dan real-time.
						</p>
					</div>
				</div>

				<div className="relative z-10 text-zinc-500 text-sm">
					&copy; {new Date().getFullYear()} PT Agam Mitra Persada. All rights reserved.
				</div>
			</div>

			{/* Right Side - Login Form */}
			<div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 bg-white relative">
				<div className="w-full max-w-[400px] space-y-8">
					{/* Mobile Header */}
					<div className="lg:hidden flex items-center gap-2 mb-8 text-zinc-900">
						<div className="bg-zinc-100 p-2 rounded-lg border border-zinc-200">
							<Building2 className="w-6 h-6" />
						</div>
						<span className="text-xl font-bold">PT AMP</span>
					</div>

					<div>
						<Link
							href="/"
							className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors group mb-6"
						>
							<ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
							Kembali ke Beranda
						</Link>
						<h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
							Selamat Datang Kembali
						</h1>
						<p className="text-zinc-500">
							Silakan masuk untuk mengakses dashboard anda.
						</p>
					</div>

					<LoginForm />

					<p className="text-center text-sm text-zinc-500">
						Belum punya akun?{" "}
						<Link href="/register" className="font-semibold text-[var(--brand)] hover:underline">
							Daftar sekarang
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
