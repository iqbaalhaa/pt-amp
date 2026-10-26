"use client";

import { useIsClient } from "@/lib/use-is-client";
import OtherProductionClient from "@/components/admin/production/OtherProductionClient";

export default function ProduksiLainnyaPageClient() {
  const mounted = useIsClient();

  if (!mounted) {
    return null;
  }

  return <OtherProductionClient />;
}

