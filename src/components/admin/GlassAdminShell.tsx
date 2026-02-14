"use client";

import { useEffect, useState } from "react";
import GlassSidebar from "@/components/admin/glass/GlassSidebar";

export default function GlassAdminShell({
  children,
  allowedPaths,
}: {
  children: React.ReactNode;
  allowedPaths?: string[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setCollapsed(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : collapsed ? 76 : 260;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-primary">
      <GlassSidebar
        collapsed={collapsed}
        isMobile={isMobile}
        onToggle={() => setCollapsed((v) => !v)}
        allowedPaths={allowedPaths}
      />
      <main
        className="transition-[margin] duration-200 ease-out p-4 md:p-6"
        style={{ marginLeft: isMobile ? 0 : sidebarWidth }}
      >
        {children}
      </main>
    </div>
  );
}
