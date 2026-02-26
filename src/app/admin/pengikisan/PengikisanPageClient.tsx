"use client";

import { useEffect, useState } from "react";
import PengikisanClient from "@/components/admin/production/PengikisanClient";

export default function PengikisanPageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <PengikisanClient />;
}

