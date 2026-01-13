"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		await authClient.signUp.email(
			{
				email,
				password,
				name,
			},
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
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
					{error}
				</div>
			)}

			<div className="space-y-2">
				<label className="text-sm font-medium text-zinc-700">Nama Lengkap</label>
				<input
					type="text"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
					placeholder="Nama Anda"
				/>
			</div>
			
			<div className="space-y-2">
				<label className="text-sm font-medium text-zinc-700">Email</label>
				<input
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
					placeholder="nama@perusahaan.com"
				/>
			</div>

			<div className="space-y-2">
				<label className="text-sm font-medium text-zinc-700">Password</label>
				<input
					type="password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
					placeholder="••••••••"
				/>
			</div>

			<button
				type="submit"
				disabled={isLoading}
				className="w-full bg-zinc-900 text-white py-2.5 rounded-lg hover:bg-zinc-800 transition-colors font-medium flex items-center justify-center"
			>
				{isLoading ? (
					<>
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
						Mendaftar...
					</>
				) : (
					"Daftar Akun"
				)}
			</button>
		</form>
	);
}
