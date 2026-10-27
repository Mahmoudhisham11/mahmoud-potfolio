"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { useApp } from "./providers";
import { Count, Reveal, WinBar } from "./ui";
import { useReducedMotion, useScrollFrame } from "@/lib/hooks";
import { CONFIG, SITE, clamp } from "@/lib/data";

function Statement() {
  const { t } = useApp();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const raw = t("statement");

  const words = useMemo(() => {
    const out: { w: string; hl: boolean; sp: boolean }[] = [];
    raw.split(/(\[[^\]]+\])/).forEach((pt) => {
      const hl = /^\[.*\]$/.test(pt);
      (hl ? pt.slice(1, -1) : pt).split(/(\s+)/).forEach((w) => w && out.push({ w, hl, sp: /^\s+$/.test(w) }));
    });
    return out;
  }, [raw]);

  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35));
    const ws = el.querySelectorAll(".w");
    const lit = Math.round(p * ws.length);
    ws.forEach((w, i) => w.classList.toggle("on", i < lit || reduce));
  }, [raw, reduce]);

  return (
    <p className="statement" ref={ref}>
      {words.map((x, i) =>
        x.sp ? (
          " "
        ) : (
          <span key={i} className={"w" + (x.hl ? " hl" : "")}>
            {x.w}
          </span>
        ),
      )}
    </p>
  );
}

export default function About() {
  const { t } = useApp();
  const S = CONFIG.skills;
  return (
    <section className="sec" id="about">
      <div className="wrap about__grid">
        <div>
          <span className="sec-num">
            <b>02</b> // <span>{t("n_about")}</span>
          </span>
          <Statement />
          <div className="about__stats">
            {(
              [
                ["projects", "+", "st_p"],
                ["clients", "+", "st_c"],
                ["years", "y", "st_y"],
              ] as const
            ).map(([k, sup, label], i) => (
              <Reveal className="stat" d={i} key={k}>
                <b>
                  <Count k={k} />
                  <sup>{sup}</sup>
                </b>
                <span>{t(label)}</span>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="about__side">
          <Reveal as="figure" className="win me">
            <WinBar title="me.jpg" />
            <div className="me__img">
              {/* served unoptimized so Google Images indexes the real file: /images/mahmoud-hisham.jpg */}
              <Image
                src={CONFIG.photo}
                alt={`${SITE.fullName} (${SITE.fullNameAr}) — ${SITE.jobTitle} in ${SITE.city}`}
                title={SITE.fullName}
                width={768}
                height={960}
                unoptimized
              />
              <span className="me__corner tl" />
              <span className="me__corner tr" />
              <span className="me__corner bl" />
              <span className="me__corner br" />
              <span className="me__tag">
                <i />
                <span>{t("me_tag")}</span>
              </span>
            </div>
            <figcaption className="me__cap">
              <span className="kw">const</span> me = <span className="kw">new</span> <span className="tg">Engineer</span>(
              <span className="st">&quot;{CONFIG.name}&quot;</span>);
            </figcaption>
          </Reveal>
          <Reveal className="win npm">
            <WinBar title={`~/${CONFIG.name.toLowerCase()} — zsh`} />
            <div className="npm__body">
              <div className="cmd">
                <b>$</b> npm install {CONFIG.name.toLowerCase()}
              </div>
              <div style={{ color: "var(--dim)" }}>resolving skills…</div>
              {S.map((s, i) => (
                <div className="dep" key={s.name}>
                  <span className="dep__name">{s.name}</span>
                  <span className="dep__bar">
                    <span style={{ ["--v" as string]: clamp(s.level / 100), ["--i" as string]: i }} />
                  </span>
                  <span className="dep__lvl">{s.level}%</span>
                </div>
              ))}
              <div className="npm__done">
                <b>✓</b> added {S.length} skills in {CONFIG.stats.years}y · <b>0</b> vulnerabilities
                <br />
                <span style={{ color: "var(--dim)" }}>run</span> <span style={{ color: "var(--text)" }}>npm run hire</span>{" "}
                <span style={{ color: "var(--dim)" }}>to start →</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
