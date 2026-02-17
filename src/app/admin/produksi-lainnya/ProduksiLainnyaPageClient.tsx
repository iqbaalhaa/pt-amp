"use client";

import { useEffect, useState } from "react";
import OtherProductionClient from "@/components/admin/production/OtherProductionClient";

export default function ProduksiLainnyaPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <OtherProductionClient />;
}

