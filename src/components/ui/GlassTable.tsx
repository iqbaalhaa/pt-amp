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
};

export default function GlassTable<T extends Record<string, any>>({
	columns,
	data,
	keyField = "id",
	actions,
	showNumber = true,
}: Props<T>) {
	return (
		<div className="glass-card overflow-hidden w-full border border-[var(--glass-border)] rounded-xl shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full text-sm text-left">
					<thead className="text-xs uppercase tracking-wider text-black bg-[rgba(255,255,255,0.08)] border-b border-[var(--glass-border)]">
						<tr>
							{showNumber && (
								<th className="px-4 py-4 font-bold w-12 text-center text-black">
									#
								</th>
							)}
							{columns.map((col, idx) => (
								<th
									key={idx}
									className={`px-4 py-4 font-bold text-black ${
										col.className ?? ""
									}`}
								>
									{col.header}
								</th>
							))}
							{actions && (
								<th className="px-4 py-4 text-right font-bold text-black">
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
									className="px-4 py-12 text-center text-[var(--text-secondary)] italic"
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
									className="hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200 group"
								>
									{showNumber && (
										<td className="px-4 py-3 text-center text-[var(--text-secondary)] font-medium">
											{rowIdx + 1}
										</td>
									)}
									{columns.map((col, colIdx) => (
										<td
											key={colIdx}
											className={`px-4 py-3 text-[var(--foreground)] ${
												col.className ?? ""
											}`}
										>
											{col.cell
												? col.cell(row, rowIdx)
												: col.accessorKey
												? String(row[col.accessorKey])
												: null}
										</td>
									))}
									{actions && (
										<td className="px-4 py-3 text-right">
											<div className="flex items-center justify-end gap-2">
												{actions(row, rowIdx)}
											</div>
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
