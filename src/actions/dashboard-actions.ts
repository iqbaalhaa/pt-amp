"use server";

import { prisma } from "@/lib/prisma";
import {
	startOfMonth,
	endOfMonth,
	subDays,
	format,
	startOfDay,
	endOfDay,
} from "date-fns";
import { id } from "date-fns/locale";

export async function getDashboardData() {
	const today = new Date();
	const startMonth = startOfMonth(today);
	const endMonth = endOfMonth(today);

	// 1. KPI Data

	// Purchasing (This Month) - Sum of Qty
	const purchasing = await prisma.purchase.findMany({
		where: {
			date: { gte: startMonth, lte: endMonth },
			status: "posted",
		},
		include: { purchaseItems: true },
	});
	const totalPurchasing = purchasing.reduce((sum, p) => {
		return sum + p.purchaseItems.reduce((s, i) => s + Number(i.qty), 0);
	}, 0);

	// Scraping (This Month) - Sum of Output Qty (stik + ka)
	const scraping = await prisma.pengikisan.findMany({
		where: { date: { gte: startMonth, lte: endMonth } },
		include: { pengikisanItems: true },
	});
	const totalScraping = scraping.reduce((sum, p) => {
		return (
			sum +
			p.pengikisanItems.reduce(
				(s, i) => s + Number(i.stikKg) + Number(i.kaKg),
				0,
			)
		);
	}, 0);

	// Cutting (This Month) - Sum of Output Qty
	const cutting = await prisma.pemotongan.findMany({
		where: { date: { gte: startMonth, lte: endMonth } },
		include: { pemotonganItems: true },
	});
	const totalCutting = cutting.reduce((sum, p) => {
		return sum + p.pemotonganItems.reduce((s, i) => s + Number(i.qty), 0);
	}, 0);

	// Drying (This Month) - Sum of Cost (Total Upah)
	const drying = await prisma.penjemuran.aggregate({
		_sum: { totalUpah: true },
		where: { date: { gte: startMonth, lte: endMonth } },
	});
	const totalDrying = Number(drying._sum.totalUpah || 0);

	// Total Pendapatan (This Month) - Sum of SaleItem (qty * price)
	// Since Prisma aggregate doesn't support multiplication, we might need to fetch items or use raw query.
	// Using findMany and reducing is safer for now unless data is huge.
	const salesThisMonth = await prisma.sale.findMany({
		where: {
			date: {
				gte: startMonth,
				lte: endMonth,
			},
			status: "posted",
		},
		include: {
			saleItems: true,
		},
	});

	const totalRevenue = salesThisMonth.reduce((sum, sale) => {
		const saleTotal = sale.saleItems.reduce((itemSum, item) => {
			return itemSum + Number(item.qty) * Number(item.unitPrice);
		}, 0);
		return sum + saleTotal;
	}, 0);

	// 2. Charts Data (Last 7 Days)
	const labels: string[] = [];
	for (let i = 6; i >= 0; i--) {
		labels.push(format(subDays(today, i), "dd MMM", { locale: id }));
	}

	const startDate = startOfDay(subDays(today, 6));
	const endDate = endOfDay(today);

	// Helper to init array with 0s
	const initData = () => new Array(7).fill(0);

	// Purchasing Chart (Daily Qty)
	const purchases = await prisma.purchase.findMany({
		where: {
			date: { gte: startDate, lte: endDate },
			status: { not: "cancelled" },
		},
		include: { purchaseItems: true },
	});
	const purchasingData = initData();
	purchases.forEach((p) => {
		const dayIndex =
			6 -
			Math.floor(
				(today.getTime() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24),
			);
		if (dayIndex >= 0 && dayIndex < 7) {
			const dailySum = p.purchaseItems.reduce(
				(sum, item) => sum + Number(item.qty),
				0,
			);
			purchasingData[dayIndex] += dailySum;
		}
	});

	// Scraping (Pengikisan) Chart (Daily Output - stikKg + kaKg)
	const pengikisans = await prisma.pengikisan.findMany({
		where: { date: { gte: startDate, lte: endDate } },
		include: { pengikisanItems: true },
	});
	const scrapingData = initData();
	pengikisans.forEach((p) => {
		const dayIndex =
			6 -
			Math.floor(
				(today.getTime() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24),
			);
		if (dayIndex >= 0 && dayIndex < 7) {
			const dailySum = p.pengikisanItems.reduce(
				(sum, item) => sum + Number(item.stikKg) + Number(item.kaKg),
				0,
			);
			scrapingData[dayIndex] += dailySum;
		}
	});

	// Cutting (Pemotongan) Chart (Daily Output Qty)
	const pemotongans = await prisma.pemotongan.findMany({
		where: { date: { gte: startDate, lte: endDate } },
		include: { pemotonganItems: true },
	});
	const cuttingData = initData();
	pemotongans.forEach((p) => {
		const dayIndex =
			6 -
			Math.floor(
				(today.getTime() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24),
			);
		if (dayIndex >= 0 && dayIndex < 7) {
			const dailySum = p.pemotonganItems.reduce(
				(sum, item) => sum + Number(item.qty),
				0,
			);
			cuttingData[dayIndex] += dailySum;
		}
	});

	// Drying (Penjemuran) Chart (Daily Cost - Total Upah)
	const penjemurans = await prisma.penjemuran.findMany({
		where: { date: { gte: startDate, lte: endDate } },
	});
	const dryingData = initData();
	penjemurans.forEach((p) => {
		const dayIndex =
			6 -
			Math.floor(
				(today.getTime() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24),
			);
		if (dayIndex >= 0 && dayIndex < 7) {
			dryingData[dayIndex] += Number(p.totalUpah || 0);
		}
	});

	// Sales Chart (Daily Revenue)
	const sales = await prisma.sale.findMany({
		where: { date: { gte: startDate, lte: endDate }, status: "posted" },
		include: { saleItems: true },
	});
	const salesData = initData();
	sales.forEach((s) => {
		const dayIndex =
			6 -
			Math.floor(
				(today.getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24),
			);
		if (dayIndex >= 0 && dayIndex < 7) {
			const dailyRev = s.saleItems.reduce(
				(sum, item) => sum + Number(item.qty) * Number(item.unitPrice),
				0,
			);
			salesData[dayIndex] += dailyRev;
		}
	});

	// Recent Productions for Table
	const recentProductions = await prisma.production.findMany({
		take: 5,
		orderBy: { date: "desc" },
		include: {
			productionType: true,
			productionOutputs: {
				include: { product: true },
			},
			productionInputs: {
				include: { product: true },
			},
		},
	});

	const formattedProductions = recentProductions.map((p) => {
		// Determine status badge
		let status: "success" | "warning" | "danger" | "info" | "neutral" =
			"neutral";
		if (p.status === "completed") status = "success";
		else if (p.status === "draft") status = "warning";
		else if (p.status === "cancelled") status = "danger";

		// Format Input/Output string
		const inputStr =
			p.productionInputs
				.map((i) => `${Number(i.qty)} ${i.product.unit} ${i.product.name}`)
				.join(", ") || "-";
		const outputStr =
			p.productionOutputs
				.map((o) => `${Number(o.qty)} ${o.product.unit} ${o.product.name}`)
				.join(", ") || "-";

		return {
			id: p.id.toString(),
			type: p.productionType.name,
			date: format(p.date, "yyyy-MM-dd"),
			input: inputStr,
			output: outputStr,
			status: status,
		};
	});

	return {
		kpi: {
			totalPurchasing,
			totalScraping,
			totalCutting,
			totalDrying,
			totalRevenue,
		},
		charts: {
			labels,
			purchasing: purchasingData,
			scraping: scrapingData,
			cutting: cuttingData,
			drying: dryingData,
			sales: salesData,
		},
		recentProductions: formattedProductions,
	};
}
