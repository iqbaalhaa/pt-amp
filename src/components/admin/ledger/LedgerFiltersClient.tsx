"use client";

import dynamic from "next/dynamic";

const LedgerFiltersDynamic = dynamic(
  () =>
    import("./LedgerFilters").then(
      (m) => m.LedgerFilters,
    ),
  { ssr: false },
);

export default function LedgerFiltersClient(props: any) {
  return <LedgerFiltersDynamic {...props} />;
}
