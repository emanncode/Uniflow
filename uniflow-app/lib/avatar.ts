import { File } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "@/lib/supabase";

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_BUCKET = "avatars";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function withCacheBust(url: string): string {
  const base = url.split("?")[0];
  return `${base}?t=${Date.now()}`;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Read a local image URI into an ArrayBuffer (RN-safe; avoids Blob upload issues). */
export async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  try {
    const file = new File(uri);
    return await file.arrayBuffer();
  } catch {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64ToArrayBuffer(base64);
  }
}

export async function getImageByteSize(uri: string): Promise<number> {
  const buffer = await uriToArrayBuffer(uri);
  return buffer.byteLength;
}

function formatUploadError(error: { message?: string; error?: string }): string {
  const msg = `${error.message ?? ""} ${error.error ?? ""}`.toLowerCase();

  if (msg.includes("bucket not found")) {
    return "Avatar storage is not configured. Ask your admin to create the 'avatars' bucket in Supabase.";
  }
  if (msg.includes("row-level security") || msg.includes("policy")) {
    return "You don't have permission to upload avatars. Check Supabase storage policies.";
  }
  if (msg.includes("network request failed")) {
    return "Upload failed — check your internet connection and that the 'avatars' storage bucket exists.";
  }

  return error.message ?? "Failed to upload profile photo.";
}

export async function uploadAvatar(
  userId: string,
  uri: string,
  mimeType?: string | null,
): Promise<string> {
  const arrayBuffer = await uriToArrayBuffer(uri);

  if (arrayBuffer.byteLength > MAX_AVATAR_BYTES) {
    throw new Error("Image must be no more than 2MB");
  }

  const contentType = mimeType ?? "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const filePath = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(formatUploadError(uploadError));
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  return withCacheBust(data.publicUrl);
}