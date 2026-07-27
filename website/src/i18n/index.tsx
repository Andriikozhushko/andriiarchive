/**
 * Site i18n — the same seven languages as the desktop app, sharing its
 * localStorage key ("andrii.lang") so the site and the app agree on language.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteDict } from "./types";
import ru from "./ru";
import en from "./en";
import uk from "./uk";
import de from "./de";
import fr from "./fr";
import es from "./es";
import hy from "./hy";

export const LANGS = [
  { code: "en", native: "English" },
  { code: "uk", native: "Українська" },
  { code: "ru", native: "Русский" },
  { code: "de", native: "Deutsch" },
  { code: "fr", native: "Français" },
  { code: "es", native: "Español" },
  { code: "hy", native: "Հայերեն" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];

const DICTS: Record<Lang, SiteDict> = { en, uk, ru, de, fr, es, hy };
const STORE_KEY = "andrii.lang";

/** URL path segment per language (Ukrainian gets the colloquial /ua). */
export const PATH_FOR: Record<Lang, string> = {
  en: "en", uk: "ua", ru: "ru", de: "de", fr: "fr", es: "es", hy: "hy",
};

/** "/ru" etc. — the canonical path for a language. */
export function langPath(l: Lang): string {
  return `/${PATH_FOR[l]}`;
}

function isLang(x: string): x is Lang {
  return LANGS.some(l => l.code === x);
}

/** Parse a language out of a pathname ("/ru", "/ua/", "/en"). */
export function langFromPath(pathname: string): Lang | null {
  const seg = pathname.replace(/^\/+/, "").split("/")[0].toLowerCase();
  if (!seg) return null;
  if (seg === "ua") return "uk";
  return isLang(seg) ? seg : null;
}

/** URL path → stored preference → system language → English. */
export function detectLang(): Lang {
  const fromPath = langFromPath(window.location.pathname);
  if (fromPath) return fromPath;
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored && isLang(stored)) return stored;
  } catch { /* ignore */ }
  const sys = (navigator.language || "en").slice(0, 2).toLowerCase();
  return isLang(sys) ? sys : "en";
}

/** Fill {var} placeholders. */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_m, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Pick the right plural form of "year": slavic three-form or simple one/many. */
export function yearWord(lang: Lang, forms: readonly string[], n: number): string {
  if (lang === "ru" || lang === "uk") {
    const m100 = n % 100, m10 = n % 10;
    if (m100 >= 11 && m100 <= 14) return forms[2];
    if (m10 === 1) return forms[0];
    if (m10 >= 2 && m10 <= 4) return forms[1];
    return forms[2];
  }
  return n === 1 ? forms[0] : forms[2];
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  L: SiteDict;
}

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORE_KEY, l); } catch { /* ignore */ }
    try {
      window.history.pushState({}, "", langPath(l) + window.location.hash);
    } catch { /* file:// etc. */ }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /* Normalize the URL to the language path on load, follow back/forward. */
  useEffect(() => {
    try {
      if (langFromPath(window.location.pathname) !== lang) {
        window.history.replaceState({}, "", langPath(lang) + window.location.hash);
      }
    } catch { /* ignore */ }
    const onPop = () => {
      const l = langFromPath(window.location.pathname);
      if (l) setLangState(l);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <I18nCtx.Provider value={{ lang, setLang, L: DICTS[lang] }}>
      {children}
    </I18nCtx.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n outside I18nProvider");
  return ctx;
}
