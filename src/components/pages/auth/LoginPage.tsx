import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="mb-8">
					<Link
						href="/"
						className="inline-flex items-center text-sm text-zinc-500 hover:text-[var(--brand)] transition-colors mb-6"
					>
						<ArrowLeft className="w-4 h-4 mr-1" />
						Kembali ke Beranda
					</Link>
					<div className="text-center">
						<h1 className="text-2xl font-bold text-zinc-900 mb-2">
							Masuk ke Dashboard Admin
						</h1>
						<p className="text-zinc-600 text-sm">
							Gunakan akun admin PT AMP untuk mengakses sistem.
						</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
					<LoginForm />
				</div>

				<p className="text-center mt-6 text-sm text-zinc-500">
					Belum punya akun?{" "}
					<Link
						href="/register"
						className="font-semibold text-[var(--brand)] hover:underline"
					>
						Daftar Sekarang
					</Link>
				</p>
			</div>
		</div>
	);
}
