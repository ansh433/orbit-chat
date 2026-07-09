import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import {
  InvalidImageUploadError,
  uploadChatImages,
} from "./upload-images.service";

/** Translate a multipart HTTP request into the upload-images use case. */
export async function uploadImagesController(
  request: NextRequest,
): Promise<NextResponse> {
  const { userId } = await getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);
    const uploadedImages = await uploadChatImages(userId, files);

    return NextResponse.json({ files: uploadedImages });
  } catch (error) {
    if (error instanceof InvalidImageUploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Image upload failed", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
