"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (loading || !name || !email || !password) return;

		setLoading(true);
		setErr(null);

		const { error } = await authClient.signUp.email({
			email,
			password,
			name,
		});
		setLoading(false);

		if (error) return setErr(error.message || "Terjadi kesalahan");
		router.push("/login");
	};

	return (
		<div className="min-h-screen flex w-full">
			{/* Left Side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center lg:text-left">
						<Link href="/" className="inline-block text-2xl font-bold text-[var(--brand)] mb-8 lg:hidden">
							PT AMP
						</Link>
						<h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Buat Akun Baru</h1>
						<p className="mt-2 text-zinc-600">
							Daftar untuk mengakses sistem manajemen PT AMP.
						</p>
					</div>

					<form onSubmit={handleRegister} className="space-y-6">
						<div className="space-y-4">
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
									Nama Lengkap
								</label>
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-[var(--brand)] focus:ring-2 focus:ring-red-100 outline-none transition-all"
									placeholder="Nama Lengkap Anda"
									required
								/>
							</div>

							<div>
								<label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
									Email Address
								</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-[var(--brand)] focus:ring-2 focus:ring-red-100 outline-none transition-all"
									placeholder="nama@example.com"
									required
								/>
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
									Password
								</label>
								<div className="relative">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="w-full px-4 py-3 rounded-lg border border-zinc-200 focus:border-[var(--brand)] focus:ring-2 focus:ring-red-100 outline-none transition-all pr-10"
										placeholder="••••••••"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
									>
										{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
							</div>
						</div>

						{err && (
							<div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
								<svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{err}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full flex items-center justify-center gap-2 bg-[var(--brand)] text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-all focus:ring-4 focus:ring-red-100 disabled:opacity-50 disabled:cursor-not-allowed group"
						>
							{loading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<>
									Daftar Sekarang
									<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
								</>
							)}
						</button>

						<div className="text-center text-sm text-zinc-600">
							Sudah punya akun?{" "}
							<Link href="/login" className="font-medium text-[var(--brand)] hover:underline">
								Masuk disini
							</Link>
						</div>
					</form>
				</div>
			</div>

			{/* Right Side - Visual */}
			<div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden items-center justify-center">
				{/* Background Decoration */}
				<div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586772002130-b0f3daa6288b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
				<div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)] to-zinc-900 opacity-90"></div>
				
				<div className="relative z-10 max-w-lg px-12 text-center text-white">
					<div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
						<span className="text-3xl font-bold">A</span>
					</div>
					<h2 className="text-4xl font-bold mb-6">Bergabung dengan PT AMP</h2>
					<p className="text-lg text-white/80 leading-relaxed">
						Sistem manajemen terintegrasi untuk mendukung operasional bisnis yang lebih efisien.
					</p>
					
					<div className="mt-12 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-left">
						<div className="text-lg font-medium mb-2">Catatan:</div>
						<p className="text-white/70 text-sm">
							Akun baru akan didaftarkan sebagai STAFF secara default. Hak akses Admin hanya dapat diberikan oleh Superadmin.
						</p>
					</div>
				</div>

				{/* Decorative Circles */}
				<div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
				<div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
			</div>
		</div>
	);
}
