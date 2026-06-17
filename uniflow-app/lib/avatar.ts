import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "@/lib/supabase";

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_BUCKET = "avatars";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

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

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Read a picked image into bytes — FileSystem is most reliable for local URIs on mobile. */
export async function uriToUint8Array(uri: string): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64ToUint8Array(base64);
}

export async function getImageByteSize(uri: string): Promise<number> {
  const bytes = await uriToUint8Array(uri);
  return bytes.byteLength;
}

function formatUploadError(error: {
  message?: string;
  error?: string;
  statusCode?: string | number;
}): string {
  const msg = `${error.message ?? ""} ${error.error ?? ""}`.toLowerCase();

  if (msg.includes("bucket not found")) {
    return "Avatar storage bucket missing. In Supabase go to Storage → New bucket → name it 'avatars' → enable Public, then run uniflow-app/supabase/avatars_storage.sql in the SQL Editor.";
  }
  if (
    msg.includes("row-level security") ||
    msg.includes("policy") ||
    msg.includes("403") ||
    error.statusCode === "403" ||
    error.statusCode === 403
  ) {
    return "You don't have permission to upload avatars. Check Supabase storage policies.";
  }
  if (msg.includes("401") || error.statusCode === "401" || error.statusCode === 401) {
    return "Session expired. Please sign out and sign in again.";
  }
  if (msg.includes("network request failed")) {
    return "Upload failed. Check your internet connection and try again.";
  }

  return error.message ?? error.error ?? "Failed to upload profile photo.";
}

/** Upload via Supabase REST API — avoids RN issues with the storage-js fetch wrapper. */
async function uploadViaRest(
  filePath: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Session expired. Please sign in again.");
  }

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}/${filePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": contentType,
        "x-upsert": "true",
        "cache-control": "max-age=3600",
      },
      body: new Blob([new Uint8Array(body)], { type: contentType }),
    },
  );

  if (!response.ok) {
    const json = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
      statusCode?: string | number;
    };
    throw new Error(formatUploadError(json));
  }
}

/** RN FormData upload — streams the file natively without loading into JS memory. */
async function uploadViaFormData(
  filePath: string,
  uri: string,
  contentType: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("cacheControl", "3600");
  formData.append("", {
    uri,
    name: filePath.split("/").pop() ?? "avatar.jpg",
    type: contentType,
  } as unknown as Blob);

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, formData, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(formatUploadError(error));
  }
}

export async function uploadAvatar(
  userId: string,
  uri: string,
  mimeType?: string | null,
): Promise<string> {
  const contentType = mimeType ?? "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const filePath = `${userId}/avatar.${ext}`;

  const bytes = await uriToUint8Array(uri);
  if (bytes.byteLength > MAX_AVATAR_BYTES) {
    throw new Error("Image must be no more than 2MB");
  }

  // Try FormData first (best for local file:// and content:// URIs on mobile)
  try {
    await uploadViaFormData(filePath, uri, contentType);
  } catch (formError) {
    const formMessage =
      formError instanceof Error ? formError.message : String(formError);

    // Fall back to direct REST upload with bytes
    if (
      formMessage.toLowerCase().includes("network request failed") ||
      formMessage.toLowerCase().includes("fetch")
    ) {
      await uploadViaRest(filePath, bytes, contentType);
    } else {
      throw formError;
    }
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
  return withCacheBust(data.publicUrl);
}