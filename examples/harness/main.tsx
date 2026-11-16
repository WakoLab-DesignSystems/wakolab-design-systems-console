// Test harness: mounts Console roots on demand so that tests can check configuration and
// isolation (standard INDEPENDENCE_CHECK §3–§4). Original code; synthetic content only.
// ?nocss=1 skips the Console stylesheet (used to compare host styles with and without it).
// ?pagekeys=<id> binds the keyboard layer of root <id> with scope "page" (the others use "root").
import { createRoot, type Root } from "react-dom/client";
import { useRef, useState } from "react";
import {
  Button, CollectionKeys, ConsoleRoot, Dialog, ItemLink, LogoSlot, Popover, registeredFaceSets, SearchField,
  type ConsoleRootProps, type Diagnostic,
} from "wakolab-design-systems-console";

const params = new URLSearchParams(location.search);
const pageKeys = params.get("pagekeys");
const ready = params.get("nocss") ? Promise.resolve() : import("wakolab-design-systems-console/console.css");

function Content({ id }: { id: string }) {
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  return (
    <div className="wl-home wl-console">
      <header className="wl-topbar"><LogoSlot label={`Root ${id}`} /></header>
      <main className="wl-page" id={`${id}-main`}>
        <p className="wl-lead" id={`${id}-lead`}>Synthetic content of root {id}.</p>
        <span id={`${id}-ui`} style={{ fontFamily: "var(--wl-font-ui)" }}>ui text Wg</span>
        <span id={`${id}-prose`} style={{ fontFamily: "var(--wl-font-prose)" }}>prose text Wg</span>
        <Button id={`${id}-primary`}>Primary</Button>
        <Button id={`${id}-ghost`} variant="ghost">Ghost</Button>
        <a href="#x" id={`${id}-link`} className="wl-back">Link</a>
        <div className="wl-skeleton" id={`${id}-skeleton`} style={{ height: 12 }} />
        <Popover label={`Outer ${id}`} align="start" trigger={(p) => <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id={`${id}-pop`} type="button" className="wl-tool">Outer</button>}>
          {() => (
            <div className="grid gap-1">
              <button type="button" id={`${id}-pop-item`} className="wl-option">Item</button>
              <Popover label={`Inner ${id}`} align="start" trigger={(p) => <button {...p} ref={p.ref as React.Ref<HTMLButtonElement>} id={`${id}-pop-inner`} type="button" className="wl-tool">Inner</button>}>
                {() => <button type="button" id={`${id}-pop-inner-item`} className="wl-option">Inner item</button>}
              </Popover>
            </div>
          )}
        </Popover>
        <DialogDemo id={id} />
        <SearchField id={`${id}-search`} inputRef={search} label="Search" value="" onChange={() => {}} clearLabel="Clear" />
        <CollectionKeys searchRef={search} itemsRef={list} scope={pageKeys === id ? "page" : "root"} />
        <ul ref={list}>{["one", "two", "three"].map((x) => <li key={x}><ItemLink href={`#${x}`} itemId={`${id}-${x}`} className="wl-row">{x}</ItemLink></li>)}</ul>
      </main>
    </div>
  );
}
function DialogDemo({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button id={`${id}-open-dialog`} variant="secondary" onClick={() => setOpen(true)}>Dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Dialog ${id}`} closeLabel="Close" headerClose
        actions={<Button id={`${id}-dialog-keep`} data-autofocus variant="secondary" onClick={() => setOpen(false)}>Keep</Button>}>
        <p>Dialog content</p>
      </Dialog>
    </>
  );
}

const roots = new Map<string, { root: Root; props: Partial<ConsoleRootProps> }>();
const diagnostics: (Diagnostic & { id: string })[] = [];
function render(id: string) {
  const entry = roots.get(id)!;
  entry.root.render(
    <ConsoleRoot {...entry.props} id={`root-${id}`} onDiagnostic={(d) => diagnostics.push({ id, ...d })}>
      <Content id={id} />
    </ConsoleRoot>,
  );
}
const api = {
  ready,
  mount(id: string, slot: string, props: Partial<ConsoleRootProps> = {}) {
    const root = createRoot(document.getElementById(slot)!);
    roots.set(id, { root, props }); render(id);
  },
  update(id: string, props: Partial<ConsoleRootProps>) { roots.get(id)!.props = props; render(id); },
  unmount(id: string) { roots.get(id)?.root.unmount(); roots.delete(id); },
  faceSets: () => registeredFaceSets(),
  diagnostics,
};
(window as unknown as { harness: typeof api }).harness = api;
