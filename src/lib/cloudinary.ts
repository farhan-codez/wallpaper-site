import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "wallpapers"
): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          url: result.secure_url,
          width: result.width,
          height: result.height,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {}
}

export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/");
  const uploadIdx = parts.indexOf("upload");
  if (uploadIdx === -1) return "";
  const withVersion = parts[uploadIdx + 1];
  if (withVersion.startsWith("v")) {
    return parts.slice(uploadIdx + 2).join("/").replace(/\.[^.]+$/, "");
  }
  return parts.slice(uploadIdx + 1).join("/").replace(/\.[^.]+$/, "");
}
