"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./providers";
import { useScrollFrame } from "@/lib/hooks";
import type { Key } from "@/lib/i18n";

export const SECTIONS = ["work", "about", "services", "journey", "terminal", "contact"] as const;

export default function Nav() {
  const { t, lang, toggleLang } = useApp();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [cur, setCur] = useState("");
  const progress = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  useScrollFrame(() => {
    const y = scrollY;
    const dy = y - lastY.current;
    lastY.current = y;
    const H = document.documentElement.scrollHeight - innerHeight;
    progress.current?.style.setProperty("--p", String(H > 0 ? y / H : 0));
    setSolid(y > 30);
    if (y > innerHeight && dy > 5) setHidden(true);
    else if (dy < -5 || y < innerHeight) setHidden(false);
    let c = "";
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < innerHeight * 0.4) c = id;
    }
    setCur(c);
  });

  // lock scroll + Escape while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="progress" ref={progress} />
      <header className={"nav" + (solid ? " is-solid" : "") + (hidden && !open ? " is-hidden" : "")}>
        <div className="wrap">
          <a className="logo" href="#top" aria-label="Home">
            <span className="b">&lt;</span>mahmoud<span className="s">/</span>
            <span className="b">&gt;</span>
          </a>
          <nav className="nav__links" aria-label="Main">
            {SECTIONS.map((id, i) => (
              <a key={id} href={"#" + id} className={cur === id ? "is-current" : ""}>
                <i>0{i + 1}</i>./<span>{t(("n_" + id) as Key)}</span>
              </a>
            ))}
          </nav>
          <div className="nav__end">
            <span className="pill">
              <i />
              <span>{t("avail")}</span>
            </span>
            <button className="lang" type="button" aria-label="Switch language" onClick={toggleLang}>
              {lang === "ar" ? "EN" : "ع"}
            </button>
            <button className="burger" type="button" aria-label={t("menu")} aria-expanded={open} onClick={() => setOpen(true)}>
              <span />
            </button>
          </div>
        </div>
      </header>
      <div className={"menu" + (open ? " is-open" : "")} aria-hidden={!open}>
        <button className="menu__close" type="button" onClick={() => setOpen(false)}>
          {t("close")}
        </button>
        {SECTIONS.map((id, i) => (
          <a key={id} href={"#" + id} style={{ ["--i" as string]: i }} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
            <i>0{i + 1}</i>
            <span>{t(("m_" + id) as Key)}</span>
          </a>
        ))}
      </div>
    </>
  );
}
