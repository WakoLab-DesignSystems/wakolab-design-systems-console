// Candidate screens for the visual parity check (standard EXTRACTION_MATRIX §8 at 6dc2a7a): the
// same synthetic texts as the frontend baselines, rendered with the built Console package.
// ?screen=collection|detail|notFound|message|loading|unavailable|dialog  &mode=light|dark
// Icon path data is not part of this repository (EXTRACTION_MATRIX §10, E4): the capture script
// may inject a set at run time through window.__CONSOLE_ICONS__. Original code.
import "wakolab-design-systems-console/console.css";
import "./parity.css";
import { createRoot } from "react-dom/client";
import { useRef, useState, type ReactNode } from "react";
import {
  BackLink, Button, CollectionKeys, CollectionLayout, CollectionSection, CollectionStatus, CollectionTable, ConsoleHeader,
  ConsoleRoot, ConsoleShell, DetailLayout, DetailSection, Dialog, FilterTree, Icon, ItemLink, KeyValueList, LogoSlot,
  MessagePage, Panel, Popover, RowContent, ToolButton, type IconSet, type Mode,
} from "wakolab-design-systems-console";
import { detail, filters, rows, text } from "./fixtures";

const params = new URLSearchParams(location.search);
const screen = params.get("screen") ?? "collection";
const mode = (params.get("mode") as Mode) || "light";

function Tool({ icon, label, value, compact }: { icon: "palette" | "globe"; label: string; value?: string; compact?: boolean }) {
  return (
    <Popover label={label} trigger={(p) => <ToolButton {...p} icon={icon} label={label} value={value} compact={compact ?? true} />}>
      {() => null}
    </Popover>
  );
}
function Shell({ children, searchRef }: { children: ReactNode; searchRef?: React.RefObject<HTMLInputElement | null> }) {
  const [q, setQ] = useState("");
  return (
    <>
      <a href="#main" className="wl-skip">{text.skip}</a>
      <ConsoleShell header={
        <ConsoleHeader logo={<LogoSlot label={text.brand} accessibleName={text.brandName} />} searchRef={searchRef}
          search={{ label: text.searchLabel, placeholder: text.searchPlaceholder, clearLabel: text.clear, value: q, onChange: setQ }}
          tools={<><Tool icon="palette" label={text.appearance} value={text.appearanceValue} /><Tool icon="globe" label={text.language} />
            <Button id="sign-in" className="wl-signin">{text.signIn}</Button></>} />
      }>{children}</ConsoleShell>
    </>
  );
}
function Collection({ state }: { state: "ready" | "loading" | "unavailable" }) {
  const search = useRef<HTMLInputElement>(null), list = useRef<HTMLUListElement>(null);
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <Shell searchRef={search}>
      <CollectionKeys searchRef={search} itemsRef={list} scope="page" />
      <CollectionLayout title={text.title} count={state === "ready" ? text.count : ""} hint={text.hint}
        rail={<FilterTree items={filters} value={cat} onChange={(v) => setCat(v)} label={text.category} allLabel={text.all} />}
        mobileFilters={{ label: text.category, open, onToggle: () => setOpen(!open), content: null }}>
        <CollectionSection label={text.sectionLabel} lead={text.lead}>
          {state === "loading" ? <CollectionStatus state={{ status: "loading", label: text.loading }} />
            : state === "unavailable" ? <CollectionStatus state={{ status: "unavailable", title: text.unavailableTitle, body: text.unavailableBody, retryLabel: text.retry, onRetry: () => {} }} />
            : (
              <CollectionTable columns={text.columns} listRef={list} listId="catalog-list">
                {rows.map((r, i) => (
                  <li key={r.slug}>
                    <ItemLink href={`?screen=detail&slug=${r.slug}`} itemId={r.slug} className="wl-row">
                      <RowContent title={r.name} summary={r.summary} summaryLang={r.lang} index={i}
                        second={<span className="wl-path">{r.path}</span>}
                        third={<span className="wl-meta"><Icon name={r.codeIcon} size={16} />{r.code}</span>}
                        fourth={<span className="wl-meta">{r.access}</span>} />
                    </ItemLink>
                  </li>
                ))}
              </CollectionTable>
            )}
        </CollectionSection>
      </CollectionLayout>
    </Shell>
  );
}
function Detail() {
  return (
    <Shell>
      <DetailLayout back={<BackLink id="skip-profile" label={text.back} />} path={detail.path} title={detail.title} lead={detail.lead} leadLang="en"
        side={<>
          <Panel>
            <div className="wl-join grid gap-2">
              <p className="wl-join-title">{detail.joinTitle}</p>
              <p className="wl-meta-text">{detail.join}</p>
              <p className="wl-meta-text wl-with-icon"><Icon name="clock" size={18} />{detail.joinNote}</p>
            </div>
            <div className="wl-access">
              <Icon name="repo" className="text-muted" />
              <div><p className="font-semibold">{detail.accessTitle}</p><p className="wl-meta-text">{detail.access}</p></div>
            </div>
          </Panel>
          <KeyValueList items={detail.facts.map((f) => ({ key: f.key, value: "lang" in f ? <span lang={f.lang}>{f.value}</span> : f.value }))} />
        </>}
        body={
          <DetailSection id="about-h" heading={detail.about}>
            <p lang="en" className="wl-prose">{detail.body}</p>
            <p className="wl-meta-text wl-with-icon"><Icon name="info" size={18} />{detail.note}</p>
          </DetailSection>
        } />
    </Shell>
  );
}
function Message({ icon, title, body }: { icon: "search" | "doc"; title: string; body: string }) {
  return <Shell><MessagePage icon={icon} title={title} body={body} action={<Button variant="secondary">{text.back}</Button>} /></Shell>;
}
function WithDialog() {
  return (
    <>
      <Collection state="ready" />
      <Dialog open onClose={() => {}} title={text.dialogTitle} closeLabel={text.close} headerClose description={text.dialogBody}
        actions={<Button data-autofocus>{text.dialogAction}</Button>}>{null}</Dialog>
    </>
  );
}
const screens: Record<string, () => ReactNode> = {
  collection: () => <Collection state="ready" />, loading: () => <Collection state="loading" />, unavailable: () => <Collection state="unavailable" />,
  detail: () => <Detail />, notFound: () => <Message icon="search" title={text.notFoundTitle} body={text.notFoundBody} />,
  message: () => <Message icon="doc" title={text.proposeTitle} body={text.proposeBody} />, dialog: () => <WithDialog />,
};
const icons = (window as unknown as { __CONSOLE_ICONS__?: IconSet }).__CONSOLE_ICONS__;
createRoot(document.getElementById("app")!).render(
  <ConsoleRoot mode={mode} icons={icons}>{(screens[screen] ?? screens.collection)()}</ConsoleRoot>,
);
