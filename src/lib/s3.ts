import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

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
	const parts: string[] = [];
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
	let contentType = options.contentType || file.type || "application/octet-stream";

	const originalName = file.name || "file.bin";
	let uploadName = originalName;

	const arrayBuffer = await file.arrayBuffer();

	let body: Uint8Array | Buffer;
	if (contentType.startsWith("image/") && contentType !== "image/webp") {
		const input = Buffer.from(arrayBuffer);
		const webpBuffer = await sharp(input).webp({ quality: 80 }).toBuffer();
		body = webpBuffer;
		contentType = "image/webp";

		const dotIndex = originalName.lastIndexOf(".");
		const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
		uploadName = `${baseName}.webp`;
	} else {
		body = new Uint8Array(arrayBuffer);
	}

	const key = buildObjectKey(prefix, uploadName);

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
