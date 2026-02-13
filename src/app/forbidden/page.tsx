export const metadata = {
  title: "Forbidden | PT AMP Dashboard",
  description: "Anda tidak memiliki akses ke halaman ini.",
};

export default function ForbiddenPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="glass-card p-8 rounded-xl border border-[var(--glass-border)]">
        <h1 className="text-2xl font-bold text-zinc-900">Akses Ditolak</h1>
        <p className="text-zinc-600 mt-2">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <div className="mt-5">
          <a
            href="/admin/sales"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand)] text-white hover:opacity-90 transition"
          >
            Ke Penjualan
          </a>
        </div>
      </div>
    </main>
  );
}
