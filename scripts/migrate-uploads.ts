import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load environment variables via dotenv first
const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

// Manual fallback to ensure all vars are loaded
async function loadEnvManual() {
  try {
    const content = await fs.readFile(envPath, "utf-8");
    console.log("Content length:", content.length);
    console.log("First 500 chars:", content.substring(0, 500));
    console.log(
      "Last 500 chars:",
      content.substring(Math.max(0, content.length - 500))
    );

    const lines = content.split(/\r?\n/); // Handle CRLF and LF
    console.log("Lines count:", lines.length);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      console.log("Processing:", trimmed);
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    console.error("Failed to manually load .env:", e);
  }
}

async function main() {
  // Ensure all env vars are loaded
  await loadEnvManual();

  console.log("CWD:", process.cwd());
  console.log("Env path:", envPath);
  try {
    const stats = await fs.stat(envPath);
    console.log("Env file size:", stats.size);
  } catch (e) {
    console.log("Env file not found via fs.stat");
  }

  console.log("S3 Config Check:");
  console.log("Endpoint:", process.env.S3_ENDPOINT);
  console.log("Region:", process.env.S3_REGION);
  console.log("Bucket:", process.env.S3_BUCKET_NAME);
  console.log(
    "Access Key ID:",
    process.env.S3_ACCESS_KEY_ID
      ? `${process.env.S3_ACCESS_KEY_ID.substring(0, 4)}...`
      : "MISSING"
  );
  console.log(
    "Secret Key:",
    process.env.S3_SECRET_ACCESS_KEY ? "PRESENT" : "MISSING"
  );

  if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    console.error("CRITICAL: S3 credentials are missing! Aborting migration.");
    process.exit(1);
  }

  // Import prisma dynamically AFTER env vars are loaded
  const { prisma } = await import("../src/lib/prisma");

  const s3Client = new S3Client({
    region: process.env.S3_REGION || "ap-southeast-1",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
  });

  const BUCKET_NAME = process.env.S3_BUCKET_NAME || "ptamp";
  const ROOT_DIR = process.env.S3_ROOT_DIR ? `${process.env.S3_ROOT_DIR}/` : "";
  const ENDPOINT = process.env.S3_ENDPOINT?.replace(/\/$/, "");

  async function uploadFile(filePath: string, fileName: string) {
    const fileContent = await fs.readFile(filePath);
    const key = `${ROOT_DIR}${fileName}`;

    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".xlsx")
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: "public-read",
      })
    );

    // Construct URL
    if (ENDPOINT) {
      return `${ENDPOINT}/${BUCKET_NAME}/${key}`;
    }
    return `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  try {
    // Check if directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      console.log("No uploads directory found. Skipping migration.");
      return;
    }

    const files = await fs.readdir(uploadsDir);
    console.log(`Found ${files.length} files to migrate.`);

    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        console.log(`Uploading ${file}...`);
        try {
          const s3Url = await uploadFile(filePath, file);
          const localPath = `/uploads/${file}`;

          console.log(`Uploaded to ${s3Url}. Updating database references...`);

          // Update database references
          const updatePromises = [
            prisma.user.updateMany({
              where: { image: localPath },
              data: { image: s3Url },
            }),
            prisma.itemType.updateMany({
              where: { image: localPath },
              data: { image: s3Url },
            }),
            prisma.post.updateMany({
              where: { image: localPath },
              data: { image: s3Url },
            }),
            prisma.heroSlide.updateMany({
              where: { src: localPath },
              data: { src: s3Url },
            }),
            prisma.aboutPage.updateMany({
              where: { mainImage: localPath },
              data: { mainImage: s3Url },
            }),
            prisma.galleryAlbum.updateMany({
              where: { coverImage: localPath },
              data: { coverImage: s3Url },
            }),
            prisma.galleryMedia.updateMany({
              where: { src: localPath },
              data: { src: s3Url },
            }),
            prisma.galleryMedia.updateMany({
              where: { thumbnail: localPath },
              data: { thumbnail: s3Url },
            }),
          ];

          await Promise.all(updatePromises);
        } catch (err) {
          console.error(`Failed to upload ${file}:`, err);
        }
      }
    }
    console.log("Migration completed.");
  } catch (err) {
    console.error("Error during migration:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
