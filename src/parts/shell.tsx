/* Neutral shell parts.
 * Adapted from WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272,
 * web/src/features/catalog/parts.tsx: Brand (variant "prompt"), the `.wl-tool` trigger markup of
 * AppearanceMenu/LanguageMenu/AccountArea, and the mode part of AppearanceMenu
 * (standard EXTRACTION_MATRIX §5.3, §5.7 M3).
 * Changes for standalone use:
 *  - Brand becomes a logo slot: without logo files the text fallback is identical to the source
 *    (`›` prompt glyph and the label); with files it renders the configured mark and/or wordmark.
 *    The hard-coded product name is replaced by the `label` prop.
 *  - Tool triggers take their icon, label and value as props (no i18n, theme list or account logic).
 *  - The mode menu takes its labels as props and controls the Console root's mode only.
 */
import { useId, type ReactNode, type Ref } from "react";
import { Popover } from "../components";
import { Icon, type IconName } from "../components/icons";
import { useConsole } from "../root/context";
import type { Mode } from "../root/context";

/** Logo slot (source: Brand, variant "prompt"). */
export function LogoSlot({ label, accessibleName, href = "./", onHome }: {
  /** Product label shown by the text fallback, and the default accessible name. */
  label: string;
  /** Accessible name of the link; defaults to the configured `logo.alt`, then to `label`. */
  accessibleName?: string;
  href?: string; onHome?: () => void;
}) {
  const { logo, resolvedMode } = useConsole();
  const name = accessibleName ?? logo.alt ?? label;
  const word = logo.wordmark ? (typeof logo.wordmark === "string" ? logo.wordmark : logo.wordmark[resolvedMode]) : undefined;
  const hasLogo = Boolean(logo.mark || word);
  return (
    <a href={href} className={`wl-brand wl-brand--prompt${hasLogo ? " wl-brand--logo" : ""}${logo.mark ? " wl-brand--has-mark" : ""}`} aria-label={name}
      onClick={(e) => { if (!onHome) return; e.preventDefault(); onHome(); }}>
      {hasLogo ? (
        <>
          {logo.mark && <img className="wl-logo-mark" src={logo.mark} alt="" />}
          {word && <img className="wl-logo-wordmark" src={word} alt="" />}
        </>
      ) : (
        <>
          <span aria-hidden="true" className="wl-prompt">›</span>
          <span aria-hidden="true">{label}</span>
        </>
      )}
    </a>
  );
}

/** Header tool trigger (source: `.wl-tool` buttons of the header menus). */
export function ToolButton({ icon, label, value, compact, valueLang, ...rest }: {
  icon?: IconName; label: string; value?: ReactNode; compact?: boolean; valueLang?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <button type="button" className="wl-tool" {...rest}>
      {icon && <Icon name={icon} />}<span className={compact ? "sr-only" : ""}>{label}</span>
      {value !== undefined && <span className="wl-tool-value" lang={valueLang}>{value}</span>}
    </button>
  );
}

/** Light / dark / system menu for the Console root (source: the mode fieldset of AppearanceMenu). */
export function ModeMenu({ label, modeLabel, labels, compact, value }: {
  label: string; modeLabel: string; labels: Record<Mode, string>; compact?: boolean; value?: ReactNode;
}) {
  const { mode, setMode } = useConsole();
  const name = useId();
  return (
    <Popover label={label} trigger={(p) => (
      <button {...p} ref={p.ref as Ref<HTMLButtonElement>} type="button" className="wl-tool">
        <Icon name="palette" /><span className={compact ? "sr-only" : ""}>{label}</span>
        <span className="wl-tool-value">{value ?? labels[mode]}</span>
      </button>
    )}>
      {() => (
        <fieldset className="grid gap-1">
          <legend className="wl-label mb-1">{modeLabel}</legend>
          <div className="wl-segmented">
            {(["light", "dark", "system"] as Mode[]).map((m) => (
              <label key={m} className="wl-option">
                <input type="radio" name={name + "-mode"} checked={mode === m} onChange={() => setMode(m)} />
                <Icon name={m === "light" ? "sun" : m === "dark" ? "moon" : "spark"} size={16} />
                <span>{labels[m]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </Popover>
  );
}
