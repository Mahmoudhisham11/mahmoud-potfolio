"use client";

import { useRef, useState } from "react";
import { useApp } from "./providers";
import { Reveal, Scramble } from "./ui";
import { useScrollFrame } from "@/lib/hooks";
import { CONFIG, clamp, hash } from "@/lib/data";

export default function Journey() {
  const { t, lang } = useApp();
  const graph = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState(0);

  useScrollFrame(() => {
    const g = graph.current;
    if (!g) return;
    const gr = g.getBoundingClientRect();
    g.style.setProperty("--gp", clamp((innerHeight * 0.6 - gr.top) / gr.height).toFixed(4));
    let n = 0;
    g.querySelectorAll(".commit").forEach((c) => c.getBoundingClientRect().top + 40 < innerHeight * 0.6 && n++);
    setLit(n);
  });

  return (
    <section className="sec" id="journey" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num">
            <b>04</b> // <span>{t("n_journey")}</span>
          </span>
          <Scramble className="sec-title" text={t("jr_t")} />
          <p className="sec-sub">
            <b>$</b> git log --author=&quot;{CONFIG.name}&quot; --graph
          </p>
        </header>
        <ol className="graph" ref={graph}>
          {CONFIG.timeline.map((c, i) => (
            <Reveal as="li" className={"commit" + (i < lit ? " on" : "")} key={c.title}>
              <span className="commit__node" />
              {c.type === "release" && (
                <svg className="branch" viewBox="0 0 34 40" aria-hidden="true">
                  <path d="M0 36 C 0 14, 30 22, 30 0" />
                </svg>
              )}
              <div className="commit__card">
                <div className="commit__meta">
                  <span>{hash(c.title + c.date)}</span>
                  <span className={"commit__type" + (c.type === "release" ? " release" : "")}>{c.type}</span>
                  {i === CONFIG.timeline.length - 1 && <span className="head">HEAD → main</span>}
                </div>
                <h3 className="commit__title">{lang === "ar" ? c.ar.title : c.title}</h3>
                <p className="commit__body">{lang === "ar" ? c.ar.body : c.body}</p>
                <span className="commit__date">{c.date}</span>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
