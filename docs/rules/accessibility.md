# Accessibility

Verified on the **shipped defaults and the example**, never on consumer values:
- **Contrast:** 48 colour pairs pass in both modes (`scripts/theme-tokens.mjs`).
- **Automated audit:** the Overview page and the six example screens are axe-clean for WCAG 2.2 A/AA in light and dark, over HTTP and in the offline HTML file (`tests/defaults.spec.ts`, `tests/kit-html.spec.ts`).
- **Reflow:** no horizontal overflow from 320 px.
- **Keyboard and focus:**
  - focus is visible on every control and row;
  - the Screen menu opens from the keyboard, Tab walks its links, and leaving it by Tab or Shift+Tab closes it, including at 320 px (`tests/navigation.spec.ts`, N-R1 on #7);
  - a new screen moves focus to its heading;
  - dialogs move focus inside and return it to the trigger; popovers close with Escape; tabs move with the arrow keys;
  - the collection's `/`, `j`, `k` keys.
- **Reduced motion:** honoured inside the root.

**Limits:**
- Screen-reader behaviour was not tested with real assistive technology.
- Icon slots are empty unless the consumer supplies icons; every icon is decorative or paired with text.
