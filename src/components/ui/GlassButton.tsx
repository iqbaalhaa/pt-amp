"use client";

import React from "react";
import { motion } from "framer-motion";

type Variant = "primary" | "ghost" | "danger" | "success" | "warning";
type Size = "sm" | "md" | "lg" | "icon";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: Size;
};

export default function GlassButton({
	variant = "primary",
	size = "md",
	className,
	children,
	...rest
}: Props) {
	const base =
		"inline-flex items-center justify-center font-medium transition-all focus-ring-brand";

	const sizes = {
		sm: "px-3 py-1.5 text-xs rounded-lg",
		md: "px-4 py-2 text-sm rounded-xl",
		lg: "px-6 py-3 text-base rounded-2xl",
		icon: "w-9 h-9 p-0 rounded-xl", // Square for icons
	};

	const styles = {
		primary:
			"text-white bg-[var(--brand)] hover:bg-[#b90c0a] active:scale-95 shadow-[0_4px_12px_rgba(213,14,12,0.3)]",
		ghost:
			"text-[var(--foreground)] glass hover:bg-[rgba(255,255,255,0.1)] active:scale-95",
		danger:
			"text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-[0_4px_12px_rgba(220,38,38,0.3)]",
		success:
			"text-white bg-green-600 hover:bg-green-700 active:scale-95 shadow-[0_4px_12px_rgba(22,163,74,0.3)]",
		warning:
			"text-white bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-[0_4px_12px_rgba(245,158,11,0.3)]",
	};

	return (
		<motion.button
			whileHover={{ scale: size === "icon" ? 1.1 : 1.02 }}
			whileTap={{ scale: 0.95 }}
			className={`${base} ${sizes[size]} ${styles[variant]} ${className ?? ""}`}
			{...rest}
		>
			{children}
		</motion.button>
	);
}
