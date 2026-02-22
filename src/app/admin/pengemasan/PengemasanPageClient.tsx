"use client";

import { useEffect, useState } from "react";
import PengemasanClient from "@/components/admin/production/PengemasanClient";

export default function PengemasanPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <PengemasanClient />;
}

