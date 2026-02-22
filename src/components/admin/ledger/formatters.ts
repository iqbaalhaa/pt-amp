export function toCurrency(num: number | null | undefined) {
  if (num == null || !Number.isFinite(num)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("id-ID");
}

