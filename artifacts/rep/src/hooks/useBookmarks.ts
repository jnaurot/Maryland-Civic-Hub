import { useState, useCallback } from "react";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  toggleBookmark,
  type BillBookmark,
} from "@/lib/bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BillBookmark[]>(() => getBookmarks());

  const refresh = useCallback(() => setBookmarks(getBookmarks()), []);

  const add = useCallback(
    (bookmark: Omit<BillBookmark, "savedAt">) => { addBookmark(bookmark); refresh(); },
    [refresh],
  );

  const remove = useCallback(
    (id: string) => { removeBookmark(id); refresh(); },
    [refresh],
  );

  const toggle = useCallback(
    (bookmark: Omit<BillBookmark, "savedAt">) => { toggleBookmark(bookmark); refresh(); },
    [refresh],
  );

  const check = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks],
  );

  return { bookmarks, add, remove, toggle, check };
}
