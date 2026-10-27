"use client";

import { useEffect } from "react";
import { useApp } from "./providers";
import { SECTIONS } from "./Nav";

/** Global shortcuts: / terminal · L language · E copy email · 1-6 sections */
export default function Keys() {
  const { toggleLang, copyEmail } = useApp();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.documentElement.classList.contains("is-booting")) return;
      const tgt = e.target as HTMLElement;
      if (/input|textarea|select/i.test(tgt.tagName) || tgt.isContentEditable) {
        if (e.key === "Escape") tgt.blur();
        return;
      }
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
      const k = e.key.toLowerCase();
      if (k === "/") {
        e.preventDefault();
        document.getElementById("terminal")?.scrollIntoView({ behavior });
        setTimeout(() => dispatchEvent(new Event("mh:terminal")), reduce ? 0 : 700);
      } else if (k === "l") toggleLang();
      else if (k === "e") copyEmail();
      else if (/^[1-6]$/.test(k)) document.getElementById(SECTIONS[+k - 1])?.scrollIntoView({ behavior });
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [toggleLang, copyEmail]);
  return null;
}
