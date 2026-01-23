"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler,
	ScriptableContext,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler,
);

type ChartType = "line" | "bar" | "area";

type Props = {
	title: string;
	labels: string[];
	data: number[];
	color?: string; // Hex color
	height?: number;
	type?: ChartType;
};

export default function DashboardChart({
	title,
	labels,
	data,
	color = "#3b82f6",
	height = 200,
	type = "area",
}: Props) {
	// Convert hex to rgb for background opacity
	const hexToRgb = (hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
					result[3],
					16,
				)}`
			: "59, 130, 246";
	};

	const rgbColor = hexToRgb(color);

	const options: any = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
			title: {
				display: false,
			},
			tooltip: {
				backgroundColor: "rgba(255, 255, 255, 0.95)",
				titleColor: "#111827",
				bodyColor: "#111827",
				borderColor: "rgba(0, 0, 0, 0.05)",
				borderWidth: 1,
				padding: 10,
				displayColors: false,
				callbacks: {
					label: function (context: any) {
						return `${context.parsed.y} kg`;
					},
				},
				shadowOffsetX: 0,
				shadowOffsetY: 4,
				shadowBlur: 10,
				shadowColor: "rgba(0,0,0,0.1)",
			},
		},
		scales: {
			x: {
				grid: {
					display: false,
				},
				ticks: {
					color: "#6b7280",
					font: {
						size: 10,
						family: "var(--font-geist-sans)",
					},
				},
				border: {
					display: false,
				},
			},
			y: {
				grid: {
					color: "#f3f4f6",
					drawBorder: false,
				},
				ticks: {
					color: "#6b7280",
					font: {
						size: 10,
						family: "var(--font-geist-sans)",
					},
					maxTicksLimit: 5,
				},
				border: {
					display: false,
				},
			},
		},
		elements: {
			line: {
				tension: 0.4, // Smooth curve
			},
			point: {
				radius: 0,
				hitRadius: 20,
				hoverRadius: 6,
				hoverBorderWidth: 3,
				hoverBorderColor: "white",
				backgroundColor: color,
			},
			bar: {
				borderRadius: 6,
				borderSkipped: false, // Rounded all corners
			},
		},
	};

	const chartData = {
		labels,
		datasets: [
			{
				label: title,
				data: data,
				borderColor: color,
				backgroundColor:
					type === "bar"
						? color
						: (context: ScriptableContext<"line">) => {
								const ctx = context.chart.ctx;
								const gradient = ctx.createLinearGradient(0, 0, 0, height);
								gradient.addColorStop(0, `rgba(${rgbColor}, 0.25)`);
								gradient.addColorStop(1, `rgba(${rgbColor}, 0)`);
								return gradient;
							},
				borderWidth: type === "bar" ? 0 : 2,
				fill: type === "area",
			},
		],
	};

	return (
		<div className="w-full">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
				<span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
					7 Hari Terakhir
				</span>
			</div>
			<div style={{ height: height }}>
				{type === "bar" ? (
					<Bar options={options} data={chartData} />
				) : (
					<Line options={options} data={chartData} />
				)}
			</div>
		</div>
	);
}
