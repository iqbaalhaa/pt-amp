"use client";

import { useEffect, useState } from "react";
import PensortiranClient from "@/components/admin/production/PensortiranClient";

export default function PensortiranPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <PensortiranClient />;
}

