"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useApp } from "./providers";
import { Arrow, Count, Dots } from "./ui";
import { CONFIG, SITE, sleep } from "@/lib/data";

/* ---------- Character field (hero canvas) ---------- */
function Field() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
    const CH = "01{}[]<>/;=+*#$&|:".split("");
    // phones: bigger cells (fewer glyphs) and ~15fps; desktop: ~30fps
    const S = fine ? 22 : 28;
    const font = "12px " + (getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace");
    const FRAME = fine ? 33 : 66;
    let w = 0, h = 0, cols = 0, rows = 0, px = -999, py = -999, last = 0, on = true, lastMove = 0, raf = 0;
    let cells: { c: string; e: number }[] = [];
    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / S);
      rows = Math.ceil(h / S);
      cells = Array.from({ length: cols * rows }, () => ({ c: CH[(Math.random() * CH.length) | 0], e: 0 }));
      if (reduce) draw(0, true);
    };
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      lastMove = performance.now();
    };
    function draw(now: number, once = false) {
      if (!once) {
        raf = requestAnimationFrame(draw);
        if (!on || document.hidden || now - last < FRAME) return;
        last = now;
      }
      let fx = px, fy = py;
      if (now - lastMove > 2500 || !fine) {
        fx = w * (0.62 + 0.22 * Math.sin(now / 2600));
        fy = h * (0.45 + 0.25 * Math.sin(now / 1900 + 1));
      }
      ctx.clearRect(0, 0, w, h);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const c = cells[y * cols + x];
          const cx = x * S + S / 2, cy = y * S + S / 2;
          const d = Math.hypot(cx - fx, cy - fy);
          const tg = Math.max(0, 1 - d / 170);
          c.e += (tg - c.e) * 0.18;
          if (Math.random() < 0.0007) c.e = Math.max(c.e, 0.55);
          else c.e *= 0.995;
          if (c.e > 0.28 && Math.random() < 0.14) c.c = CH[(Math.random() * CH.length) | 0];
          const a = 0.05 + c.e * 0.85;
          ctx.fillStyle = c.e > 0.3 ? `rgba(200,255,46,${a})` : `rgba(236,238,241,${a})`;
          ctx.fillText(c.c, cx, cy);
        }
    }
    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    const io = new IntersectionObserver((es) => (on = es[0].isIntersecting));
    io.observe(cv);
    // start once the page has settled, so it never competes with first paint / hydration
    const start = () => (raf = requestAnimationFrame(draw));
    const hasIdle = "requestIdleCallback" in window;
    const idle = reduce ? 0 : hasIdle ? requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 800);
    return () => {
      if (hasIdle) cancelIdleCallback(idle);
      else clearTimeout(idle);
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
    };
  }, []);
  return <canvas className="field" ref={ref} aria-hidden="true" />;
}

/* ---------- Live editor ---------- */
type Tok = [string, string] | { step: number };
const N = CONFIG.name;
const S0 = CONFIG.skills.slice(0, 3).map((s) => s.name);
const CODE: Tok[][] = [
  [["kw", "import"], ["pn", " { "], ["fn", "build"], ["pn", " } "], ["kw", "from"], ["st", ' "@/lib/engineer"'], ["pn", ";"]],
  [],
  [["kw", "export default function "], ["fn", N.replace(/\s+/g, "")], ["pn", "() {"]],
  [["pn", "  "], ["kw", "const "], ["fn", "stack"], ["pn", " = ["], ...S0.flatMap((s, i): Tok[] => [["st", '"' + s + '"'], ["pn", i < S0.length - 1 ? ", " : ""]]), ["pn", "];"]],
  [["pn", "  "], ["kw", "return"], ["pn", " ("]],
  [["pn", "    <"], ["tg", "Engineer"]],
  [["pn", "      "], ["at", "name"], ["pn", "="], ["st", '"' + N + '"'], { step: 1 }],
  [["pn", "      "], ["at", "role"], ["pn", "="], ["st", '"Software Engineer"'], { step: 2 }],
  [["pn", "      "], ["at", "based"], ["pn", "="], ["st", '"Cairo, EG"'], { step: 3 }],
  [["pn", "      "], ["at", "stack"], ["pn", "={"], ["fn", "stack"], ["pn", "}"], { step: 4 }],
  [["pn", "      "], ["at", "status"], ["pn", "="], ["st", '"shipping"'], { step: 5 }],
  [["pn", "    />"]],
  [["pn", "  );"]],
  [["pn", "}"]],
  [["cm", "// ✓ ships to production"]],
];

function Editor({ start }: { start: boolean }) {
  const { t } = useApp();
  const pre = useRef<HTMLPreElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const runId = useRef(0);
  const [steps, setSteps] = useState<number[]>([]);
  const [flash, setFlash] = useState(0);
  const [hmr, setHmr] = useState(false);
  const [ln, setLn] = useState(1);
  const [done, setDone] = useState(false);
  const hmrT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const pvStep = useCallback((n: number) => {
    setSteps((s) => [...s, n]);
    setFlash(n);
    setHmr(true);
    clearTimeout(hmrT.current);
    hmrT.current = setTimeout(() => setHmr(false), 900);
  }, []);

  const typeCode = useCallback(async () => {
    const id = ++runId.current;
    const el = pre.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.innerHTML = "";
    setSteps([]);
    setDone(false);
    if (box.current) box.current.scrollTop = 0;
    const caret = document.createElement("span");
    caret.className = "caret";
    for (let i = 0; i < CODE.length; i++) {
      const line = document.createElement("span");
      line.className = "ln is-cur";
      line.dataset.n = String(i + 1);
      el.appendChild(line);
      el.children[i - 1]?.classList.remove("is-cur");
      setLn(i + 1);
      line.appendChild(caret);
      // keep the current line visible (old version simply cut the code off on small screens)
      if (box.current) {
        const b = box.current;
        const bottom = line.offsetTop + line.offsetHeight + 16;
        if (bottom > b.scrollTop + b.clientHeight) b.scrollTo({ top: bottom - b.clientHeight, behavior: reduce ? "auto" : "smooth" });
      }
      for (const tok of CODE[i]) {
        if (!Array.isArray(tok)) {
          if (!reduce) await sleep(120);
          if (id !== runId.current) return;
          pvStep(tok.step);
          continue;
        }
        const sp = document.createElement("span");
        sp.className = tok[0];
        line.insertBefore(sp, caret);
        if (reduce) {
          sp.textContent = tok[1];
          continue;
        }
        for (const ch of tok[1]) {
          sp.textContent += ch;
          await sleep(ch === " " ? 8 : 14 + Math.random() * 22);
          if (id !== runId.current) return;
        }
      }
      if (!reduce) {
        await sleep(70);
        if (id !== runId.current) return;
      }
    }
    setDone(true);
  }, [pvStep]);

  useEffect(() => {
    if (!start) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tm = setTimeout(typeCode, reduce ? 0 : 900);
    return () => {
      clearTimeout(tm);
      runId.current++;
    };
  }, [start, typeCode]);

  const on = (n: number) => (steps.includes(n) ? " on" : "") + (flash === n ? " flash" : "");

  return (
    <div className="stage">
      <div className="win editor">
        <div className="win__bar">
          <Dots />
          <div className="tabs">
            <span className="tab is-active">
              <b>TSX</b>
              <span>{N}.tsx</span>
            </span>
            <span className="tab">engineer.ts</span>
          </div>
          <button className="replay" type="button" onClick={typeCode}>
            ↻ replay
          </button>
        </div>
        <div className="editor__code" ref={box}>
          <pre className="code" ref={pre} />
        </div>
        <div className="editor__status">
          {done ? <span className="ok">✓ compiled in 0.42s · ready on localhost:3000</span> : <span className="typing">typing…</span>}
          <span>TSX · UTF-8 · Ln {ln}</span>
        </div>
      </div>
      <div className="preview">
        <span className={"toast-hmr" + (hmr ? " on" : "")}>⚡ hot reload</span>
        <div className="win">
        <div className="win__bar">
          <Dots />
          <span className="url">
            <i />
            localhost:3000
          </span>
        </div>
        <div className="pv">
          <div className="pv__top">
            <div className="pv__av">
              <Image src={CONFIG.photo} alt={SITE.fullName} width={768} height={960} unoptimized />
            </div>
            <div className="pv__col">
              <div className={"pv__f" + on(1)}>
                <span className="sk" style={{ width: "80%", height: 16 }} />
                <span className="val pv__name">{N}</span>
              </div>
              <div className={"pv__f" + on(2)}>
                <span className="sk" style={{ width: "60%" }} />
                <span className="val pv__role">{t("role")}</span>
              </div>
            </div>
          </div>
          <div className={"pv__f" + on(3)}>
            <span className="sk" style={{ width: "40%", height: 10 }} />
            <span className="val pv__loc">◎ {t("loc")}</span>
          </div>
          <div className={"pv__f" + on(4)}>
            <span className="sk" style={{ width: "90%", height: 24, borderRadius: 999 }} />
            <span className="val pv__chips">
              {S0.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </span>
          </div>
          <div className={"pv__f" + on(5)}>
            <span className="sk" style={{ width: "100%", height: 10 }} />
            <div className="val pv__status">
              <span className="state">
                <i />
                <span>{t("shipping")}</span>
              </span>
              <span>v{new Date().getFullYear()}.1</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t, booted } = useApp();
  return (
    <section className={"hero" + (booted ? " is-in" : "")} id="top">
      <Field />
      <div className="hero__glow" />
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow mono" data-h style={{ ["--d" as string]: 0 }}>
            <span className="tagline">
              <i />
              <span>{t("eyebrow")}</span>
            </span>
          </p>
          <h1 className="hero__title">
            <span className="sr-only">
              {SITE.fullName} ({SITE.fullNameAr}) — {SITE.jobTitle} &amp; Founder of {SITE.company}.{" "}
            </span>
            <span className="line">
              <span style={{ ["--i" as string]: 0 }}>{t("h1a")}</span>
            </span>{" "}
            <span className="line line--mark">
              <span style={{ ["--i" as string]: 1 }}>
                {t("h1b")}{" "}
                <span className="mark">
                  {t("h1c")}
                  <svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 20 C 70 6, 150 4, 296 14" />
                  </svg>
                </span>
              </span>
            </span>{" "}
            <span className="line">
              <span style={{ ["--i" as string]: 2 }}>
                {t("h1d")}
                <span className="caret" />
              </span>
            </span>
          </h1>
          <p className="hero__lede" data-h style={{ ["--d" as string]: 2 }} dangerouslySetInnerHTML={{ __html: t("lede") }} />
          <div className="hero__cta" data-h style={{ ["--d" as string]: 3 }}>
            <a className="btn btn--lime" href="#work">
              <span>{t("cta1")}</span>
              <Arrow />
            </a>
            <a className="btn btn--ghost" href="#terminal">
              <span className="k">&gt;_</span>
              <span>{t("cta2")}</span>
            </a>
          </div>
          <ul className="hero__meta" data-h style={{ ["--d" as string]: 4 }}>
            <li>
              <b>
                <Count k="projects" />
                <sup>+</sup>
              </b>
              <span>{t("st_p")}</span>
            </li>
            <li>
              <b>
                <Count k="clients" />
                <sup>+</sup>
              </b>
              <span>{t("st_c")}</span>
            </li>
            <li>
              <b>
                <Count k="years" />
                <sup>y</sup>
              </b>
              <span>{t("st_y")}</span>
            </li>
          </ul>
        </div>
        <Editor start={booted} />
      </div>
      <div className="hero__scroll">
        <span />
        {t("scroll")}
      </div>
    </section>
  );
}
