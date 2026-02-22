"use client";

import { useEffect, useState } from "react";
import QcPotongSortirClient from "@/components/admin/production/QcPotongSortirClient";

export default function QcPotongSortirPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <QcPotongSortirClient />;
}

