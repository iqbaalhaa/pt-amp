"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { LedgerFilters } from "./LedgerFilters";

const LedgerFiltersDynamic = dynamic(
  () =>
    import("./LedgerFilters").then(
      (m) => m.LedgerFilters,
    ),
  { ssr: false },
);

export default function LedgerFiltersClient(
  props: ComponentProps<typeof LedgerFilters>,
) {
  return <LedgerFiltersDynamic {...props} />;
}
