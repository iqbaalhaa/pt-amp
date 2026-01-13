"use client";

import { motion } from "framer-motion";
import React from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
}

export default function GlassCard({ className, children }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`glass-card hover-reflect ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

