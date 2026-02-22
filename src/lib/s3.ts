import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET_NAME;
const rootDir = process.env.S3_ROOT_DIR || "";

if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucket) {
	throw new Error("Missing S3 configuration in environment variables");
}

export const s3Client = new S3Client({
	region,
	endpoint,
	credentials: {
		accessKeyId,
		secretAccessKey,
	},
	forcePathStyle: true,
});

function buildObjectKey(prefix: string, filename: string) {
	const safePrefix = prefix.replace(/^\/+|\/+$/g, "");
	const safeRoot = rootDir.replace(/^\/+|\/+$/g, "");
	const timestamp = Date.now();
	const random = Math.random().toString(36).slice(2, 10);
	const name = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
	const parts = [];
	if (safeRoot) parts.push(safeRoot);
	if (safePrefix) parts.push(safePrefix);
	parts.push(`${timestamp}-${random}-${name}`);
	return parts.join("/");
}

export async function uploadToS3(options: {
	prefix: string;
	file: File;
	contentType?: string;
}): Promise<string> {
	const { prefix, file } = options;
	const contentType = options.contentType || file.type || "application/octet-stream";

	const key = buildObjectKey(prefix, file.name || "file.bin");
	const arrayBuffer = await file.arrayBuffer();
	const body = new Uint8Array(arrayBuffer);

	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: contentType,
			ACL: "public-read",
		}),
	);

	const endpointUrl = new URL(endpoint);
	const host = endpointUrl.host;
	const protocol = endpointUrl.protocol || "https:";

	return `${protocol}//${host}/${bucket}/${key}`;
}

