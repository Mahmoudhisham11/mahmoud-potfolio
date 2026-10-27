"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useApp } from "./providers";
import { Arrow, Dots, Reveal, Scramble } from "./ui";
import { useReducedMotion, useScrollFrame } from "@/lib/hooks";
import { PROJECTS, clamp, fileOf, hash, hostOf, type Project } from "@/lib/data";

/** Full, uncropped screenshot inside a browser frame; the whole frame links to the live project. */
function Shot({ p, eager = false, lazy = false }: { p: Project; eager?: boolean; lazy?: boolean }) {
  const { lang } = useApp();
  const title = lang === "ar" ? p.ar.title : p.title;
  return (
    <a className="frame" href={p.link} target="_blank" rel="noopener noreferrer" aria-label={title} tabIndex={-1}>
      <span className="frame__win">
        <span className="frame__bar">
          <Dots />
          <span className="frame__url">
            <i />
            {hostOf(p.link)}
          </span>
        </span>
        <Image
          className="frame__img"
          src={p.image.src}
          width={p.image.width}
          height={p.image.height}
          alt={title}
          quality={90}
          sizes="(max-width: 900px) 100vw, 900px"
          priority={eager}
          loading={eager ? undefined : lazy ? "lazy" : "eager"}
          style={{ aspectRatio: `${p.image.width} / ${p.image.height}` }}
        />
      </span>
    </a>
  );
}

function MetaCode({ p }: { p: Project }) {
  const L: [string, string][][] = [
    [["kw", "export const "], ["fn", "project"], ["pn", " = {"]],
    [["at", "  name"], ["pn", ": "], ["st", '"' + p.title + '"'], ["pn", ","]],
    [["at", "  year"], ["pn", ": "], ["nu", p.year], ["pn", ","]],
    [["at", "  status"], ["pn", ": "], ["st", '"' + p.status + '"'], ["pn", ","]],
    [["pn", "};"]],
  ];
  return (
    <pre className="code">
      {L.map((l, i) => (
        <span className="ln" data-n={i + 1} style={{ ["--i" as string]: i }} key={i}>
          {l.map((x, k) => (
            <span className={x[0]} key={k}>
              {x[1]}
            </span>
          ))}
        </span>
      ))}
    </pre>
  );
}

export default function Work() {
  const { t, lang } = useApp();
  const reduce = useReducedMotion();
  const explorer = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [scan, setScan] = useState({ n: 0, back: false });
  const activeRef = useRef(0);
  const pj = (p: Project, k: "title" | "type" | "desc") => (lang === "ar" ? p.ar[k] : p[k]);

  const go = (i: number) => {
    if (i === activeRef.current) return;
    setScan((s) => ({ n: s.n + 1, back: i < activeRef.current }));
    activeRef.current = i;
    setActive(i);
  };

  useScrollFrame(() => {
    const ex = explorer.current;
    if (!ex || ex.offsetParent === null) return;
    const r = ex.getBoundingClientRect();
    const total = r.height - innerHeight;
    const p = total > 0 ? clamp(-r.top / total) : 0;
    bar.current?.style.setProperty("--p", String(p));
    if (!reduce) go(Math.min(PROJECTS.length - 1, Math.floor(p * PROJECTS.length)));
  }, [reduce]);

  const pick = (i: number) => {
    const ex = explorer.current!;
    const r = ex.getBoundingClientRect();
    const total = r.height - innerHeight;
    if (total <= 0 || reduce) return go(i);
    scrollTo({ top: scrollY + r.top + total * ((i + 0.5) / PROJECTS.length), behavior: "smooth" });
  };

  const p = PROJECTS[active];

  return (
    <section className="sec sec--work" id="work">
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num">
            <b>01</b> // <span>{t("n_work")}</span>
          </span>
          <Scramble className="sec-title" text={t("work_t")} />
          <p className="sec-sub">
            <b>$</b> ls ./projects --sort=year
          </p>
        </header>
      </div>

      {/* desktop: sticky IDE explorer driven by scroll */}
      <div className="explorer" ref={explorer} style={{ ["--n" as string]: PROJECTS.length }}>
        <div className="explorer__sticky">
          <div className="wrap">
            <div className="win ide">
              <aside className="tree">
                <div className="tree__head">EXPLORER</div>
                <div className="tree__folder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7h6l2 2h10v10H3z" />
                  </svg>
                  projects
                </div>
                <ul>
                  {PROJECTS.map((q, i) => (
                    <li key={q.title}>
                      <button type="button" className={i === active ? "is-active" : ""} onClick={() => pick(i)}>
                        <span className="fi fi--tsx">TSX</span>
                        {fileOf(q)}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="tree__sep" />
                <p className="tree__note">{t("tree_note")}</p>
                <div className="tree__code" key={active}>
                  <div className="tree__head">OUTLINE</div>
                  <MetaCode p={p} />
                </div>
              </aside>
              <div className="ide__main">
                <div className="ide__tabs">
                  <span className="ide__tab">
                    <span className="fi fi--tsx">TSX</span>
                    <span>{fileOf(p)}</span>
                    <span className="dot" />
                  </span>
                  <span className="ide__crumbs">src › projects › {fileOf(p)}</span>
                </div>
                <div className="ide__content">
                  <div className="shots">
                    {PROJECTS.map((q, i) => (
                      <div
                        key={q.title}
                        className={"shot" + (i === active ? " is-active" : i < active ? " is-before" : " is-after")}
                        aria-hidden={i !== active}
                      >
                        <Shot p={q} eager={i === 0} />
                      </div>
                    ))}
                    {scan.n > 0 && !reduce && <span key={scan.n} className={"scan" + (scan.back ? " is-back" : "")} />}
                  </div>
                  <div className="meta" key={active}>
                    <div className="meta__head">
                      <h3 className="meta__title">{pj(p, "title")}</h3>
                      <p className="meta__type">{pj(p, "type")}</p>
                    </div>
                    <p className="meta__desc">{pj(p, "desc")}</p>
                    <div className="meta__links">
                      <a className="btn btn--lime" href={p.link} target="_blank" rel="noopener noreferrer">
                        {t("open")} <Arrow />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="ide__foot">
                  <span>
                    {String(active + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                  </span>
                  <span className="ide__bar">
                    <span ref={bar} />
                  </span>
                  <span>
                    {p.status === "building" ? "◌ " : "● "}
                    {p.status} · #{hash(p.title)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile / tablet: cards */}
      <div className="wrap">
        <ul className="cards">
          {PROJECTS.map((q) => (
            <Reveal as="li" className="win pcard" key={q.title}>
              <div className="win__bar">
                <Dots />
                <span>{fileOf(q)}</span>
              </div>
              <div className="pcard__shot">
                <Shot p={q} lazy />
              </div>
              <div className="pcard__body">
                <div className="pcard__top">
                  <span className={"status" + (q.status === "building" ? " is-building" : "")}>
                    <i />
                    {t(q.status)}
                  </span>
                  <span>
                    #{hash(q.title)} · {q.year}
                  </span>
                </div>
                <h3 className="meta__title">{pj(q, "title")}</h3>
                <p className="meta__type">{pj(q, "type")}</p>
                <p className="meta__desc">{pj(q, "desc")}</p>
                <a className="btn btn--ghost" href={q.link} target="_blank" rel="noopener noreferrer">
                  {t("open")} <Arrow />
                </a>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
