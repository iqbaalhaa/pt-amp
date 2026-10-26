"use client";

import { useIsClient } from "@/lib/use-is-client";
import PengemasanClient from "@/components/admin/production/PengemasanClient";

export default function PengemasanPageClient() {
  const mounted = useIsClient();

  if (!mounted) {
    return null;
  }

  return <PengemasanClient />;
}

