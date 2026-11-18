// Neutral Console example with synthetic data. Original code.
// It imports the BUILT package ("wakolab-design-systems-console" is aliased to dist/ by
// examples/vite.config.ts), like an external project would.
// Query parameters: screen=overview|collection|detail|form|message|states|components (default: collection),
// mode=light|dark|system, config=example|local (example: the example configuration with its font and
// logo; local: the design-config.json chosen on the Overview page, carried in local=<base64url>).
// One source, two loading modes (standard DIRECTIONS §4 at 8e3b818, issue #8): `npm run example` serves
// it over HTTP ("console-example-env" → env/http.ts: example read from /design/ with assetBase "/design/",
// state in the query string as integrated in #7); scripts/build-html.mjs builds the same source into
// the single offline file console-kit.html (env/offline.ts: everything embedded, the same parameters in
// the URL hash). Font and logo files chosen from the disk stay in memory while the page is open and must
// be selected again after a reload.
// Navigation: the header's "Screen" menu (a Console Popover and Button) lists the six screens as
// links. Same-page link clicks update the query with history.pushState, so the root, its mode and the
// loaded configuration persist; the mode is mirrored into `mode=` and every example link keeps `mode=`
// and `config=`, so reloads, new tabs, the back button and direct links give the same screen and choices.
import "wakolab-design-systems-console/console.css";
import "./example.css";
import { createContext, StrictMode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EXAMPLE_FILES, KIT, loadExample } from "console-example-env";
import { decodeConfig, encodeConfig, fileName, namedFiles, withFiles } from "./env/shared";
import licence from "../../LICENSE?raw";
import notices from "../../THIRD_PARTY_NOTICES.md?raw";
import monoLicence from "../../licenses/jetbrains-mono-OFL-1.1.txt?raw";
import dmSansLicence from "../../licenses/dm-sans-OFL-1.1.txt?raw";
import scLicence from "../../licenses/noto-sans-sc-OFL-1.1.txt?raw";
import devanagariLicence from "../../licenses/noto-sans-devanagari-OFL-1.1.txt?raw";
import tailwindLicence from "../../licenses/tailwindcss-MIT.txt?raw";
import reactLicence from "../../licenses/react-MIT.txt?raw";
import { createRoot } from "react-dom/client";
import {
  Alert, Badge, BackLink, Button, Card, Checkbox, ChoiceGroup, CodeField, CollectionKeys, CollectionLayout, CollectionSection,
  CollectionStatus, CollectionTable, ConfirmDialog, ConnectionRow, ConsoleHeader, ConsoleRoot, ConsoleShell, Cover, DetailLayout,
  DetailSection, Dialog, EmptyState, FilterChips, FilterTree, FormPage, IconButton, ItemLink, KeyValueList, LoadMore, LoadingState,
  LogoSlot, MessagePage, ModeMenu, Page, Panel, Popover, ProblemState, RowContent, SearchField, Select, Skeleton, Stepper, TabPanel,
  Tabs, TextField, Toast, ToggleChip, ToolButton, type DesignConfig, type FilterItem, type IconSet, type Mode,
} from "wakolab-design-systems-console";

type Screen = "overview" | "collection" | "detail" | "form" | "message" | "states" | "components";
// The menu reaches the presentation page and every example screen (standard DIRECTIONS §2, issue #8).
// Without `screen=`, the example still opens on the collection, as integrated in #7.
const SCREENS: { id: Screen; label: string }[] = [
  { id: "overview", label: "Overview" }, { id: "collection", label: "Collection" }, { id: "detail", label: "Detail" }, { id: "form", label: "Form" },
  { id: "message", label: "Message" }, { id: "states", label: "States" }, { id: "components", label: "Components" },
];
const MODES: Mode[] = ["light", "dark", "system"];

/** The current query, the active screen and a link builder that keeps the chosen mode and configuration. */
interface Nav { params: URLSearchParams; screen: Screen; href: (screen: Screen, extra?: Record<string, string>) => string }
const NavContext = createContext<Nav | null>(null);
const useNav = () => useContext(NavContext)!;
/** The example's state as a query string ("?a=b"), read from the query (HTTP) or the hash (offline file). */
const currentQuery = () => KIT.stateIn === "query" ? location.search : location.hash ? `?${location.hash.slice(1)}` : "";
const queryOf = (url: URL) => KIT.stateIn === "query" ? url.search : url.hash ? `?${url.hash.slice(1)}` : "";
/** The address part for a state: "?…" over HTTP, "#…" in the offline file. */
const stateUrl = (query: string) => KIT.stateIn === "query" ? query : `#${query.replace(/^\?/, "")}`;
function readNav(search: string): Nav {
  const params = new URLSearchParams(search);
  const requested = params.get("screen");
  const screen = SCREENS.find((s) => s.id === requested)?.id ?? "collection";
  const href = (to: Screen, extra: Record<string, string> = {}) => {
    const next = new URLSearchParams({ screen: to, ...extra });
    for (const key of ["mode", "config", "local"]) { const value = params.get(key); if (value) next.set(key, value); }
    return stateUrl(`?${next}`);
  };
  return { params, screen, href };
}
/** Font and logo files selected from the disk, by file name, as blob: URLs (memory only). */
type LocalFiles = Map<string, { name: string; url: string }>;
interface Kit { files: LocalFiles; addFiles: (list: FileList) => void; problem?: string; setProblem: (p?: string) => void; setConfig: (query: Record<string, string | null>) => void }
const KitContext = createContext<Kit | null>(null);
const LICENCES: [string, string][] = [
  ["Console (MIT): LICENSE", licence], ["Third-party notices", notices], ["JetBrains Mono (OFL-1.1)", monoLicence], ["DM Sans (OFL-1.1)", dmSansLicence],
  ["Noto Sans SC (OFL-1.1)", scLicence], ["Noto Sans Devanagari (OFL-1.1)", devanagariLicence], ["Tailwind CSS (MIT)", tailwindLicence],
  ["React, React DOM, Scheduler (MIT; in the HTML file only)", reactLicence],
];

const CATEGORIES: FilterItem[] = [
  { id: "science", label: "Science", children: [{ id: "science/climate", label: "Climate" }, { id: "science/biology", label: "Biology" }] },
  { id: "civic", label: "Civic", children: [{ id: "civic/transport", label: "Transport" }] },
  { id: "culture", label: "Culture" },
];
const ITEMS = [
  { id: "coastal-temperatures", name: "Coastal temperatures", summary: "Daily sea-surface readings from six buoys.", cat: "science/climate", path: "Science › Climate", access: "Public data", editing: "Open to edits" },
  { id: "pollinator-counts", name: "Pollinator counts", summary: "Weekly counts from community gardens, with photos.", cat: "science/biology", path: "Science › Biology", access: "Public data", editing: "Edits reviewed" },
  { id: "bus-punctuality", name: "Bus punctuality", summary: "Departures and delays per stop, updated hourly.", cat: "civic/transport", path: "Civic › Transport", access: "Restricted data", editing: "Edits reviewed" },
  { id: "library-loans", name: "Library loans", summary: "Anonymous loan counts per branch and month.", cat: "culture", path: "Culture", access: "Public data", editing: "Open to edits" },
  { id: "long-title", name: "A deliberately long dataset title that wraps on narrow screens without hiding any word", summary: "A long summary to check wrapping and truncation in the dense rows.", cat: "science/climate", path: "Science › Climate", access: "Public data", editing: "Open to edits" },
];

/** Example-local coordination for a Console Popover in the header (N-R1, PR #7). Console's Popover closes
 *  on an outside pointer press and handles Escape only while focus is inside it; it does not close when
 *  keyboard focus leaves it. This scope closes its open popover when focus moves to an element outside it,
 *  by the popover's own trigger toggle, which does not move focus. So Tab, Shift+Tab or opening another
 *  popover never leaves a stale panel over the next control. It reacts only to focus leaving this scope:
 *  no page-wide key handler. A focus loss without a new target (window switch, pointer press) is left to
 *  the Popover's own pointer handling. `display: contents` keeps the header layout unchanged. */
function CloseOnFocusLeave({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null;
    if (!next || scope.current?.contains(next)) return;
    scope.current?.querySelector<HTMLButtonElement>('[data-wds-popover][data-open="true"] > button[aria-expanded="true"]')?.click();
  };
  return <div ref={scope} className="ex-popover-scope" onBlur={onBlur}>{children}</div>;
}

/** Header menu listing the six example screens as links; the active one carries aria-current="page".
 *  The trigger always shows "Screen:" and the active screen, at every width. */
function ScreenMenu() {
  const { screen, href } = useNav();
  const active = SCREENS.find((s) => s.id === screen)!;
  return (
    // A Console Button, not a ToolButton: below 40rem Console makes header tools icon-only, and the example
    // ships no icon artwork, so a ToolButton would be an empty box. The Button keeps "Screen" visible.
    <Popover label="Example screens" align="start" trigger={(p) => (
      <Button {...p} id="screen-menu" variant="secondary">Screen: {active.label}</Button>
    )}>
      {(close) => (
        <nav aria-label="Example screens">
          <ul className="ex-menu">
            {SCREENS.map((s) => (
              <li key={s.id}>
                <a href={href(s.id)} className="wl-option ex-menu-link" aria-current={s.id === screen ? "page" : undefined} onClick={close}>
                  <span aria-hidden="true" className="wl-prompt ex-menu-mark">{s.id === screen ? "›" : ""}</span>{s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </Popover>
  );
}

function Header({ searchRef, query, setQuery }: { searchRef?: React.RefObject<HTMLInputElement | null>; query: string; setQuery: (q: string) => void }) {
  const { href } = useNav();
  return (
    <ConsoleHeader
      logo={<LogoSlot label="Field Lab" accessibleName="Field Lab, home" href={href("collection")} />}
      searchRef={searchRef}
      search={{ label: "Search datasets", placeholder: "Dataset name or summary", clearLabel: "Clear search", value: query, onChange: setQuery }}
      tools={<>
        <CloseOnFocusLeave><ScreenMenu /></CloseOnFocusLeave>
        <CloseOnFocusLeave><ModeMenu compact label="Appearance" modeLabel="Mode" labels={{ light: "Light", dark: "Dark", system: "System" }} /></CloseOnFocusLeave>
        <ToolButton icon="globe" label="Language" value="English" compact valueLang="en" />
        <Button id="sign-in" className="wl-signin">Sign in</Button>
      </>}
    />
  );
}

/** Presentation page: identity, foundations, configuration (shipped defaults, example, your own files),
 *  how to reuse, kit status and licences. Built with Console's own components. */
function OverviewScreen() {
  const { params, href } = useNav();
  const kit = useContext(KitContext)!;
  const [query, setQuery] = useState("");
  const config = params.get("config");
  const swatch = (role: string) => <div key={role} className="ex-swatch"><span style={{ background: `var(--wl-${role})` }} /><code>{role}</code></div>;
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <Page className="ex-grid">
        <header className="ex-intro">
          <p className="wl-path">Design system</p>
          <h1>Console</h1>
          <p className="wl-prose ex-lead">A terminal-inspired system for dense, keyboard-friendly tools: monospace interface type, rows of at least 44 px, a top bar with a filter rail from 64em, square geometry, flat surfaces and short 100 ms motion. Everything on this page is rendered with Console's own components.</p>
          <p className="wl-meta-text">Use the <strong>Screen</strong> menu to open the six example screens: <a href={href("collection")}>collection</a>, <a href={href("detail")}>detail</a>, form, message, states and components. <strong>Appearance</strong> switches light and dark.</p>
        </header>
        <section className="ex-card" aria-labelledby="ov-config">
          <h2 id="ov-config">Configuration</h2>
          <p className="wl-meta-text">Values in a design-config.json are applied exactly as written; omitted roles keep Console's defaults. Choose the shipped defaults, the example configuration (colours, interface font and logo) or your own file.</p>
          <div className="ex-row" role="group" aria-label="Configuration">
            <ToggleChip pressed={!config} onClick={() => kit.setConfig({ config: null })}>Shipped defaults</ToggleChip>
            <ToggleChip pressed={config === "example"} onClick={() => kit.setConfig({ config: "example" })}>Example configuration</ToggleChip>
            {params.get("local") && <ToggleChip pressed={config === "local"} onClick={() => kit.setConfig({ config: "local" })}>Your configuration</ToggleChip>}
          </div>
          <LocalConfig />
        </section>
        <section className="ex-card" aria-labelledby="ov-colours">
          <h2 id="ov-colours">Colour roles</h2>
          <div className="ex-swatches">{["bg", "surface", "surface-2", "ink", "muted", "border", "control", "action", "action-hover", "link", "focus", "accent", "success", "warning", "danger", "info"].map(swatch)}</div>
          <p className="wl-meta-text"><code>accent</code> marks the keyboard prompt and the focused row's marker. <code>link</code> and <code>focus</code> are their own roles: setting <code>action</code> does not change them.</p>
        </section>
        <section className="ex-card" aria-labelledby="ov-type">
          <h2 id="ov-type">Typography</h2>
          <p style={{ fontFamily: "var(--wl-font-ui)", fontSize: "1.5rem", fontWeight: 600 }}>Interface and display — JetBrains Mono</p>
          <p className="wl-prose">Prose — DM Sans, for leads and long descriptions.</p>
          <p><kbd className="wl-kbd">/</kbd> <kbd className="wl-kbd">j</kbd> <kbd className="wl-kbd">k</kbd> <span className="wl-meta-text">Key hints use the code role.</span></p>
        </section>
        <section className="ex-card" aria-labelledby="ov-use">
          <h2 id="ov-use">Use it</h2>
          <ul className="ex-list">
            <li>Render every screen inside <code>ConsoleRoot</code> and import <code>wakolab-design-systems-console/console.css</code> once.</li>
            <li>Pass your configuration as <code>config</code>, with <code>assetBase</code> for its relative paths.</li>
            <li>Pass your own icon set: Console ships no icon artwork, so icon slots stay empty here.</li>
            <li>See README.md, AGENTS.md and docs/rules/ in the repository.</li>
          </ul>
          <p className="wl-meta-text" id="kit-status">{KIT.offline
            ? <>Offline file built from source <code>{KIT.sourceSha}</code>, standard <code>{KIT.standardSha.slice(0, 7)}</code>. Everything it needs is inside this file; it makes no network request.</>
            : <>HTTP example (npm run example), standard <code>{KIT.standardSha.slice(0, 7)}</code>. The same example is also built as the single offline file console-kit.html.</>}
            {" "}The maintained Docker start and the Figma companion are later kit targets, not delivered yet.</p>
        </section>
        <section className="ex-card" aria-labelledby="ov-licences">
          <h2 id="ov-licences">Licences</h2>
          <p className="wl-meta-text">Console's own code and documentation are MIT (LICENSE, below). The fonts, the Tailwind CSS output and, in the offline file, React keep their own licences:</p>
          {LICENCES.map(([title, text]) => (
            <details key={title} className="ex-licence"><summary>{title}</summary><pre className="ex-code">{text}</pre></details>
          ))}
        </section>
      </Page>
    </ConsoleShell>
  );
}

/** Your own configuration: a design-config.json and the font and logo files it names, all chosen from
 *  the disk. Nothing is uploaded: files are read in memory (blob: URLs) and matched by file name.
 *  Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a45832769d41ec10c1c6e0dc6afa8f1c1061f99a,
 *  examples/demo/main.tsx (LocalConfig); Console adaptation: state through the example's query/hash. */
function LocalConfig() {
  const { params } = useNav();
  const kit = useContext(KitContext)!;
  const encoded = params.get("local");
  const local = useMemo(() => { try { return encoded ? decodeConfig(encoded) : undefined; } catch { return undefined; } }, [encoded]);
  const named = local ? namedFiles(local) : [];
  const onConfig = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    try { kit.setConfig({ config: "local", local: encodeConfig(JSON.parse(await file.text())) }); kit.setProblem(undefined); }
    catch (e) { kit.setProblem(`${file.name} is not a valid JSON file (${(e as Error).message}). Nothing was changed.`); }
  };
  return (
    <div className="ex-local">
      <h3>Your configuration</h3>
      <p className="wl-meta-text">Choose a design-config.json, then the font and logo files it names. Files are matched by file name and stay on your computer.</p>
      <div className="ex-row">
        <label className="ex-file"><span>Configuration file</span>
          <input id="local-config" type="file" accept=".json,application/json" onChange={(e) => { onConfig(e.currentTarget.files); e.currentTarget.value = ""; }} /></label>
        <label className="ex-file"><span>Font and logo files</span>
          <input id="local-files" type="file" multiple accept=".woff2,.woff,.ttf,.otf,.svg,.png,.jpg,.jpeg,.webp,.gif" onChange={(e) => { if (e.currentTarget.files) kit.addFiles(e.currentTarget.files); e.currentTarget.value = ""; }} /></label>
      </div>
      {kit.problem && <Alert tone="error">{kit.problem}</Alert>}
      {named.length > 0 && (
        <ul className="ex-list" id="local-file-status" aria-label="Files named by your configuration">
          {named.map((path) => {
            const hit = kit.files.get(fileName(path));
            return <li key={path}><code>{path}</code>: {hit ? <>selected ({hit.name})</> : <strong>not selected yet</strong>}</li>;
          })}
        </ul>
      )}
      <p className="wl-meta-text">After a reload, the configuration values come back from the page address. The font and logo files must be selected again: until then, a font role without its file keeps Console's default and a missing logo shows the text logo.</p>
      <p className="wl-meta-text">To start from the example, download its files:{" "}
        {EXAMPLE_FILES.map((f, i) => <span key={f.path}>{i ? ", " : ""}<a href={f.url} download={fileName(f.path)}>{f.path}</a></span>)}.</p>
    </div>
  );
}

function CollectionScreen() {
  const { params, href } = useNav();
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(""); const [sub, setSub] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filter = (v: string, s: string) => { setCat(v); setSub(s); };
  const items = ITEMS.filter((i) => (!cat || i.cat.startsWith(sub || cat)) && (!query || (i.name + " " + i.summary).toLowerCase().includes(query.toLowerCase())));
  const state = params.get("state");
  return (
    <ConsoleShell header={<Header searchRef={searchRef} query={query} setQuery={setQuery} />}>
      <CollectionKeys searchRef={searchRef} itemsRef={listRef} scope="page" />
      <CollectionLayout title="Datasets" count={state ? "" : `${items.length} dataset${items.length === 1 ? "" : "s"}`}
        rail={<FilterTree items={CATEGORIES} value={cat} subValue={sub} onChange={filter} label="Category" allLabel="All" />}
        hint="Keys: / search · j k move · Enter open"
        mobileFilters={{ label: "Category", open: filtersOpen, onToggle: () => setFiltersOpen(!filtersOpen), active: Boolean(cat),
          content: <FilterChips items={CATEGORIES} value={cat} subValue={sub} onChange={filter} label="Category" allLabel="All" subLabel="Subcategory" /> }}>
        <CollectionSection label="Datasets" lead="Synthetic datasets for the Console example. Nothing here is real.">
          <CollectionStatus state={
            state === "loading" ? { status: "loading", label: "Loading datasets…" }
            : state === "unavailable" ? { status: "unavailable", title: "Datasets are unavailable right now", body: "Try again in a moment. Your filters are kept.", retryLabel: "Try again", onRetry: () => {} }
            : items.length === 0 ? { status: "noResults", title: "No dataset matches", body: "Try another word or clear the filters.", clearLabel: "Clear filters", onClear: () => { filter("", ""); setQuery(""); } }
            : { status: "ready" }} />
          {!state && items.length > 0 && (
            <CollectionTable columns={["Name", "Category", "Access", "Editing"]} listRef={listRef}>
              {items.map((i, n) => (
                <li key={i.id}>
                  <ItemLink href={href("detail", { id: i.id })} itemId={i.id} className="wl-row">
                    <RowContent title={i.name} summary={i.summary} summaryLang="en" index={n}
                      second={<span className="wl-path">{i.path}</span>}
                      third={<span className="wl-meta">{i.access}</span>}
                      fourth={<span className="wl-meta">{i.editing}</span>} />
                  </ItemLink>
                </li>
              ))}
            </CollectionTable>
          )}
          {!state && items.length > 0 && <LoadMore shownLabel={`Showing ${items.length} of 12`} more actionLabel="Show more datasets" onMore={() => {}} />}
        </CollectionSection>
      </CollectionLayout>
    </ConsoleShell>
  );
}

function DetailScreen() {
  const { params, href } = useNav();
  const item = ITEMS.find((i) => i.id === params.get("id")) ?? ITEMS[0];
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"about" | "files">("about");
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<string>();
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <DetailLayout back={<BackLink href={href("collection")} label="Back to datasets" />} path={`datasets / ${item.id}`} title={item.name} lead={item.summary} leadLang="en"
        side={<>
          <Panel>
            <p className="wl-meta-text">{item.editing}. Requests are answered by the maintainers.</p>
            <Button size="lg" id="request" onClick={() => setConfirm(true)}>Request access</Button>
          </Panel>
          <KeyValueList items={[{ key: "Category", value: item.path }, { key: "Access", value: item.access }, { key: "Updated", value: "2026-11-02" }, { key: "Language", value: <span lang="en">English</span> }]} />
        </>}
        body={<div className="wl-project-body">
          <Tabs idBase="dataset" label={item.name} value={tab} onChange={setTab} tabs={[{ id: "about", label: "About" }, { id: "files", label: "Files" }]} />
          <TabPanel idBase="dataset" tab={tab}>
            {tab === "about" ? <p className="wl-prose" lang="en">Readings are collected by volunteers and checked weekly. Synthetic text for the Console example.</p>
              : <EmptyState icon="doc" title="No file yet">Files you add appear here.</EmptyState>}
          </TabPanel>
        </div>} />
      <ConfirmDialog open={confirm} title={`Request access to ${item.name}?`} body="The maintainers review each request. You can withdraw it later."
        confirmLabel="Send request" cancelLabel="Not now" closeLabel="Close" onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); setToast("Request sent (example)."); }} />
      <Toast message={toast} onDone={() => setToast(undefined)} />
    </ConsoleShell>
  );
}

function FormScreen() {
  const { href } = useNav();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("fl");
  const [error, setError] = useState<string>();
  const [view, setView] = useState("rows");
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <FormPage back={<BackLink href={href("collection")} label="Back to datasets" />} title="Settings" lead="Synthetic settings form. Nothing is saved.">
        <form noValidate className="wl-form" onSubmit={(e) => { e.preventDefault(); setError(name.trim().length < 3 ? "Use at least 3 characters." : undefined); }}>
          <TextField id="team" label="Team name" required value={name} onChange={(e) => setName(e.target.value)} error={error} hint="Shown on shared datasets." />
          <TextField id="email" label="Email" value="team@example.test" readOnly />
          <Select id="tz" label="Time zone"><option>UTC</option><option>Europe/Brussels</option></Select>
          <ChoiceGroup label="Default view" value={view} onChange={setView} options={[{ value: "rows", label: "Rows with summary" }, { value: "names", label: "Names only" }]} />
          <Checkbox label="Email me when a dataset I follow changes" defaultChecked />
          <div className="ex-row"><Button type="submit">Save changes</Button><Button variant="ghost" type="reset">Discard</Button></div>
        </form>
      </FormPage>
    </ConsoleShell>
  );
}

function MessageScreen() {
  const [query, setQuery] = useState("");
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <MessagePage icon="search" title="This page doesn't exist" body="The link may be wrong or out of date." action={<Button variant="secondary">Back to datasets</Button>} />
    </ConsoleShell>
  );
}

function StatesScreen() {
  const [query, setQuery] = useState("");
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <Page className="ex-grid">
        <h1>States</h1>
        <section className="ex-card"><h2>Collection loading</h2><CollectionStatus state={{ status: "loading", label: "Loading datasets…" }} /></section>
        <section className="ex-card"><h2>Collection unavailable</h2><CollectionStatus state={{ status: "unavailable", title: "Datasets are unavailable right now", body: "Try again in a moment.", retryLabel: "Try again", onRetry: () => {} }} /></section>
        <section className="ex-card"><h2>Nothing published</h2><CollectionStatus state={{ status: "empty", title: "No dataset yet", body: "Published datasets appear here." }} /></section>
        <section className="ex-card"><h2>No results</h2><CollectionStatus state={{ status: "noResults", title: "No dataset matches", body: "Try another word.", clearLabel: "Clear filters", onClear: () => {} }} /></section>
        <section className="ex-card"><h2>Detail loading</h2><LoadingState label="Loading the dataset…" /></section>
        <section className="ex-card"><h2>Detail problem</h2><ProblemState title="The dataset couldn't be loaded" body="Try again in a moment." retryLabel="Try again" onRetry={() => {}} /></section>
      </Page>
    </ConsoleShell>
  );
}

function ComponentsScreen() {
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<string>();
  const [chip, setChip] = useState(true);
  const [tab, setTab] = useState<"one" | "two" | "three">("one");
  const [search, setSearch] = useState("buoy");
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <Page className="ex-grid">
        <h1>Components</h1>
        <section className="ex-card"><h2>Buttons</h2>
          <div className="ex-row"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="destructive">Delete</Button></div>
          <div className="ex-row"><Button size="sm">Small</Button><Button size="lg">Large</Button><Button busy>Saving</Button><Button disabled>Disabled</Button><IconButton label="Close">×</IconButton></div>
        </section>
        <section className="ex-card"><h2>Fields</h2>
          <TextField id="f1" label="Name" defaultValue="Coastal temperatures" />
          <TextField id="f2" label="Code" defaultValue="C" error="Use 2 to 8 letters." />
          <TextField id="f3" label="Owner" defaultValue="Not editable" disabled />
          <CodeField id="f4" label="Six-digit code" hint="Sent to your email." />
          <SearchField label="Search" value={search} onChange={setSearch} clearLabel="Clear search" hideLabel={false} />
        </section>
        <section className="ex-card"><h2>Choices</h2>
          <Checkbox label="Include archived datasets" defaultChecked />
          <ChoiceGroup label="Delimiter" value="comma" onChange={() => {}} options={[{ value: "comma", label: "Comma" }, { value: "tab", label: "Tab" }]} />
          <div className="ex-row"><ToggleChip pressed={chip} onClick={() => setChip(!chip)}>Open</ToggleChip><ToggleChip pressed={!chip} onClick={() => setChip(!chip)} note="3">Closed</ToggleChip></div>
          <FilterChips items={CATEGORIES} value="science" subValue="" onChange={() => {}} label="Category" allLabel="All" subLabel="Subcategory" />
        </section>
        <section className="ex-card"><h2>Tabs and popover</h2>
          <Tabs idBase="ex-tabs" label="Example" value={tab} onChange={setTab} tabs={[{ id: "one", label: "Summary" }, { id: "two", label: "History" }, { id: "three", label: "Files" }]} />
          <TabPanel idBase="ex-tabs" tab={tab}><p className="wl-prose">Panel for {tab}. Arrow keys move between tabs.</p></TabPanel>
          <Popover label="More actions" align="start" trigger={(p) => <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id="more-actions" type="button" className="wl-tool">Actions</button>}>
            {(close) => <div className="grid gap-1"><button type="button" className="wl-option ex-left" onClick={close}>Duplicate</button><button type="button" className="wl-option ex-left" onClick={close}>Rename</button></div>}
          </Popover>
        </section>
        <section className="ex-card"><h2>Feedback</h2>
          <Alert tone="info">Sync runs every hour.</Alert><Alert tone="success">Export finished.</Alert><Alert tone="warning">2 rows need review.</Alert><Alert tone="error">The file couldn't be read.</Alert>
          <div className="ex-row"><Badge>Draft</Badge><Badge>Public</Badge></div>
          <div className="ex-row"><Button variant="secondary" id="toast-btn" onClick={() => setToast("Saved. This message is not urgent.")}>Show toast</Button>
            <Button variant="secondary" id="dialog-btn" onClick={() => setDialog(true)}>Open dialog</Button>
            <Button variant="secondary" id="confirm-btn" onClick={() => setConfirm(true)}>Open confirmation</Button></div>
        </section>
        <section className="ex-card"><h2>Structure</h2>
          <Card><h3>Card</h3><p className="wl-meta-text">Storage: 38.2 GB of 50 GB.</p></Card>
          <Stepper steps={["Upload", "Check", "Publish"]} current={1} />
          <ConnectionRow name="Archive service" status="Not available yet" description="Connections are not part of this example." />
          <KeyValueList items={[{ key: "Owner", value: "data-team" }, { key: "Updated", value: "2026-11-02" }]} />
          <div className="ex-row ex-cover-row"><div className="ex-cover"><Cover name="Coastal temperatures" /></div><div className="ex-stack"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-3/4" /></div></div>
          <EmptyState icon="spark" title="No export yet">Exports you run appear here.</EmptyState>
        </section>
      </Page>
      <Dialog open={dialog} onClose={() => setDialog(false)} title="Archive this dataset?" closeLabel="Close" headerClose description="It leaves the open list. You can restore it later."
        actions={<div className="ex-row ex-end"><Button variant="secondary" data-autofocus onClick={() => setDialog(false)}>Keep</Button><Button onClick={() => setDialog(false)}>Archive</Button></div>}>
        <p className="wl-meta-text">Synthetic dialog content.</p>
      </Dialog>
      <ConfirmDialog open={confirm} destructive title="Delete this dataset?" body="This removes it from the example." confirmLabel="Delete" cancelLabel="Cancel" closeLabel="Close"
        onCancel={() => setConfirm(false)} onConfirm={() => setConfirm(false)} />
      <Toast message={toast} onDone={() => setToast(undefined)} />
    </ConsoleShell>
  );
}

const screens: Record<Screen, () => React.ReactElement> = { overview: OverviewScreen, collection: CollectionScreen, detail: DetailScreen, form: FormScreen, message: MessageScreen, states: StatesScreen, components: ComponentsScreen };

function App() {
  const [search, setSearch] = useState(currentQuery);
  const nav = readNav(search);
  // `next` is a query string ("?a=b"); it is written to the query (HTTP) or to the hash (offline file).
  const go = (next: string, how: "push" | "replace") => {
    const url = KIT.stateIn === "query" ? next + location.hash : `${location.pathname}${location.search}${stateUrl(next)}`;
    history[how === "push" ? "pushState" : "replaceState"](null, "", url);
    setSearch(next === "?" ? "" : next);
  };
  // Same-page links (menu, logo, rows, back links) navigate without reloading; anything else, and
  // modified clicks (new tab or window), keep the browser's default behaviour.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname) return;
      if (KIT.stateIn === "hash" && url.search !== location.search) return;
      if (queryOf(url) === currentQuery()) return;
      e.preventDefault();
      go(queryOf(url), "push");
    };
    const onPop = () => setSearch(currentQuery());
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    if (KIT.stateIn === "hash") window.addEventListener("hashchange", onPop);
    return () => { document.removeEventListener("click", onClick); window.removeEventListener("popstate", onPop); window.removeEventListener("hashchange", onPop); };
  }, []);
  // Each screen keeps its own state; a new screen (or item or state) starts at the top with focus on its heading.
  const screenKey = [nav.screen, nav.params.get("id") ?? "", nav.params.get("state") ?? ""].join("|");
  // The last screen given focus; repeated effect runs (React StrictMode) never move focus on first load.
  const shown = useRef(screenKey);
  useEffect(() => {
    document.title = `${SCREENS.find((s) => s.id === nav.screen)!.label} · Console example`;
    if (shown.current === screenKey) return;
    shown.current = screenKey;
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>(".ex-root h1");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, [screenKey]);

  const configChoice = nav.params.get("config");
  const [example, setExample] = useState<{ config: DesignConfig; assetBase: string | undefined }>();
  useEffect(() => {
    if (configChoice !== "example" || example) return;
    let live = true;
    loadExample().then((e) => { if (live) setExample(e); });
    return () => { live = false; };
  }, [configChoice, example]);
  // Your configuration: no assetBase, so a path without a selected file is reported and ignored (the
  // role keeps its default) and nothing is requested from the disk or the network.
  const [files, setFiles] = useState<LocalFiles>(() => new Map());
  const [problem, setProblem] = useState<string>();
  const encodedLocal = nav.params.get("local");
  const local = useMemo(() => {
    if (configChoice !== "local" || !encodedLocal) return undefined;
    try { return withFiles(decodeConfig(encodedLocal), (path) => files.get(fileName(path))?.url).config; } catch { return undefined; }
  }, [configChoice, encodedLocal, files]);
  const applied = configChoice === "example" ? example : configChoice === "local" ? { config: local, assetBase: undefined } : undefined;
  const kit: Kit = {
    files, problem, setProblem,
    addFiles: (list) => setFiles((old) => {
      const next = new Map(old);
      for (const f of Array.from(list)) next.set(f.name, { name: f.name, url: URL.createObjectURL(f) });
      return next;
    }),
    setConfig: (changes) => {
      const query = new URLSearchParams(currentQuery());
      for (const [key, value] of Object.entries(changes)) { if (value === null) query.delete(key); else query.set(key, value); }
      go(`?${query}`, "replace");
    },
  };
  // The mode is controlled by the query, so a link, a reload or the back button gives the same mode.
  const requested = nav.params.get("mode") as Mode | null;
  const mode: Mode = requested && MODES.includes(requested) ? requested : "system";
  const setMode = (next: Mode) => {
    const query = new URLSearchParams(currentQuery());
    if (next === "system") query.delete("mode"); else query.set("mode", next);
    go(`?${query}`, "replace");
  };
  const Screen = screens[nav.screen];
  // Test-only hook: icon path data can be injected by a test harness (no icon artwork ships here).
  const icons = (window as unknown as { __CONSOLE_ICONS__?: IconSet }).__CONSOLE_ICONS__;
  return (
    <NavContext.Provider value={nav}>
      <KitContext.Provider value={kit}>
        <ConsoleRoot mode={mode} onModeChange={setMode} config={applied?.config} assetBase={applied?.assetBase} icons={icons} className="ex-root">
          <Screen key={screenKey} />
        </ConsoleRoot>
      </KitContext.Provider>
    </NavContext.Provider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
