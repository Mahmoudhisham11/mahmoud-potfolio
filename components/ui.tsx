"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";
import { useApp } from "./providers";
import { CONFIG } from "@/lib/data";

export const Arrow = () => (
  <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Dots = () => (
  <span className="dots">
    <i />
    <i />
    <i />
  </span>
);

/** Window title bar — title is truly centered (old version used a translateX(-30px) hack that broke in RTL). */
export const WinBar = ({ title, children }: { title?: ReactNode; children?: ReactNode }) => (
  <div className="win__bar">
    <Dots />
    {title != null && <span className="win__title">{title}</span>}
    {children}
  </div>
);

/** Heading with a one-shot "decode" effect when it scrolls into view (EN only). */
export function Scramble({ text, className }: { text: string; className?: string }) {
  const [ref, inView] = useInView<HTMLHeadingElement>();
  const reduce = useReducedMotion();
  const { lang } = useApp();
  const [shown, setShown] = useState(text);
  const played = useRef(false);

  useEffect(() => {
    setShown(text);
    if (!inView || played.current || reduce || lang !== "en") return;
    played.current = true;
    const chars = "</>{}[]#$%01_=+*";
    const total = 22;
    let f = 0;
    let id: ReturnType<typeof setTimeout>;
    const step = () => {
      f++;
      setShown(
        text
          .split("")
          .map((c, i) => (i < (f / total) * text.length || c === " " ? c : chars[(Math.random() * chars.length) | 0]))
          .join(""),
      );
      if (f < total) id = setTimeout(step, 32);
      else setShown(text);
    };
    step();
    return () => {
      clearTimeout(id);
      setShown(text);
    };
  }, [inView, text, reduce, lang]);

  return (
    <h2 ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </h2>
  );
}

/** Animated counter bound to CONFIG.stats */
export function Count({ k }: { k: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.5);
  const { booted } = useApp();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || !booted) return;
    const to = CONFIG.stats[k] || 0;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1500);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, booted, k]);
  return <span ref={ref}>{n}</span>;
}

/** Fade/slide-in wrapper (data-r in the original). */
export function Reveal({
  as: Tag = "div",
  className = "",
  d = 0,
  children,
  ...rest
}: { as?: "div" | "li" | "article" | "figure"; className?: string; d?: number; children: ReactNode } & Record<string, unknown>) {
  const [ref, inView] = useInView<HTMLElement>();
  const El = Tag as "div";
  return (
    <El
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal ${className}${inView ? " is-in" : ""}`}
      style={{ ["--d" as string]: d }}
      {...rest}
    >
      {children}
    </El>
  );
}

export const Html = ({ html, as: Tag = "span", className }: { html: string; as?: "span" | "p" | "h3" | "em"; className?: string }) => (
  <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
);
