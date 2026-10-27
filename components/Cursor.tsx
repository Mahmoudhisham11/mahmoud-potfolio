"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./providers";

export default function Cursor() {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [tag, setTag] = useState("");

  useEffect(() => {
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    const c = ref.current!;
    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const a = (e.target as Element).closest?.("a,button");
      c.classList.toggle("is-link", !!a);
      c.classList.add("is-on");
      if (a) {
        const href = a.getAttribute("href") || "";
        setTag(href.startsWith("#") ? "lnk_go" : href ? "lnk_open" : "lnk_cl");
      }
    };
    const down = () => c.classList.add("is-down");
    const up = () => c.classList.remove("is-down");
    const leave = () => c.classList.remove("is-on");
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      c.style.setProperty("--x", mx + "px");
      c.style.setProperty("--y", my + "px");
      c.style.setProperty("--rx", rx + "px");
      c.style.setProperty("--ry", ry + "px");
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerdown", down);
    addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden="true" hidden={!enabled}>
      <span className="cursor__ring" />
      <span className="cursor__dot" />
      <span className="cursor__tag">{tag ? t(tag as "lnk_go") : ""}</span>
    </div>
  );
}
