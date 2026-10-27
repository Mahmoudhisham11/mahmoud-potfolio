"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./providers";
import { CONFIG, PROJECTS, sleep } from "@/lib/data";

const LINES: [string, number][] = [
  ["<b>$</b> <em>npm run dev</em>", 240],
  ["  ▲ " + CONFIG.band.join(" · "), 220],
  ["<b>✓</b> loaded " + PROJECTS.length + " projects", 220],
  ["<b>✓</b> compiled " + CONFIG.skills.length + " skills", 220],
  ["<b>✓</b> generated pages <em>(en · ع)</em>", 220],
  ["<b>✓</b> ready on <em>localhost:3000</em>", 260],
];

export default function Boot() {
  const { setBooted } = useApp();
  const [state, setState] = useState<"run" | "done" | "gone">("run");
  const [log, setLog] = useState("");
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const skip = useRef(false);

  useEffect(() => {
    let alive = true;
    let seen = false;
    try {
      seen = sessionStorage.getItem("mh-boot") === "1";
    } catch {}
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || seen) {
      setState("gone");
      setBooted();
      return;
    }
    document.documentElement.classList.add("is-booting");
    const fin = (e?: Event) => {
      if (e instanceof KeyboardEvent) e.stopPropagation();
      skip.current = true;
    };
    addEventListener("keydown", fin, { once: true, capture: true });

    let p = 0;
    const tween = (to: number, ms: number) =>
      new Promise<void>((res) => {
        const from = p;
        const t0 = performance.now();
        const f = (n: number) => {
          const k = Math.min(1, (n - t0) / ms);
          p = from + (to - from) * k;
          if (alive) setPct(p);
          if (k < 1 && !skip.current && alive) requestAnimationFrame(f);
          else res();
        };
        requestAnimationFrame(f);
      });

    (async () => {
      let html = "";
      for (let i = 0; i < LINES.length && !skip.current && alive; i++) {
        html += LINES[i][0] + "\n";
        setLog(html + '<span class="caret"></span>');
        setStep(i + 1);
        await tween(((i + 1) / LINES.length) * 100, LINES[i][1]);
      }
      removeEventListener("keydown", fin, { capture: true });
      if (!alive) return;
      setPct(100);
      setStep(LINES.length);
      try {
        sessionStorage.setItem("mh-boot", "1");
      } catch {}
      await sleep(skip.current ? 0 : 200);
      setState("done");
      document.documentElement.classList.remove("is-booting");
      setTimeout(setBooted, 300);
      setTimeout(() => alive && setState("gone"), 1100);
    })();

    return () => {
      alive = false;
      removeEventListener("keydown", fin, { capture: true });
      document.documentElement.classList.remove("is-booting");
    };
  }, [setBooted]);

  if (state === "gone") return null;
  return (
    <div className={"boot" + (state === "done" ? " is-done" : "")} aria-hidden="true">
      <button className="boot__skip" type="button" onClick={() => (skip.current = true)}>
        skip ↵
      </button>
      <pre className="boot__log" dangerouslySetInnerHTML={{ __html: log }} />
      <div className="boot__foot">
        <div>
          <div className="boot__bar">
            <span style={{ ["--p" as string]: pct / 100 }} />
          </div>
          <div className="boot__meta">
            <span>{CONFIG.name.toLowerCase()} — compiling</span>
            <span>
              {step}/{LINES.length}
            </span>
          </div>
        </div>
        <div className="boot__pct">
          <span>{Math.round(pct)}</span>
          <small>%</small>
        </div>
      </div>
    </div>
  );
}
