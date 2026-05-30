import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const PHOTO_CACHE_DIR = resolve(
  process.env.PHOTO_CACHE_DIR || ".",
  ".member-photo-cache",
);

function safeKey(key: string): string {
  return key.replace(/[/\\]/g, "_");
}

export async function getCachedPhoto(
  upstreamUrl: string,
  key: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const safe = safeKey(key);
    const metaPath = resolve(PHOTO_CACHE_DIR, `${safe}.meta.json`);
    const meta = JSON.parse(await readFile(metaPath, "utf8")) as {
      url: string;
      contentType: string;
    };
    if (meta.url !== upstreamUrl) return null;
    const buffer = await readFile(resolve(PHOTO_CACHE_DIR, `${safe}.bin`));
    return { buffer, contentType: meta.contentType };
  } catch {
    return null;
  }
}

export async function setCachedPhoto(
  upstreamUrl: string,
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const safe = safeKey(key);
  await mkdir(PHOTO_CACHE_DIR, { recursive: true });
  await writeFile(resolve(PHOTO_CACHE_DIR, `${safe}.bin`), buffer);
  await writeFile(
    resolve(PHOTO_CACHE_DIR, `${safe}.meta.json`),
    JSON.stringify({ url: upstreamUrl, contentType }),
  );
}
