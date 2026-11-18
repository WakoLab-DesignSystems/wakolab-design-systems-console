/* Console compositions with slots.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272:
 *  - shell:      web/src/features/catalog/compositions/shells.tsx (ConsoleHeader, ConsoleShell), shared.tsx (Tools)
 *  - collection: compositions/ConsoleHome.tsx (ConsoleHome, ConsoleRow)
 *  - detail:     compositions/projects.tsx (ConsoleProject), shared.tsx (Page)
 *  - form, message: web/src/features/catalog/pages.tsx (`.wl-form-page` framing, MessagePage)
 * (standard EXTRACTION_MATRIX §5.4, N3, N4).
 * Changes for standalone use: the app context, catalog view, i18n, routes and project data are
 * replaced by slots and props; the DOM structure, class names and order are unchanged. The
 * keyboard layer moved to useCollectionKeys (root/keyboard.ts); the composition binds it.
 * ConsoleHeader measures its search hint and exposes the width as --wl-search-hint-space, so the input
 * reserves that space (console-parts.css); without it, text ran under the hint (issue #10). */
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { SearchField } from "../components";
import { Icon } from "../components/icons";
import { MessageBlock } from "../parts/page";
import { useCollectionKeys } from "../root/keyboard";

/* ───────── Shell ───────── */
export interface ShellSearch {
  label: string; placeholder?: string; clearLabel: string; value: string; onChange: (v: string) => void;
  /** Visible keyboard hint next to the field (Console: "/"). Set to null to hide. */
  hint?: string | null;
}
/** Console top bar: logo slot, search with its `/` hint, tools in the order given. */
export function ConsoleHeader({ logo, search, tools, searchRef }: {
  logo: ReactNode; search?: ShellSearch; tools?: ReactNode; searchRef?: RefObject<HTMLInputElement | null>;
}) {
  // The hint sits over the input's right side; its measured width (custom hint text, configured code font)
  // becomes --wl-search-hint-space, which the input reserves so that no text runs under it.
  const searchBox = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLElement>(null);
  const hint = search && search.hint !== null ? search.hint ?? "/" : null;
  useLayoutEffect(() => {
    const box = searchBox.current, element = hintRef.current;
    if (!box || !element) return;
    const update = () => box.style.setProperty("--wl-search-hint-space", `${Math.ceil(element.getBoundingClientRect().width)}px`);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [hint]);
  return (
    <header className="wl-topbar">
      {logo}
      {search && (
        <div ref={searchBox} className="wl-topbar-search">
          <SearchField inputRef={searchRef} label={search.label} placeholder={search.placeholder} clearLabel={search.clearLabel} value={search.value} onChange={search.onChange} />
          {hint !== null && <kbd ref={hintRef} className="wl-kbd" aria-hidden="true">{hint}</kbd>}
        </div>
      )}
      {tools && <div className="wl-tools">{tools}</div>}
    </header>
  );
}
/** Console page frame: header plus content (source: ConsoleShell). */
export function ConsoleShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return <div className="wl-home wl-console">{header}{children}</div>;
}
/** Main content area of a shell page (source: Page). */
export function Page({ children, className = "", id = "main" }: { children: ReactNode; className?: string; id?: string }) {
  return <main id={id} className={`wl-page ${className}`}>{children}</main>;
}

/* ───────── Collection ───────── */
/** Console collection: sticky rail from 64rem with filters and the keyboard hint; heading with the
 *  `#` prompt, a live count and an optional action; a mobile filters toggle; content sections. */
export function CollectionLayout({ title, count, action, rail, hint, mobileFilters, children, mainId = "main" }: {
  title: ReactNode; count?: ReactNode; action?: ReactNode; rail?: ReactNode; hint?: ReactNode;
  /** Mobile filters: a toggle button and the chips shown below 64rem. */
  mobileFilters?: { label: string; open: boolean; onToggle: () => void; active?: boolean; content: ReactNode };
  children: ReactNode; mainId?: string;
}) {
  return (
    <div className="wl-console-body">
      <aside className="wl-rail">
        {rail}
        {hint && <p className="wl-hint">{hint}</p>}
      </aside>
      <main id={mainId} className="wl-console-main">
        <div className="wl-console-heading">
          <h1><span aria-hidden="true" className="wl-prompt">#</span> {title}</h1>
          <p role="status" className="wl-count">{count}</p>
          {action}
        </div>
        {mobileFilters && (
          <div className="wl-mobile-filters">
            <button type="button" className="wl-tool" aria-expanded={mobileFilters.open} onClick={mobileFilters.onToggle}>
              <Icon name="list" size={18} />{mobileFilters.label}{mobileFilters.active && " •"}
            </button>
            {mobileFilters.open && mobileFilters.content}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
/** A collection section; `heading` is shown with the `#` prompt. */
export function CollectionSection({ heading, headingId, label, lead, children }: {
  heading?: ReactNode; headingId?: string; label?: string; lead?: ReactNode; children: ReactNode;
}) {
  return (
    <section aria-labelledby={heading ? headingId : undefined} aria-label={heading ? undefined : label} className="wl-section">
      {heading && <h2 id={headingId}><span aria-hidden="true" className="wl-prompt">#</span> {heading}</h2>}
      {lead && <p className="wl-lead">{lead}</p>}
      {children}
    </section>
  );
}
/** Dense rows with a header row from 48rem (source: `.wl-table` + ConsoleRow). */
export function CollectionTable({ columns, children, listRef, listId }: {
  columns: [ReactNode, ReactNode, ReactNode, ReactNode]; children: ReactNode;
  listRef?: RefObject<HTMLUListElement | null>; listId?: string;
}) {
  return (
    <div className="wl-table">
      <div aria-hidden="true" className="wl-row wl-row--head">{columns.map((c, i) => <span key={i}>{c}</span>)}</div>
      <ul ref={listRef} id={listId}>{children}</ul>
    </div>
  );
}
/** One row: name and summary, then three columns. Rendered inside an ItemLink with className "wl-row". */
export function RowContent({ title, summary, summaryLang, second, third, fourth, index }: {
  title: ReactNode; summary?: ReactNode; summaryLang?: string; second?: ReactNode; third?: ReactNode; fourth?: ReactNode; index?: number;
}) {
  return (
    <>
      <span className="wl-row-name"><span className="wl-row-title">{title}</span>{summary !== undefined && <span lang={summaryLang} className="wl-row-tagline">{summary}</span>}</span>
      {second}
      {third}
      <span className="wl-row-access">{fourth}</span>
      {index !== undefined && <span className="sr-only">{index + 1}</span>}
    </>
  );
}
/** Binds the Console keyboard layer to a collection (see useCollectionKeys). */
export function CollectionKeys(props: Parameters<typeof useCollectionKeys>[0]) {
  useCollectionKeys(props);
  return null;
}
export function useListRef() { return useRef<HTMLUListElement>(null); }

/* ───────── Detail ───────── */
/** Console detail: breadcrumb prompt, mono title and lead; side panel with key/value facts;
 *  body (tabs or a single section). DOM order = narrow reading order: title, side, body. */
export function DetailLayout({ back, path, title, lead, leadLang, side, body, problem }: {
  back?: ReactNode; path: ReactNode; title: ReactNode; lead?: ReactNode; leadLang?: string;
  side: ReactNode; body: ReactNode;
  /** Loading or problem state shown instead of the grid. */
  problem?: ReactNode;
}) {
  return (
    <Page className="wl-project wl-project--console">
      {back}
      {problem ?? (
        <div className="wl-project-grid">
          <header className="wl-project-head">
            <p className="wl-path"><span aria-hidden="true" className="wl-prompt">› </span>{path}</p>
            <h1>{title}</h1>
            {lead !== undefined && <p lang={leadLang} className="wl-lead">{lead}</p>}
          </header>
          <aside className="wl-project-side">{side}</aside>
          {body}
        </div>
      )}
    </Page>
  );
}
/** Single body section with the `#` prompt (source: the MVP body of ConsoleProject). */
export function DetailSection({ id, heading, children }: { id: string; heading: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="wl-project-body">
      <h2 id={id} className="wl-console-sub"><span aria-hidden="true" className="wl-prompt"># </span>{heading}</h2>
      {children}
    </section>
  );
}
/** Body wrapper for tabbed details. */
export function DetailBody({ children }: { children: ReactNode }) {
  return <div className="wl-project-body">{children}</div>;
}
/** Bordered side panel (source: `.wl-panel`). */
export function Panel({ children }: { children: ReactNode }) {
  return <div className="wl-panel">{children}</div>;
}

/* ───────── Form and message pages ───────── */
/** Console form page: left-aligned, compact column (source: `.wl-form-page` pages). */
export function FormPage({ back, title, lead, children, wide }: { back?: ReactNode; title: ReactNode; lead?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <Page className={`wl-form-page${wide ? " wl-wide-page" : ""}`}>
      {back}
      <header className="wl-form-head"><h1>{title}</h1>{lead !== undefined && <p className="wl-lead">{lead}</p>}</header>
      {children}
    </Page>
  );
}
/** Message page framed by the shell (source: MessagePage). */
export function MessagePage(props: Parameters<typeof MessageBlock>[0]) {
  return <Page className="wl-form-page"><MessageBlock {...props} /></Page>;
}
