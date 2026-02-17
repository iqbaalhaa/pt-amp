"use client";

import { useEffect, useState } from "react";
import PemotonganClient from "@/components/admin/production/PemotonganClient";

export default function PemotonganPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <PemotonganClient />;
}

