/* Runtime font registration for configured font roles. Original code implementing the standard's
 * isolation rule for fonts (EXTRACTION_MATRIX §4 Fonts, R2, at 6dc2a7a):
 *  - one internal family per complete face set (all files with their descriptors), never the
 *    consumer's `family` label;
 *  - one FontFace per file under that family, cached and reference-counted per family;
 *  - a registration is deleted only when no root uses its family any more. */
import type { FontFile } from "./config";

type ResolvedFile = FontFile & { url: string };
interface Entry { count: number; faces: FontFace[] }
const registry = new Map<string, Entry>();

function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Internal family name for a face set: the hash covers every file's resolved URL and descriptors
 *  in a canonical order, so a different set (even by one face) is a different family. */
export function familyForFaceSet(files: ResolvedFile[]): string {
  const canon = files
    .map((f) => [f.url, f.weight ?? "", f.style ?? "", f.stretch ?? "", f.unicodeRange ?? ""])
    .sort((a, b) => (a.join("\u0000") < b.join("\u0000") ? -1 : 1));
  return `wds-console-font-${fnv1a(JSON.stringify(canon))}`;
}

/** Registers (or reuses) the face set and returns its internal family. */
export function acquireFaceSet(files: ResolvedFile[], onError: (url: string) => void): string {
  const family = familyForFaceSet(files);
  const entry = registry.get(family);
  if (entry) { entry.count++; return family; }
  const faces = files.map((f) => {
    const face = new FontFace(family, `url(${JSON.stringify(f.url)})`, {
      ...(f.weight ? { weight: f.weight } : {}), ...(f.style ? { style: f.style } : {}),
      ...(f.stretch ? { stretch: f.stretch } : {}), ...(f.unicodeRange ? { unicodeRange: f.unicodeRange } : {}),
    });
    document.fonts.add(face);
    face.loaded.catch(() => onError(f.url));
    return face;
  });
  registry.set(family, { count: 1, faces });
  return family;
}

/** Releases one reference; the faces are deleted only when no root uses the family. */
export function releaseFaceSet(family: string): void {
  const entry = registry.get(family);
  if (!entry) return;
  entry.count--;
  if (entry.count > 0) return;
  for (const face of entry.faces) document.fonts.delete(face);
  registry.delete(family);
}

/** For tests and diagnostics: families currently registered with their reference counts. */
export function registeredFaceSets(): Record<string, number> {
  return Object.fromEntries([...registry].map(([k, v]) => [k, v.count]));
}
