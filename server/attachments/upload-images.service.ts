import { deleteImage, storeImage } from "@/server/infrastructure/image-storage";

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export class InvalidImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidImageUploadError";
  }
}

export interface UploadedImage {
  name: string;
  size: number;
  type: string;
  url: string;
  key: string;
}

/** Validate and store a batch of user-supplied chat images. */
export async function uploadChatImages(
  userId: string,
  files: File[],
): Promise<UploadedImage[]> {
  validateImageBatch(files);

  const uploadedImages: UploadedImage[] = [];
  try {
    for (const file of files) {
      uploadedImages.push(await uploadImage(userId, file));
    }
    return uploadedImages;
  } catch (error) {
    await Promise.allSettled(
      uploadedImages.map((image) => deleteImage(image.key)),
    );
    throw error;
  }
}

function validateImageBatch(files: File[]): void {
  if (files.length === 0) {
    throw new InvalidImageUploadError("No files provided.");
  }

  if (files.length > MAX_FILES) {
    throw new InvalidImageUploadError(
      `You can upload at most ${MAX_FILES} images at once.`,
    );
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new InvalidImageUploadError(`${file.name} is not an image.`);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new InvalidImageUploadError(
        `${file.name} is larger than the 20 MB limit.`,
      );
    }
  }
}

async function uploadImage(userId: string, file: File): Promise<UploadedImage> {
  const key = `uploads/${userId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const url = await storeImage({ bytes, contentType: file.type, key });

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    url,
    key,
  };
}

function safeFileName(fileName: string): string {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "image";
}
