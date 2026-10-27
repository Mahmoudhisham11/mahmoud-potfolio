"use client";

import { useEffect, useRef, useState } from "react";
import { esc, useApp } from "./providers";
import { Reveal, Scramble, WinBar } from "./ui";
import { useInView } from "@/lib/hooks";
import { CONFIG, PROJECTS, fileOf, hostOf, sleep } from "@/lib/data";

type Line = { id: number; html: string; cls?: string };
let uid = 0;

export default function Terminal() {
  const { t, toggleLang } = useApp();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const hist = useRef<string[]>([]);
  const hIdx = useRef(0);
  const busy = useRef(false);
  const [viewRef, inView] = useInView<HTMLDivElement>();

  const push = (html: string, cls = "o") => {
    const id = ++uid;
    setLines((l) => [...l, { id, html, cls }]);
    return id;
  };
  const patch = (id: number, html: string) => setLines((l) => l.map((x) => (x.id === id ? { ...x, html } : x)));

  useEffect(() => {
    const b = body.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [lines]);

  const CMDS: Record<string, () => string | null> = {
    help: () => `<span class="m">available commands:</span>
  <span class="l">whoami</span>      who is ${esc(CONFIG.name)}
  <span class="l">projects</span>    list my work
  <span class="l">skills</span>      what I build with
  <span class="l">contact</span>     how to reach me
  <span class="l">hire</span>        start a project 🚀
  <span class="l">lang</span>        switch EN / عربي
  <span class="l">date</span>        time in Cairo
  <span class="l">clear</span>       clear the screen`,
    whoami: () => `<span class="y">${esc(CONFIG.name)}</span> — software engineer · Cairo, Egypt
<span class="m">builds web apps, dashboards &amp; backends.
${CONFIG.stats.projects}+ projects · ${CONFIG.stats.clients}+ clients · ${CONFIG.stats.years}y coding</span>`,
    projects: () =>
      PROJECTS.map(
        (p, i) =>
          `<span class="m">${String(i + 1).padStart(2, "0")}</span>  <span class="c">${esc(fileOf(p).padEnd(20))}</span> ${
            p.status === "live" ? '<span class="l">● live</span>' : '<span class="y">◌ building</span>'
          }  <a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">${esc(hostOf(p.link))}</a>`,
      ).join("\n") + `\n<span class="m">→ scroll up to</span> <a href="#work">./work</a>`,
    ls: () => CMDS.projects(),
    skills: () =>
      CONFIG.skills
        .map(
          (s) =>
            `<span class="c">${esc(s.name.padEnd(11))}</span> <span class="l">${"█".repeat(Math.round(s.level / 10))}</span><span class="m">${"░".repeat(
              10 - Math.round(s.level / 10),
            )} ${s.level}%</span>`,
        )
        .join("\n"),
    contact: () =>
      `email     <a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a>\n` +
      CONFIG.socials.filter((s) => s.icon !== "whatsapp" || CONFIG.whatsapp).map((s) => `${esc(s.label.padEnd(9))} <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.url)}</a>`).join("\n"),
    hire: () => {
      setTimeout(() => (location.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("New project")), 900);
      return `<span class="l">✓ permission granted.</span> <span class="m">opening your mail app…</span>`;
    },
    "sudo hire-me": () => CMDS.hire(),
    "npm run hire": () => CMDS.hire(),
    lang: () => {
      setTimeout(toggleLang, 300);
      return `<span class="m">switching language…</span>`;
    },
    date: () => {
      try {
        return (
          new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", dateStyle: "full", timeStyle: "medium" }).format(new Date()) +
          ' <span class="m">(Cairo)</span>'
        );
      } catch {
        return String(new Date());
      }
    },
    clear: () => {
      setLines([]);
      return null;
    },
    "rm -rf /": () => `<span class="e">nice try 😄</span> <span class="m">this portfolio is protected.</span>`,
  };

  const run = async (raw: string, typed: boolean) => {
    const cmd = raw.trim();
    if (!cmd || busy.current) return;
    busy.current = true;
    const ps = `<span class="ps">~$</span> `;
    if (typed) {
      const id = push(ps);
      for (let i = 1; i <= cmd.length; i++) {
        patch(id, ps + esc(cmd.slice(0, i)));
        await sleep(55);
      }
    } else push(ps + esc(cmd));
    hist.current.push(cmd);
    hIdx.current = hist.current.length;
    const f = CMDS[cmd.toLowerCase()];
    const out = f ? f() : `<span class="e">command not found:</span> ${esc(cmd)} <span class="m">— try</span> <span class="l">help</span>`;
    if (out != null) {
      await sleep(120);
      push(out);
    }
    busy.current = false;
  };

  // greeting + auto "help" when the terminal first scrolls into view
  const hello = useRef(false);
  useEffect(() => {
    if (hello.current) return;
    hello.current = true;
    push(
      `<span class="m">Last login: ${new Date().toDateString()} on ttys001</span>\n<span class="l">welcome!</span> <span class="m">type</span> <span class="l">help</span> <span class="m">to see what I can do.</span>`,
    );
  }, []);
  const greeted = useRef(false);
  useEffect(() => {
    if (!inView || greeted.current) return;
    const tm = setTimeout(() => {
      greeted.current = true;
      run("help", true);
    }, 500);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // "/" focuses the terminal from anywhere
  useEffect(() => {
    const onFocus = () => input.current?.focus({ preventScroll: true });
    addEventListener("mh:terminal", onFocus);
    return () => removeEventListener("mh:terminal", onFocus);
  }, []);

  return (
    <section className="sec" id="terminal" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num">
            <b>05</b> // <span>{t("n_terminal")}</span>
          </span>
          <Scramble className="sec-title" text={t("tm_t")} />
          <p className="sec-sub">{t("tm_s")}</p>
        </header>
        <div ref={viewRef}>
          <Reveal
            className="win term"
            onClick={(e: React.MouseEvent) => {
              if (!(e.target as Element).closest("a,button")) input.current?.focus({ preventScroll: true });
            }}
          >
            <WinBar title="mahmoud@portfolio: ~" />
            <div className="term__body" ref={body} aria-live="polite">
              {lines.map((l) => (
                <div key={l.id} className={l.cls} dangerouslySetInnerHTML={{ __html: l.html }} />
              ))}
            </div>
            <form
              className="term__row"
              autoComplete="off"
              onSubmit={(e) => {
                e.preventDefault();
                const v = value;
                setValue("");
                run(v, false);
              }}
            >
              <span className="ps">mahmoud@portfolio:~$</span>
              <input
                ref={input}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                spellCheck={false}
                aria-label="Terminal command"
                placeholder="help"
                onKeyDown={(e) => {
                  const H = hist.current;
                  if (e.key === "ArrowUp") {
                    hIdx.current = Math.max(0, hIdx.current - 1);
                    setValue(H[hIdx.current] || "");
                    e.preventDefault();
                  } else if (e.key === "ArrowDown") {
                    hIdx.current = Math.min(H.length, hIdx.current + 1);
                    setValue(H[hIdx.current] || "");
                  } else if (e.key === "Tab" && value) {
                    const m = Object.keys(CMDS).find((k) => k.startsWith(value));
                    if (m) {
                      setValue(m);
                      e.preventDefault();
                    }
                  }
                }}
              />
            </form>
            <div className="term__chips">
              <span>try →</span>
              {["help", "whoami", "projects", "skills", "contact", "hire"].map((c) => (
                <button type="button" key={c} onClick={() => run(c, true)}>
                  {c}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
