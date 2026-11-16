/* Console root context. Original code for standalone use (replaces the document-level
 * ThemeProvider of WakoLab/wakolab-front web/src/theme/ThemeProvider.tsx at
 * e492bec9ced8893d6940879aa8186ac75a48a272; standard EXTRACTION_MATRIX §4 Provider). */
import { createContext, useContext, type RefObject } from "react";

export type Mode = "light" | "dark" | "system";
export type ResolvedMode = "light" | "dark";

export interface ResolvedLogo {
  mark?: string;
  wordmark?: string | { light?: string; dark?: string };
  alt?: string;
}

export interface ConsoleContextValue {
  /** The requested mode (light, dark or system). */
  mode: Mode;
  /** The mode in effect. */
  resolvedMode: ResolvedMode;
  setMode: (mode: Mode) => void;
  /** Logo files from the configuration, resolved against `assetBase`. */
  logo: ResolvedLogo;
  /** The root element: listeners and lookups stay inside it. */
  rootRef: RefObject<HTMLDivElement | null>;
}

export const ConsoleContext = createContext<ConsoleContextValue | null>(null);

export function useConsole(): ConsoleContextValue {
  const value = useContext(ConsoleContext);
  if (!value) throw new Error("Console components must be rendered inside <ConsoleRoot>.");
  return value;
}
