/* Console keyboard layer for a collection.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272,
 * web/src/features/catalog/compositions/ConsoleHome.tsx lines 30–45 (standard EXTRACTION_MATRIX §5.5, N2, R3).
 * `/` focuses the search; `j`/`k` move focus between the collection's items (elements with
 * `data-wds-item` inside the items container). Ignored in inputs, selects, text areas and editable
 * content, with a modifier key, or while any modal dialog is open in the document.
 * Changes for standalone use: by default the listener is on the Console root, so it only sees key
 * presses inside that root; `scope: "page"` listens on the document (as the source did on window)
 * but acts only on this root's collection — enable it on one root at a time. */
import { useEffect, type RefObject } from "react";
import { useConsole } from "./context";

export function useCollectionKeys({ searchRef, itemsRef, scope = "root", enabled = true }: {
  searchRef: RefObject<HTMLInputElement | null>;
  itemsRef: RefObject<HTMLElement | null>;
  scope?: "root" | "page";
  enabled?: boolean;
}) {
  const { rootRef } = useConsole();
  useEffect(() => {
    if (!enabled) return;
    const target: EventTarget | null = scope === "page" ? document : rootRef.current;
    if (!target) return;
    const onKey = (event: Event) => {
      const e = event as KeyboardEvent;
      const el = e.target as HTMLElement;
      if (document.querySelector("dialog[open]") || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if (/INPUT|SELECT|TEXTAREA/.test(el.tagName) || el.isContentEditable) return;
      // Page scope: act only when nothing is focused or the focus is inside this root.
      if (scope === "page" && el !== document.body && !rootRef.current?.contains(el)) return;
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "j" || e.key === "k") {
        const rows = Array.from(itemsRef.current?.querySelectorAll<HTMLElement>("[data-wds-item]") ?? []);
        if (!rows.length) return;
        const at = rows.indexOf(document.activeElement as HTMLElement);
        const next = Math.max(0, Math.min(rows.length - 1, at < 0 ? 0 : at + (e.key === "j" ? 1 : -1)));
        rows[next].focus();
      }
    };
    target.addEventListener("keydown", onKey);
    return () => target.removeEventListener("keydown", onKey);
  }, [enabled, scope, rootRef, searchRef, itemsRef]);
}
