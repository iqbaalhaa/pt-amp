import Link from "next/link";
import {
  CONTACT_US,
  PRODUCT_SPEC_COLUMNS,
  type ProductSpecRow,
} from "@/lib/product-specs";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

type Props = {
  rows: ProductSpecRow[];
  title?: string;
  locale?: Locale;
};

export function ProductSpecTable({ rows, title, locale = "id" }: Props) {
  const t = getDictionary(locale).specTable;
  return (
    <div id="spesifikasi" className="mt-12">
      <h3 className="text-2xl font-bold text-zinc-900 mb-2">{title ?? t.title}</h3>
      <p className="text-zinc-600 mb-6">
        {t.noteBefore} &ldquo;{t.contactUs}&rdquo; {t.noteAfter}
      </p>
      {/* Scroll horizontal hanya di dalam tabel (mobile). */}
      <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full min-w-[720px] text-sm text-left">
          <thead className="bg-zinc-100 text-zinc-700">
            <tr>
              {PRODUCT_SPEC_COLUMNS.map((c) => (
                <th key={c.key} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                  {t.columns[c.key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.map((r) => (
              <tr key={r.key}>
                {PRODUCT_SPEC_COLUMNS.map((c, i) =>
                  i === 0 ? (
                    <th key={c.key} scope="row" className="px-4 py-3 font-medium text-zinc-900 whitespace-nowrap">
                      {r[c.key]}
                    </th>
                  ) : r[c.key] === CONTACT_US ? (
                    <td key={c.key} className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={localePath(locale, `/contact?product=${encodeURIComponent(r.grade)}`)}
                        className="text-[var(--brand)] hover:underline"
                      >
                        {t.contactUs}
                      </Link>
                    </td>
                  ) : (
                    <td key={c.key} className="px-4 py-3 text-zinc-700 whitespace-nowrap">
                      {t.values[r[c.key]] ?? r[c.key]}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
