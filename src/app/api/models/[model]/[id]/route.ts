import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type ModelIdType = "string" | "bigint";

const modelConfigs: Record<
	string,
	{ idType: ModelIdType; bigIntFields: string[] }
> = {
	user: { idType: "string", bigIntFields: [] },
	session: { idType: "string", bigIntFields: [] },
	account: { idType: "string", bigIntFields: [] },
	verification: { idType: "string", bigIntFields: [] },

	product: { idType: "bigint", bigIntFields: ["id"] },
	worker: { idType: "bigint", bigIntFields: ["id"] },
	productionType: { idType: "bigint", bigIntFields: ["id"] },

	purchase: { idType: "bigint", bigIntFields: ["id"] },
	purchaseItem: { idType: "bigint", bigIntFields: ["id", "purchaseId", "productId"] },
	sale: { idType: "bigint", bigIntFields: ["id"] },
	saleItem: { idType: "bigint", bigIntFields: ["id", "saleId", "productId"] },

	production: { idType: "bigint", bigIntFields: ["id", "productionTypeId"] },
	productionInput: {
		idType: "bigint",
		bigIntFields: ["id", "productionId", "productId"],
	},
	productionOutput: {
		idType: "bigint",
		bigIntFields: ["id", "productionId", "productId"],
	},
	productionWorker: {
		idType: "bigint",
		bigIntFields: ["id", "productionId", "workerId"],
	},

	stockMovement: {
		idType: "bigint",
		bigIntFields: ["id", "productId", "sourceId"],
	},

	inquiry: { idType: "string", bigIntFields: [] },
	post: { idType: "string", bigIntFields: [] },
	contactInfo: { idType: "string", bigIntFields: [] },
	socialMedia: { idType: "string", bigIntFields: [] },
};

function jsonResponse(data: unknown, init?: ResponseInit) {
	const body = JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v));
	return new NextResponse(body, {
		...init,
		headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers ?? {}) },
	});
}

async function requireSuperadmin() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false as const, res: jsonResponse({ error: "Unauthorized" }, { status: 401 }) };
	if (session.user.role !== "SUPERADMIN") {
		return { ok: false as const, res: jsonResponse({ error: "Forbidden" }, { status: 403 }) };
	}
	return { ok: true as const, session };
}

function getModelDelegate(model: string) {
	const config = modelConfigs[model];
	if (!config) return { ok: false as const, res: jsonResponse({ error: "Unknown model" }, { status: 404 }) };
	type ModelDelegate = {
		findUnique: (args: { where: { id: string | bigint } }) => Promise<unknown>;
		update: (args: { where: { id: string | bigint }; data: unknown }) => Promise<unknown>;
		delete: (args: { where: { id: string | bigint } }) => Promise<unknown>;
	};
	const delegate = (prisma as unknown as Record<string, ModelDelegate | undefined>)[model];
	if (!delegate) return { ok: false as const, res: jsonResponse({ error: "Unknown model" }, { status: 404 }) };
	return { ok: true as const, config, delegate };
}

function parseId(model: string, raw: string) {
	const config = modelConfigs[model];
	if (!config) return raw;
	return config.idType === "bigint" ? BigInt(raw) : raw;
}

function normalizeData(model: string, data: unknown) {
	const config = modelConfigs[model];
	if (!config || data === null || typeof data !== "object") return data;
	const next: Record<string, unknown> = { ...(data as Record<string, unknown>) };
	for (const field of config.bigIntFields) {
		if (field in next && next[field] !== null && next[field] !== undefined) {
			const v = next[field];
			if (typeof v === "bigint") continue;
			if (typeof v === "string" || typeof v === "number") {
				next[field] = BigInt(v);
			}
		}
	}
	return next;
}

export async function GET(_req: Request, ctx: { params: Promise<{ model: string; id: string }> }) {
	const authResult = await requireSuperadmin();
	if (!authResult.ok) return authResult.res;

	const { model, id } = await ctx.params;
	const modelResult = getModelDelegate(model);
	if (!modelResult.ok) return modelResult.res;

	const item = await modelResult.delegate.findUnique({
		where: { id: parseId(model, id) },
	});
	if (!item) return jsonResponse({ error: "Not found" }, { status: 404 });
	return jsonResponse(item);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ model: string; id: string }> }) {
	const authResult = await requireSuperadmin();
	if (!authResult.ok) return authResult.res;

	const { model, id } = await ctx.params;
	const modelResult = getModelDelegate(model);
	if (!modelResult.ok) return modelResult.res;

	const body = await req.json();
	const data = normalizeData(model, body);
	const updated = await modelResult.delegate.update({
		where: { id: parseId(model, id) },
		data,
	});
	return jsonResponse(updated);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ model: string; id: string }> }) {
	const authResult = await requireSuperadmin();
	if (!authResult.ok) return authResult.res;

	const { model, id } = await ctx.params;
	const modelResult = getModelDelegate(model);
	if (!modelResult.ok) return modelResult.res;

	const deleted = await modelResult.delegate.delete({
		where: { id: parseId(model, id) },
	});
	return jsonResponse(deleted);
}
