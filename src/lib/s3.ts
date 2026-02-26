import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 10MB max file size
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const s3Client = new S3Client({
  region: process.env.S3_REGION || "ap-southeast-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Needed for some S3 compatible providers like IDCloudHost if not using virtual-hosted style
});

export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = process.env.S3_BUCKET_NAME || "ptamp";
  const rootDir = process.env.S3_ROOT_DIR ? `${process.env.S3_ROOT_DIR}/` : "";
  const key = `${rootDir}${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: "public-read", // Assuming files should be publicly readable
  });

  await s3Client.send(command);

  // Construct the public URL
  const endpoint = process.env.S3_ENDPOINT?.replace(/\/$/, "");
  // For path style access (which IDCloudHost supports and we're using forcePathStyle=true)
  return `${endpoint}/${bucketName}/${key}`;
}

export { s3Client };
