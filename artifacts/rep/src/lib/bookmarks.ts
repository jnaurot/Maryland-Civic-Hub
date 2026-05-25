const STORAGE_KEY = "myreps:bookmarks";

export interface BillBookmark {
  id: string;
  type: "federal" | "state";
  number: string;
  title: string;
  savedAt: number;
}

function readAll(): BillBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BillBookmark[]) : [];
  } catch {
    return [];
  }
}

function writeAll(bookmarks: BillBookmark[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function getBookmarks(): BillBookmark[] {
  return readAll();
}

export function isBookmarked(id: string): boolean {
  return readAll().some((b) => b.id === id);
}

export function addBookmark(bookmark: Omit<BillBookmark, "savedAt">): void {
  const all = readAll();
  if (all.some((b) => b.id === bookmark.id)) return;
  writeAll([{ ...bookmark, savedAt: Date.now() }, ...all]);
}

export function removeBookmark(id: string): void {
  writeAll(readAll().filter((b) => b.id !== id));
}

export function toggleBookmark(bookmark: Omit<BillBookmark, "savedAt">): void {
  if (isBookmarked(bookmark.id)) {
    removeBookmark(bookmark.id);
  } else {
    addBookmark(bookmark);
  }
}
