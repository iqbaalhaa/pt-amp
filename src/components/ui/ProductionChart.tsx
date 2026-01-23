"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DataPoint = {
	label: string;
	value: number;
};

type Props = {
	data: DataPoint[];
	height?: number;
	className?: string;
	color?: string;
};

// Helper to calculate control points for smooth Bezier curves
const getControlPoint = (
	current: number[],
	previous: number[],
	next: number[],
	reverse?: boolean,
) => {
	const p = previous || current;
	const n = next || current;
	const smoothing = 0.2;
	const o = line(p, n);
	const angle = o.angle + (reverse ? Math.PI : 0);
	const length = o.length * smoothing;
	const x = current[0] + Math.cos(angle) * length;
	const y = current[1] + Math.sin(angle) * length;
	return [x, y];
};

const line = (pointA: number[], pointB: number[]) => {
	const lengthX = pointB[0] - pointA[0];
	const lengthY = pointB[1] - pointA[1];
	return {
		length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
		angle: Math.atan2(lengthY, lengthX),
	};
};

const svgPath = (
	points: number[][],
	command: (point: number[], i: number, a: number[][]) => string,
) => {
	const d = points.reduce(
		(acc, point, i, a) =>
			i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a)}`,
		"",
	);
	return d;
};

const bezierCommand = (point: number[], i: number, a: number[][]) => {
	const [cpsX, cpsY] = getControlPoint(a[i - 1], a[i - 2], point);
	const [cpeX, cpeY] = getControlPoint(point, a[i - 1], a[i + 1], true);
	return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};

export default function ProductionChart({
	data,
	height = 240,
	className,
	color = "#0ea5e9", // Sky-500 to match 'info' status
}: Props) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	// Determine max value for scaling (add buffer for visual comfort)
	const maxValue = Math.max(...data.map((d) => d.value)) * 1.1;

	// Calculate points coordinates (0-100 scale for SVG path)
	const points = data.map((d, i) => {
		const x = (i / (data.length - 1)) * 100;
		const y = 100 - (d.value / maxValue) * 100;
		return [x, y];
	});

	// Generate Smooth Path
	const pathD = svgPath(points, bezierCommand);
	const areaPathD = `${pathD} L 100,100 L 0,100 Z`;

	return (
		<div className={`w-full relative ${className ?? ""}`} style={{ height }}>
			{/* Hover Info Tooltip */}
			<AnimatePresence>
				{hoveredIndex !== null && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 5, scale: 0.95 }}
						className="absolute pointer-events-none z-20"
						style={{
							left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
							top: `${100 - (data[hoveredIndex].value / maxValue) * 100}%`,
							transform: "translate(-50%, -100%)",
							marginTop: "-16px",
						}}
					>
						<div className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl p-3 min-w-[120px] text-center">
							<div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
								{data[hoveredIndex].label}
							</div>
							<div className="flex items-center justify-center gap-1.5">
								<div
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: color }}
								/>
								<span className="text-xl font-bold text-gray-900">
									{data[hoveredIndex].value}
									<span className="text-xs font-normal text-gray-500 ml-1">
										kg
									</span>
								</span>
							</div>
						</div>
						{/* Arrow */}
						<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
							<div className="border-8 border-transparent border-t-white/95 drop-shadow-sm" />
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Chart SVG Layer (Background & Lines) */}
			<svg
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				className="w-full h-full overflow-visible"
			>
				<defs>
					<linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor={color} stopOpacity="0.2" />
						<stop offset="100%" stopColor={color} stopOpacity="0" />
					</linearGradient>
				</defs>

				{/* Grid Lines (Horizontal only) */}
				{[0, 25, 50, 75, 100].map((y) => (
					<line
						key={y}
						x1="0"
						y1={y}
						x2="100"
						y2={y}
						stroke="#f3f4f6"
						strokeWidth="0.5"
					/>
				))}

				{/* Area Fill */}
				<motion.path
					d={areaPathD}
					fill="url(#chartGradient)"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8 }}
				/>

				{/* Line Path */}
				<motion.path
					d={pathD}
					fill="none"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					vectorEffect="non-scaling-stroke"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1.2, ease: "easeOut" }}
					style={{
						filter: `drop-shadow(0 4px 6px ${color}40)`,
					}}
				/>
			</svg>

			{/* Interactive Points Layer (HTML to avoid distortion) */}
			<div className="absolute inset-0">
				{points.map((point, i) => (
					<div
						key={i}
						className="absolute group"
						style={{
							left: `${point[0]}%`,
							top: `${point[1]}%`,
							transform: "translate(-50%, -50%)",
						}}
					>
						{/* Invisible large hit area */}
						<div
							className="w-8 h-8 cursor-pointer rounded-full -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
							onMouseEnter={() => setHoveredIndex(i)}
							onMouseLeave={() => setHoveredIndex(null)}
						/>

						{/* Visible Dot */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{
								scale: hoveredIndex === i ? 1.5 : 1,
								backgroundColor: hoveredIndex === i ? color : "white",
								borderColor: color,
								borderWidth: hoveredIndex === i ? 0 : 2,
							}}
							transition={{ duration: 0.2 }}
							className="w-3 h-3 rounded-full shadow-sm pointer-events-none relative z-10"
							style={{ borderColor: color }}
						/>

						{/* Ring effect on hover */}
						{hoveredIndex === i && (
							<motion.div
								layoutId="outline"
								initial={{ opacity: 0.5, scale: 1 }}
								animate={{ opacity: 0, scale: 2.5 }}
								transition={{ duration: 0.6, repeat: Infinity }}
								className="absolute top-0 left-0 w-3 h-3 rounded-full -z-0"
								style={{ backgroundColor: color }}
							/>
						)}
					</div>
				))}
			</div>

			{/* X-Axis Labels */}
			<div className="flex justify-between mt-2 px-0">
				{data.map((d, i) => (
					<div
						key={i}
						className="flex flex-col items-center"
						style={{ width: `${100 / data.length}%` }}
					>
						<div
							className={`text-xs transition-all duration-200 ${
								hoveredIndex === i
									? "text-gray-900 font-bold transform -translate-y-1"
									: "text-gray-400 font-medium"
							}`}
						>
							{d.label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
