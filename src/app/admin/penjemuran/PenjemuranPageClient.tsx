"use client";

import { useEffect, useState } from "react";
import PenjemuranClient from "@/components/admin/production/PenjemuranClient";

export default function PenjemuranPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <PenjemuranClient />;
}

