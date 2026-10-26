"use client";

import { useIsClient } from "@/lib/use-is-client";
import QcPotongSortirClient from "@/components/admin/production/QcPotongSortirClient";

export default function QcPotongSortirPageClient() {
  const mounted = useIsClient();

  if (!mounted) {
    return null;
  }

  return <QcPotongSortirClient />;
}

