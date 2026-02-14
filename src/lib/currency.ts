export function formatRupiah(value: unknown, fractionDigits: number = 0) {
  let num = 0;
  if (typeof value === "number") {
    num = isFinite(value) ? value : 0;
  } else if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
    num = isFinite(parsed) ? parsed : 0;
  } else if (value && typeof (value as { toString: () => string }).toString === "function") {
    const parsed = parseFloat((value as { toString: () => string }).toString());
    num = isFinite(parsed) ? parsed : 0;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}
