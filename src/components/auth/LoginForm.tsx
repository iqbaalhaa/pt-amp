"use client";

import { useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPw, setShowPw] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const canSubmit = useMemo(() => {
		if (isLoading) return false;
		if (!email.trim() || !password) return false;
		return true;
	}, [email, password, isLoading]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		await authClient.signIn.email(
			{ email, password },
			{
				onSuccess: () => {
					router.push("/admin");
					router.refresh();
				},
				onError: (ctx) => {
					setError(ctx.error.message);
					setIsLoading(false);
				},
			}
		);
	};

	return (
		<div className="w-full">
			{error && (
				<div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
					<AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
					<div className="text-sm leading-relaxed">{error}</div>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium text-zinc-800">Email</label>
					<div className="relative">
						<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="nama@perusahaan.com"
							className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm text-zinc-900 shadow-sm outline-none transition
                           placeholder:text-zinc-400
                           focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium text-zinc-800">
						Password
					</label>
					<div className="relative">
						<Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
						<input
							type={showPw ? "text" : "password"}
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-11 text-sm text-zinc-900 shadow-sm outline-none transition
                           placeholder:text-zinc-400
                           focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/15"
						/>
						<button
							type="button"
							onClick={() => setShowPw((s) => !s)}
							className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
							aria-label={
								showPw ? "Sembunyikan password" : "Tampilkan password"
							}
						>
							{showPw ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>

					<div className="flex items-center justify-between pt-1">
						
						<a
							href="#"
							className="text-xs font-medium text-[var(--brand)] hover:opacity-80"
						>
							Lupa password?
						</a>
					</div>
				</div>

				<button
					type="submit"
					disabled={!canSubmit}
					className="h-11 w-full rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-sm
                       transition hover:brightness-95 active:brightness-90
                       disabled:cursor-not-allowed disabled:opacity-60"
				>
					<span className="inline-flex items-center justify-center gap-2">
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Memproses...
							</>
						) : (
							"Masuk"
						)}
					</span>
				</button>

				<div className="pt-1 text-center text-xs text-zinc-500">
					© {new Date().getFullYear()} PT. Aurora Mitra Prakarsa. Akses
				</div>
			</form>
		</div>
	);
}
