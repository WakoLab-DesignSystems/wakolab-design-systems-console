/* Content-free two-column frame for multi-step sign-up or onboarding forms.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272,
 * web/src/features/RegistrationShell.tsx (standard EXTRACTION_MATRIX §5.4, Form row; review S1 on #5).
 * Kept: the DOM structure, class names and order of the frame (page, heading, layout, editorial
 * side, workspace with its form column, status area and footnote).
 * Changes for standalone use: every piece of content is a slot or prop. The registration flow
 * (screens, profile, sign-out, messages, trace references), the WakoLab brand, the appearance and
 * language controls, the editorial texts and all i18n stay in the frontend. The editorial side no
 * longer carries `data-surface="dark"`, which only Folio styles. */
import type { ReactNode, Ref } from "react";

export function RegistrationFrame({ brand, tools, eyebrow, title, lead, aside, steps, heading, headingId = "title", headingRef, description, children, status, footnote, screen }: {
  /** Header, left: a home link or logo. */
  brand?: ReactNode;
  /** Header, right: controls such as appearance or language selectors. */
  tools?: ReactNode;
  /** Page heading: small line above the title, the title, and a lead on the right. */
  eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode;
  /** Side column content (editorial text or illustration). */
  aside?: ReactNode;
  /** Above the form column, for example a Stepper. */
  steps?: ReactNode;
  /** Form column heading; focusable (tabIndex -1) so that a flow can move focus to it. */
  heading: ReactNode; headingId?: string; headingRef?: Ref<HTMLHeadingElement>;
  description?: ReactNode;
  /** The form or step content. */
  children: ReactNode;
  /** Status area under the form (for example an Alert, or an empty live region). */
  status?: ReactNode;
  /** Small print under the workspace. */
  footnote?: ReactNode;
  /** Optional marker of the current step, exposed as data-screen. */
  screen?: string;
}) {
  return (
    <div className="w-full max-w-page mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <header className="flex flex-wrap items-center justify-between gap-6 py-6">
        {brand}
        {tools && <div className="flex flex-wrap items-end gap-3">{tools}</div>}
      </header>
      <main className="registration-page" data-screen={screen}>
        <div className="page-heading flex flex-wrap justify-between gap-6 py-8">
          <div>
            {eyebrow !== undefined && <p className="text-brand font-medium mb-3">{eyebrow}</p>}
            <h1>{title}</h1>
          </div>
          {lead !== undefined && <p className="text-muted max-w-sm self-end">{lead}</p>}
        </div>
        <section className="registration-layout">
          <aside className="registration-editorial">{aside}</aside>
          <div className="registration-workspace">
            {steps}
            <section className="max-w-form mx-auto" aria-labelledby={headingId}>
              <h2 id={headingId} ref={headingRef} tabIndex={-1}>{heading}</h2>
              {description !== undefined && <p className="text-muted mt-3 mb-8">{description}</p>}
              <div className="space-y-4 mt-6">{children}</div>
              <div className="mt-6">{status}</div>
            </section>
            {footnote !== undefined && <p className="mt-8 pt-6 border-t border-border text-muted text-sm">{footnote}</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
