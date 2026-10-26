"use client";

import { useIsClient } from "@/lib/use-is-client";
import PemotonganClient from "@/components/admin/production/PemotonganClient";

export default function PemotonganPageClient() {
  const mounted = useIsClient();

  if (!mounted) {
    return null;
  }

  return <PemotonganClient />;
}

