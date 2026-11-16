// Neutral Console example with synthetic data. Original code.
// It imports the BUILT package ("wakolab-design-systems-console" is aliased to dist/ by
// examples/vite.config.ts), like an external project would.
// Query parameters: screen=collection|detail|form|message|states|components, mode=light|dark|system,
// config=example (loads /design/design-config.json with assetBase "/design/").
import "wakolab-design-systems-console/console.css";
import "./example.css";
import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Alert, Badge, BackLink, Button, Card, Checkbox, ChoiceGroup, CodeField, CollectionKeys, CollectionLayout, CollectionSection,
  CollectionStatus, CollectionTable, ConfirmDialog, ConnectionRow, ConsoleHeader, ConsoleRoot, ConsoleShell, Cover, DetailLayout,
  DetailSection, Dialog, EmptyState, FilterChips, FilterTree, FormPage, IconButton, ItemLink, KeyValueList, LoadMore, LoadingState,
  LogoSlot, MessagePage, ModeMenu, Page, Panel, Popover, ProblemState, RowContent, SearchField, Select, Skeleton, Stepper, TabPanel,
  Tabs, TextField, Toast, ToggleChip, ToolButton, type DesignConfig, type FilterItem, type IconSet, type Mode,
} from "wakolab-design-systems-console";

const params = new URLSearchParams(location.search);
type Screen = "collection" | "detail" | "form" | "message" | "states" | "components";
const screen = (params.get("screen") as Screen) || "collection";

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

function Header({ searchRef, query, setQuery }: { searchRef?: React.RefObject<HTMLInputElement | null>; query: string; setQuery: (q: string) => void }) {
  return (
    <ConsoleHeader
      logo={<LogoSlot label="Field Lab" accessibleName="Field Lab, home" href="?screen=collection" />}
      searchRef={searchRef}
      search={{ label: "Search datasets", placeholder: "Dataset name or summary", clearLabel: "Clear search", value: query, onChange: setQuery }}
      tools={<>
        <ModeMenu compact label="Appearance" modeLabel="Mode" labels={{ light: "Light", dark: "Dark", system: "System" }} />
        <ToolButton icon="globe" label="Language" value="English" compact valueLang="en" />
        <Button id="sign-in" className="wl-signin">Sign in</Button>
      </>}
    />
  );
}

function CollectionScreen() {
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
                  <ItemLink href={`?screen=detail&id=${i.id}`} itemId={i.id} className="wl-row">
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
  const item = ITEMS.find((i) => i.id === params.get("id")) ?? ITEMS[0];
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"about" | "files">("about");
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<string>();
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <DetailLayout back={<BackLink href="?screen=collection" label="Back to datasets" />} path={`datasets / ${item.id}`} title={item.name} lead={item.summary} leadLang="en"
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
  const [query, setQuery] = useState("");
  const [name, setName] = useState("fl");
  const [error, setError] = useState<string>();
  const [view, setView] = useState("rows");
  return (
    <ConsoleShell header={<Header query={query} setQuery={setQuery} />}>
      <FormPage back={<BackLink href="?screen=collection" label="Back to datasets" />} title="Settings" lead="Synthetic settings form. Nothing is saved.">
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

const screens: Record<Screen, () => React.ReactElement> = { collection: CollectionScreen, detail: DetailScreen, form: FormScreen, message: MessageScreen, states: StatesScreen, components: ComponentsScreen };

function App() {
  const [config, setConfig] = useState<DesignConfig | undefined>();
  useEffect(() => {
    if (params.get("config") !== "example") return;
    fetch("/design/design-config.json").then((r) => r.json()).then(setConfig);
  }, []);
  const Screen = screens[screen] ?? CollectionScreen;
  // Test-only hook: icon path data can be injected by a test harness (no icon artwork ships here).
  const icons = (window as unknown as { __CONSOLE_ICONS__?: IconSet }).__CONSOLE_ICONS__;
  return (
    <ConsoleRoot defaultMode={(params.get("mode") as Mode) || "system"} config={config} assetBase="/design/" icons={icons} className="ex-root">
      <Screen />
    </ConsoleRoot>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
