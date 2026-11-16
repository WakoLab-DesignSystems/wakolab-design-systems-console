// Candidate adapter of the parity fixture: the built Console package. Original code.
// The registration screen fills RegistrationFrame's slots with the same content the frontend's
// RegistrationShell hard-codes (brand, appearance and language selects, editorial side), as a
// consuming app would; that slot content and its utilities (fixture.css) are not part of Console.
import "wakolab-design-systems-console/console.css";
import "./fixture.css";
import type { ReactNode } from "react";
import { ConsoleRoot, FormPage as ConsoleFormPage, RegistrationFrame, Select, Stepper, useConsole, type IconSet } from "wakolab-design-systems-console";
import type { registration } from "./texts";
export {
  Alert, Badge, Button, Card, Checkbox, ChoiceGroup, CodeField, ConfirmDialog, ConnectionRow, EmptyState, Icon, IconButton,
  Popover, SearchField, Select, Skeleton, Stepper, TabPanel, Tabs, TextField, Toast, ToggleChip,
} from "wakolab-design-systems-console";

export function Root({ mode, children }: { mode: "light" | "dark"; children: ReactNode }) {
  const icons = (window as unknown as { __CONSOLE_ICONS__?: IconSet }).__CONSOLE_ICONS__;
  return <ConsoleRoot mode={mode} icons={icons}>{children}</ConsoleRoot>;
}
export function FormPage({ title, lead, children }: { title: ReactNode; lead: ReactNode; children: ReactNode }) {
  return <ConsoleFormPage title={title} lead={lead}>{children}</ConsoleFormPage>;
}
export function Registration({ texts: t, children }: { texts: typeof registration; children: ReactNode }) {
  // The frontend's appearance select shows the current mode; so does this slot content.
  const { resolvedMode } = useConsole();
  return (
    <RegistrationFrame screen="email"
      brand={<a href="/" className="inline-flex items-center gap-3 font-bold text-xl no-underline"><span aria-hidden="true" className="grid place-content-center size-10 rounded-control bg-brand text-on-brand">W</span>WakoLab</a>}
      tools={<>
        <div className="appearance-controls flex flex-wrap gap-3">
          <Select id="theme" label={t.theme} defaultValue="console"><option value="console">Console</option><option value="folio">Folio</option><option value="marquee">Marquee</option></Select>
          <Select id="appearance-mode" label={t.mode} value={resolvedMode} onChange={() => {}}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></Select>
        </div>
        <Select id="language" label={t.language} defaultValue="en"><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option><option value="zh-Hans">简体中文</option><option value="hi">हिन्दी</option></Select>
      </>}
      eyebrow={t.community} title={t.page} lead={t.pageSub}
      aside={<>
        <div><p className="editorial-eyebrow mb-8">{t.community}</p><h2 className="text-4xl leading-tight">{t.hero}</h2><p className="mt-6">{t.heroSub}</p></div>
        <div aria-hidden="true" className="editorial-art"><span className="editorial-monogram">W</span></div>
        <p>{t.humans}</p>
      </>}
      steps={<Stepper steps={[t.step1, t.step2]} current={0} />}
      heading={t.emailTitle} description={t.emailDescription}
      status={<p id="status" role="status" />}
      footnote={t.safe}>
      {children}
    </RegistrationFrame>
  );
}
