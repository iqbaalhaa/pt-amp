"use client";

import { useIsClient } from "@/lib/use-is-client";
import PensortiranClient from "@/components/admin/production/PensortiranClient";

export default function PensortiranPageClient() {
  const mounted = useIsClient();

  if (!mounted) {
    return null;
  }

  return <PensortiranClient />;
}

