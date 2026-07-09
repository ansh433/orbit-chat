import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { requiredEnvironmentValue } from "@/server/shared/environment";

export interface StoreImageInput {
  bytes: Uint8Array;
  contentType: string;
  key: string;
}

let spacesClient: S3Client | undefined;

/** Store image bytes in DigitalOcean Spaces and return their public URL. */
export async function storeImage(input: StoreImageInput): Promise<string> {
  const bucket = requiredEnvironmentValue("DO_SPACES_BUCKET");
  const region = requiredEnvironmentValue("DO_SPACES_REGION");

  await getSpacesClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.bytes,
      ContentType: input.contentType,
      ACL: "public-read",
    }),
  );

  return `https://${bucket}.${region}.digitaloceanspaces.com/${input.key}`;
}

/** Delete an image from DigitalOcean Spaces. */
export async function deleteImage(key: string): Promise<void> {
  await getSpacesClient().send(
    new DeleteObjectCommand({
      Bucket: requiredEnvironmentValue("DO_SPACES_BUCKET"),
      Key: key,
    }),
  );
}

function getSpacesClient(): S3Client {
  if (spacesClient) {
    return spacesClient;
  }

  const region = requiredEnvironmentValue("DO_SPACES_REGION");
  spacesClient = new S3Client({
    endpoint: `https://${region}.digitaloceanspaces.com`,
    region,
    credentials: {
      accessKeyId: requiredEnvironmentValue("DO_SPACES_KEY"),
      secretAccessKey: requiredEnvironmentValue("DO_SPACES_SECRET"),
    },
  });

  return spacesClient;
}
