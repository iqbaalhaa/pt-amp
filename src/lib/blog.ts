import { prisma } from "@/lib/prisma";

export interface BlogPost {
	slug: string;
	title: string;
	date: string; // ISO
	summary: string;
	content: string;
	image?: string | null;
	tags?: string[];
}

export const BLOG_PAGE_SIZE = 9;

export async function listPosts(page: number = 1) {
	const skip = (page - 1) * BLOG_PAGE_SIZE;
	const [posts, total] = await Promise.all([
		prisma.post.findMany({
			where: { published: true },
			orderBy: { createdAt: "desc" },
			skip,
			take: BLOG_PAGE_SIZE,
		}),
		prisma.post.count({ where: { published: true } }),
	]);

	return {
		posts: posts.map((p) => ({
			slug: p.slug,
			title: p.title,
			date: p.createdAt.toISOString(),
			summary: p.content.replace(/<[^>]+>/g, " ").substring(0, 150) + "...",
			content: p.content,
			image: p.image,
			tags: [],
		})),
		total,
		totalPages: Math.ceil(total / BLOG_PAGE_SIZE),
	};
}

export async function getPost(slug: string) {
	const post = await prisma.post.findUnique({
		where: { slug },
	});

	if (!post) return null;

	return {
		slug: post.slug,
		title: post.title,
		date: post.createdAt.toISOString(),
		summary: post.content.replace(/<[^>]+>/g, " ").substring(0, 150) + "...",
		content: post.content,
		image: post.image,
		tags: [],
	};
}

export async function getRelatedPosts(slug: string, limit: number = 3) {
	const posts = await prisma.post.findMany({
		where: {
			published: true,
			slug: { not: slug },
		},
		orderBy: { createdAt: "desc" },
		take: limit,
	});

	return posts.map((p) => ({
		slug: p.slug,
		title: p.title,
		date: p.createdAt.toISOString(),
		summary: p.content.replace(/<[^>]+>/g, " ").substring(0, 150) + "...",
		content: p.content,
		image: p.image,
		tags: [],
	}));
}

export async function latestPosts(limit: number = 3) {
	const posts = await prisma.post.findMany({
		where: { published: true },
		orderBy: { createdAt: "desc" },
		take: limit,
	});

	return posts.map((p) => ({
		slug: p.slug,
		title: p.title,
		date: p.createdAt.toISOString(),
		summary: p.content.replace(/<[^>]+>/g, " ").substring(0, 150) + "...",
		content: p.content,
		image: p.image,
		tags: [],
	}));
}
