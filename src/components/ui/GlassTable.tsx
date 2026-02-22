"use client";

import React from "react";

export type Column<T> = {
	header: string;
	accessorKey?: keyof T;
	cell?: (row: T, index: number) => React.ReactNode;
	className?: string;
};

type Props<T> = {
	columns: Column<T>[];
	data: T[];
	keyField?: keyof T;
	actions?: (row: T, index: number) => React.ReactNode;
	showNumber?: boolean;
	startIndex?: number;
	className?: string;
	onRowClick?: (row: T) => void;
};

export default function GlassTable<T extends Record<string, any>>({
	columns,
	data,
	keyField = "id",
	actions,
	showNumber = true,
	startIndex = 0,
	className,
	onRowClick,
}: Props<T>) {
	return (
		<div
			className={`glass-card overflow-hidden w-full border border-[var(--glass-border)] rounded-xl shadow-sm ${
				className ?? ""
			}`}
		>
			<div className="overflow-x-auto">
				<table className="w-full text-base text-left border-collapse">
					<thead className="text-sm uppercase tracking-wider text-black bg-[rgba(0,0,0,0.02)] border-b border-[var(--glass-border)]">
						<tr>
							{showNumber && (
								<th className="px-4 py-5 font-bold w-16 text-center text-black">
									#
								</th>
							)}
							{columns.map((col, idx) => (
								<th
									key={idx}
									className={`px-4 py-5 font-bold text-black ${
										col.className ?? ""
									}`}
								>
									{col.header}
								</th>
							))}
							{actions && (
								<th className="px-4 py-5 text-right font-bold text-black w-28">
									Actions
								</th>
							)}
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--glass-border)]">
						{data.length === 0 ? (
							<tr>
								<td
									colSpan={
										columns.length + (actions ? 1 : 0) + (showNumber ? 1 : 0)
									}
									className="px-6 py-12 text-center text-[var(--text-secondary)] italic"
								>
									No data available
								</td>
							</tr>
						) : (
							data.map((row, rowIdx) => (
								<tr
									key={
										row[keyField] != null
											? String(row[keyField])
											: `row-${rowIdx}`
									}
									onClick={() => onRowClick?.(row)}
									className={`transition-all duration-200 group ${
										onRowClick ? "cursor-pointer hover:bg-[rgba(213,14,12,0.02)]" : "hover:bg-[rgba(0,0,0,0.01)]"
									}`}
								>
									{showNumber && (
										<td className="px-4 py-5 text-center text-[var(--text-secondary)] font-semibold">
											{startIndex + rowIdx + 1}
										</td>
									)}
									{columns.map((col, colIdx) => (
										<td
											key={colIdx}
											className={`px-4 py-5 text-[var(--foreground)] ${
												col.className ?? ""
											}`}
										>
											{col.cell ? col.cell(row, rowIdx) : (row[col.accessorKey!] as React.ReactNode)}
										</td>
									))}
									{actions && (
										<td className="px-4 py-5 text-right">
											{actions(row, rowIdx)}
										</td>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
