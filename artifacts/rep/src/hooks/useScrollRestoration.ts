import { useEffect, useRef } from "react";

export function useScrollRestoration({
  scrollStorageKey,
  listViewportRef,
  loading,
  enabled = true,
}: {
  scrollStorageKey: string;
  listViewportRef: React.RefObject<HTMLElement | null>;
  loading: boolean;
  enabled?: boolean;
}) {
  const restoredScrollRef = useRef(false);

  useEffect(() => {
    restoredScrollRef.current = false;
  }, [scrollStorageKey]);

  useEffect(() => {
    if (!enabled) return;
    if (loading) return;
    if (restoredScrollRef.current) return;
    if (typeof window === "undefined") return;

    const raw = window.sessionStorage.getItem(scrollStorageKey);
    if (!raw) {
      restoredScrollRef.current = true;
      return;
    }
    const scrollTop = Number(raw);
    if (!Number.isFinite(scrollTop)) {
      restoredScrollRef.current = true;
      return;
    }
    const id = window.requestAnimationFrame(() => {
      if (listViewportRef.current) listViewportRef.current.scrollTop = scrollTop;
      restoredScrollRef.current = true;
    });
    return () => window.cancelAnimationFrame(id);
  }, [enabled, loading, scrollStorageKey, listViewportRef]);
}
