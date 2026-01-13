"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  message: string;
  type?: "success" | "warning" | "danger" | "info";
  open: boolean;
  onClose?: () => void;
  duration?: number;
}

export default function Toast({ message, type = "info", open, onClose, duration = 3000 }: Props) {
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    setVisible(open);
    if (open && duration > 0) {
      const t = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(t);
    }
  }, [open, duration, onClose]);
  const color =
    type === "success" ? "bg-[rgba(34,197,94,0.12)] text-[var(--success)] border-[rgba(34,197,94,0.24)]" :
    type === "warning" ? "bg-[rgba(245,158,11,0.12)] text-[var(--warning)] border-[rgba(245,158,11,0.24)]" :
    type === "danger" ? "bg-[rgba(239,68,68,0.12)] text-[var(--danger)] border-[rgba(239,68,68,0.24)]" :
    "bg-[rgba(56,189,248,0.12)] text-[var(--info)] border-[rgba(56,189,248,0.24)]";
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[200]"
        >
          <div className={`glass border ${color} rounded-xl px-4 py-2 shadow-soft`}>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

