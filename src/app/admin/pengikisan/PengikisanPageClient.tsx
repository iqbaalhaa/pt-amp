"use client";

import { useIsClient } from "@/lib/use-is-client";
import PengikisanClient from "@/components/admin/production/PengikisanClient";

export default function PengikisanPageClient() {
  const mounted = useIsClient();

  if (!mounted) {
    return null;
  }

  return <PengikisanClient />;
}

