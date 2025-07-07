import { S3Client } from "@aws-sdk/client-s3"

// Server-side S3 client (uses AWS credentials from environment)
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// Client-side configuration (for direct uploads)
export const clientS3Config = {
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  bucketName: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
}
