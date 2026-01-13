import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
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
             <h1 className="text-2xl font-bold text-zinc-900 mb-2">Buat Akun Baru</h1>
             <p className="text-zinc-600">Daftar untuk akses dashboard admin.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <RegisterForm />
        </div>

        <p className="text-center mt-6 text-sm text-zinc-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-[var(--brand)] hover:underline">
            Masuk Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
