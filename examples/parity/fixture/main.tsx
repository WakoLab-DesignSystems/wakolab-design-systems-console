// Shared parity fixture (standard EXTRACTION_MATRIX §8; review R4 and S1 on #5). The same screens are
// rendered by two adapters that export the same names ("parity-sys"):
//   examples/parity/fixture/console-sys.tsx      the built Console package (candidate)
//   examples/parity/front-baseline/front-sys.tsx  the WakoLab frontend's own modules at e492bec (baseline,
//                                                 built only from a separate read-only checkout)
// ?screen=form|components|confirm|registration  &mode=light|dark. Original code.
import { createRoot } from "react-dom/client";
import { useState, type ReactNode } from "react";
import * as Sys from "parity-sys";
import { components as C, form as F, registration as R } from "./texts";

const params = new URLSearchParams(location.search);
const screen = params.get("screen") ?? "form";
const mode = (params.get("mode") as "light" | "dark") || "light";
const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 } as const;
const stack = { display: "grid", gap: 16, alignContent: "start", minWidth: 0 } as const;

function FormScreen() {
  const [access, setAccess] = useState("read");
  return (
    <div className="wl-home wl-console">
      <Sys.FormPage title={F.title} lead={F.lead}>
        <form noValidate className="wl-form" onSubmit={(e) => e.preventDefault()}>
          <Sys.TextField label={F.name} hint={F.nameHint} defaultValue="Sam Rivera" />
          <Sys.TextField label={F.email} type="email" defaultValue="sam@" error={F.emailError} />
          <div className="wl-form-row">
            <Sys.Select label={F.team} defaultValue="Design">{F.teams.map((t) => <option key={t}>{t}</option>)}</Sys.Select>
            <Sys.TextField label={F.role} hint={F.roleHint} />
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="about" style={{ fontWeight: 500 }}>{F.about}</label>
            <textarea id="about" className="wl-textarea" rows={4} defaultValue={F.aboutValue} aria-describedby="about-hint" />
            <p id="about-hint" className="text-sm text-muted">{F.aboutHint}</p>
          </div>
          <Sys.ChoiceGroup label={F.access} value={access} options={F.accessOptions} onChange={setAccess} />
          <Sys.Checkbox label={F.terms} defaultChecked />
          <Sys.Alert tone="info">{F.notice}</Sys.Alert>
          <div style={row}><Sys.Button type="submit">{F.submit}</Sys.Button><Sys.Button variant="secondary" type="button">{F.cancel}</Sys.Button></div>
        </form>
      </Sys.FormPage>
    </div>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section style={stack}><h2 className="wl-label">{title}</h2>{children}</section>;
}
function ComponentsScreen() {
  const [tab, setTab] = useState<"a" | "b">("a");
  const [choice, setChoice] = useState("weekly");
  return (
    <div className="wl-home wl-console">
      <main className="wl-page" style={{ display: "grid", gap: 32 }}>
        <Section title={C.buttons}>
          <div style={row}>
            <Sys.Button>{C.primary}</Sys.Button><Sys.Button variant="secondary">{C.secondary}</Sys.Button>
            <Sys.Button variant="ghost">{C.ghost}</Sys.Button><Sys.Button variant="destructive">{C.destructive}</Sys.Button>
          </div>
          <div style={row}>
            <Sys.Button size="sm">{C.small}</Sys.Button><Sys.Button size="lg">{C.large}</Sys.Button>
            <Sys.Button busy>{C.busy}</Sys.Button><Sys.Button disabled>{C.disabled}</Sys.Button>
            <Sys.IconButton label={C.iconButton}><Sys.Icon name="x" /></Sys.IconButton>
          </div>
        </Section>
        <Section title={C.fields}>
          <div style={{ ...stack, maxWidth: 480 }}>
            <Sys.TextField label={C.text} hint={C.hint} defaultValue={C.textValue} />
            <Sys.TextField label={C.invalid} error={C.invalidError} defaultValue="ab" />
            <Sys.CodeField label={C.code} defaultValue={C.codeValue} />
            <Sys.Select label={C.select} defaultValue="Members">{C.selectOptions.map((o) => <option key={o}>{o}</option>)}</Sys.Select>
            <Sys.ChoiceGroup label={C.choice} value={choice} options={C.choices} onChange={setChoice} />
            <Sys.Checkbox label={C.check} />
            <Sys.SearchField label={C.search} value={C.searchValue} onChange={() => {}} clearLabel={C.clear} />
          </div>
        </Section>
        <Section title={C.chips}>
          <div style={row}>
            <Sys.ToggleChip pressed onClick={() => {}} note={C.chipNote}>{C.chipA}</Sys.ToggleChip>
            <Sys.ToggleChip pressed={false} onClick={() => {}}>{C.chipB}</Sys.ToggleChip>
            <Sys.Badge>{C.badge}</Sys.Badge>
          </div>
        </Section>
        <Section title={C.feedback}>
          <div style={{ ...stack, maxWidth: 640 }}>
            <Sys.Alert tone="info">{C.info}</Sys.Alert><Sys.Alert tone="success">{C.success}</Sys.Alert>
            <Sys.Alert tone="warning">{C.warning}</Sys.Alert><Sys.Alert tone="error">{C.error}</Sys.Alert>
            <Sys.Card>{C.card}</Sys.Card>
            <Sys.Stepper steps={C.steps} current={1} />
            <Sys.ConnectionRow name={C.connection} status={C.connectionStatus} description={C.connectionDescription} />
            <Sys.Tabs label={C.tabs} idBase="fx-tabs" value={tab} onChange={setTab} tabs={[{ id: "a", label: C.tabA }, { id: "b", label: C.tabB }]} />
            <Sys.TabPanel idBase="fx-tabs" tab={tab}><p>{C.tabContent}</p></Sys.TabPanel>
            <Sys.EmptyState icon="spark" title={C.empty} action={<Sys.Button variant="secondary">{C.emptyAction}</Sys.Button>}>{C.emptyBody}</Sys.EmptyState>
            <div style={{ display: "grid", gap: 8 }}><Sys.Skeleton className="h-5 w-1/2" /><Sys.Skeleton className="h-4 w-3/4" /></div>
          </div>
        </Section>
      </main>
    </div>
  );
}
function ConfirmScreen() {
  return (
    <>
      <ComponentsScreen />
      <Sys.ConfirmDialog open destructive title={C.confirmTitle} body={C.confirmBody} confirmLabel={C.confirm} cancelLabel={C.cancel} closeLabel={C.close} onConfirm={() => {}} onCancel={() => {}} />
    </>
  );
}
function RegistrationScreen() {
  return (
    <Sys.Registration texts={R}>
      <Sys.TextField label={R.email} type="email" defaultValue="sam@example.com" />
      <Sys.Button>{R.continue}</Sys.Button>
    </Sys.Registration>
  );
}
const screens: Record<string, () => ReactNode> = { form: () => <FormScreen />, components: () => <ComponentsScreen />, confirm: () => <ConfirmScreen />, registration: () => <RegistrationScreen /> };
createRoot(document.getElementById("app")!).render(<Sys.Root mode={mode}>{(screens[screen] ?? screens.form)()}</Sys.Root>);
