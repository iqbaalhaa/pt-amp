"use client";

import { useIsClient } from "@/lib/use-is-client";
import PenjemuranClient from "@/components/admin/production/PenjemuranClient";

export default function PenjemuranPageClient() {
  const mounted = useIsClient();

  if (!mounted) {
    return null;
  }

  return <PenjemuranClient />;
}

