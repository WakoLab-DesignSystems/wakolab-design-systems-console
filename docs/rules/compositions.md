# Compositions

| Composition | Slots | Invariants |
| --- | --- | --- |
| `ConsoleShell` + `ConsoleHeader` | logo, search, tools | Sticky top bar with a bottom border; search in the bar; tools at the end |
| `CollectionLayout` + `CollectionSection` | title, count, rail, hint, mobile filters, sections | From 64em a sticky filter rail beside the content; below, a toggled chip panel; a key-hint line |
| `CollectionTable` + `RowContent` | column headings; per row: title, summary, three metadata cells | Dense rows of at least 44 px; the focused row shows `›` in `accent` |
| `CollectionKeys` | search and item references, scope | `/` focuses search, `j`/`k` move between items, Enter opens the focused link (native); ignored in text fields, with modifiers and under a modal dialog; `scope="page"` on one root only |
| `DetailLayout` + `DetailSection` / `DetailBody` | back, path, title, lead, side, body | Head and body beside a side column with a panel and facts |
| `FormPage` | back, title, lead, form | Single column form frame |
| `MessagePage` | icon, title, body, action | Message in the page frame |
| `RegistrationFrame` | brand, tools, heading texts, aside, steps, form, status, footnote | A content-free two-column frame for sign-up or onboarding forms |
