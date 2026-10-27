"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AR, EN, type Key, type Lang } from "@/lib/i18n";
import { CONFIG } from "@/lib/data";

type Ctx = {
  lang: Lang;
  t: (k: Key) => string;
  toggleLang: () => void;
  booted: boolean;
  setBooted: () => void;
  toast: (html: string) => void;
  copyEmail: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside <Providers>");
  return c;
}

export const esc = (s: string) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [booted, setBootedState] = useState(false);
  const [toastHtml, setToastHtml] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mh-lang");
      if (saved === "ar" || saved === "en") setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = useCallback((k: Key) => (lang === "ar" && AR[k] != null ? AR[k]! : EN[k]), [lang]);

  const toggleLang = useCallback(() => {
    setLang((l) => {
      const n = l === "ar" ? "en" : "ar";
      try {
        localStorage.setItem("mh-lang", n);
      } catch {}
      return n;
    });
  }, []);

  const toast = useCallback((html: string) => {
    setToastHtml(html);
    setToastOn(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 2200);
  }, []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.email);
      toast("<b>✓</b> " + esc(t("copied")) + " — " + esc(CONFIG.email));
    } catch {
      toast(esc(CONFIG.email));
    }
  }, [t, toast]);

  const setBooted = useCallback(() => setBootedState(true), []);

  return (
    <AppCtx.Provider value={{ lang, t, toggleLang, booted, setBooted, toast, copyEmail }}>
      {children}
      <div className={"toast" + (toastOn ? " on" : "")} role="status" dangerouslySetInnerHTML={{ __html: toastHtml }} />
    </AppCtx.Provider>
  );
}
