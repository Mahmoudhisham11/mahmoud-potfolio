"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { esc, useApp } from "./providers";
import { Arrow, Reveal, WinBar } from "./ui";
import { useInView, useScrollFrame } from "@/lib/hooks";
import { CONFIG, SITE, clamp, sleep } from "@/lib/data";
import { sendMessage } from "@/lib/contact";

const SOC_ICONS: Record<string, React.ReactNode> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8.1 8.1 0 0 0 4.7 1.5V6.7a4.8 4.8 0 0 1-4.7-4.7Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14A22.6 22.6 0 0 0 14.31 4C11.86 4 10.2 5.49 10.2 8.24v2.36H7.44v3.2h2.76V22h3.3Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.2-1.5A9.93 9.93 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.09.89.9-3.01-.2-.31a8.2 8.2 0 1 1 6.87 3.76Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.32-2.9c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.77 2.77 0 0 0-.86 2.06 4.8 4.8 0 0 0 1 2.55 11 11 0 0 0 4.2 3.7c1.56.68 2.18.73 2.96.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  ),
};

type Vals = { name: string; phone: string; msg: string };
type Errs = Partial<Record<keyof Vals, string>>;

function ContactForm() {
  const { t } = useApp();
  const form = useRef<HTMLFormElement>(null);
  const pre = useRef<HTMLPreElement>(null);
  const [errs, setErrs] = useState<Errs>({});
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [req, setReq] = useState({ txt: "POST /api/messages", p: 0, code: "…", ok: false });
  const [done, setDone] = useState<{ title: string; body: string; acts: React.ReactNode } | null>(null);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; dx: number; dy: number }[]>([]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (phase !== "idle") return;
    const F = new FormData(form.current!);
    const v: Vals = {
      name: String(F.get("name") || "").trim(),
      phone: String(F.get("phone") || "").trim(),
      msg: String(F.get("msg") || "").trim(),
    };
    const er: Errs = {};
    if (v.name.length < 2) er.name = t("e_name");
    if (!/^\+?[\d\s\-()]{8,18}$/.test(v.phone) || v.phone.replace(/\D/g, "").length < 8) er.phone = t("e_phone");
    setErrs(er);
    if (Object.keys(er).length) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase("running");
    setReq({ txt: "POST " + (CONFIG.formEndpoint || "/local/compose"), p: 0, code: "…", ok: false });
    const el = pre.current!;
    el.innerHTML = "";
    const str = (x: string) => '"' + x.replace(/"/g, '\\"') + '"';
    const L: [string, string][][] = [
      [["kw", "import"], ["pn", " { "], ["fn", "send"], ["pn", " } "], ["kw", "from"], ["st", ' "@/lib/mahmoud"'], ["pn", ";"]],
      [],
      [["kw", "const "], ["fn", "message"], ["pn", " = {"]],
      [["at", "  name"], ["pn", ": "], ["st", str(v.name)], ["pn", ","]],
      [["at", "  phone"], ["pn", ": "], ["st", str(v.phone)], ["pn", ","]],
      ...(v.msg ? [[["at", "  details"], ["pn", ": "], ["st", str(v.msg.length > 70 ? v.msg.slice(0, 70) + "…" : v.msg)], ["pn", ","]] as [string, string][]] : []),
      [["at", "  sentAt"], ["pn", ": "], ["kw", "new "], ["tg", "Date"], ["pn", "(),"]],
      [["pn", "};"]],
      [],
      [["kw", "await "], ["fn", "send"], ["pn", "(message);"]],
    ];
    const caret = document.createElement("span");
    caret.className = "caret";
    for (let i = 0; i < L.length; i++) {
      const ln = document.createElement("span");
      ln.className = "ln is-cur";
      ln.dataset.n = String(i + 1);
      el.appendChild(ln);
      el.children[i - 1]?.classList.remove("is-cur");
      ln.appendChild(caret);
      for (const tk of L[i]) {
        const sp = document.createElement("span");
        sp.className = tk[0];
        ln.insertBefore(sp, caret);
        if (reduce) {
          sp.textContent = tk[1];
          continue;
        }
        const chunk = tk[1].length > 14 ? 3 : 2;
        for (let k = 0; k < tk[1].length; k += chunk) {
          sp.textContent = tk[1].slice(0, k + chunk);
          await sleep(12 + Math.random() * 12);
        }
      }
      await sleep(reduce ? 0 : 40);
    }
    setReq((r) => ({ ...r, p: 0.35 }));
    const net = sendMessage({ ...v, company: String(F.get("company") || "") });
    await sleep(reduce ? 0 : 700);
    setReq((r) => ({ ...r, p: 0.75 }));
    const delivered = await net;
    await sleep(reduce ? 0 : 450);
    setReq((r) => ({ ...r, p: 1, code: delivered ? "200 OK ✓" : "offline ✗", ok: delivered }));
    el.insertAdjacentHTML(
      "beforeend",
      `<span class="ln" data-n="${L.length + 1}"><span class="cm">// ${delivered ? "✓ delivered to " + esc(CONFIG.name) : "✓ message compiled"}</span></span>`,
    );
    await sleep(reduce ? 0 : 650);

    const first = esc(v.name.split(/\s+/)[0]);
    const text = `${t("form_send")}:\n${v.name}\n${v.phone}${v.msg ? "\n\n" + v.msg : ""}`;
    const wa = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}` : "";
    const mail = `mailto:${CONFIG.email}?subject=${encodeURIComponent("New project — " + v.name)}&body=${encodeURIComponent(text)}`;
    const again = (
      <button className="btn btn--ghost" type="button" onClick={reset}>
        {t("again")}
      </button>
    );
    if (delivered)
      setDone({
        title: t("d_t").replace("{n}", first),
        body: esc(t("d_p")).replace("{c}", `<span class="mono lime">${esc(v.phone)}</span>`),
        acts: again,
      });
    else
      setDone({
        title: t("d_t2").replace("{n}", first),
        body: esc(t("d_p2")),
        acts: (
          <>
            {wa && (
              <a className="btn btn--lime" href={wa} target="_blank" rel="noopener noreferrer">
                {t("via_wa")}
              </a>
            )}
            <a className={"btn " + (wa ? "btn--ghost" : "btn--lime")} href={mail}>
              {t("via_mail")}
            </a>
            {again}
          </>
        ),
      });
    setPhase("done");
    if (!reduce) {
      const r = form.current!.getBoundingClientRect();
      const now = Date.now();
      setSparks(
        Array.from({ length: 16 }, (_, i) => {
          const a = Math.random() * Math.PI * 2;
          const d = 60 + Math.random() * 90;
          return { id: now + i, x: r.width / 2, y: r.height / 2 - 60, dx: Math.cos(a) * d, dy: Math.sin(a) * d };
        }),
      );
      setTimeout(() => setSparks([]), 1000);
    }
  };

  function reset() {
    form.current?.reset();
    setPhase("idle");
    setDone(null);
    setErrs({});
  }

  const fld = (name: keyof Vals) => "fld" + (errs[name] ? " bad" : "") + (name === "msg" ? " fld--area" : "");
  const clear = (name: keyof Vals) => () => errs[name] && setErrs((e) => ({ ...e, [name]: undefined }));

  return (
    <Reveal>
      <form
        ref={form}
        className={"win cform" + (phase !== "idle" ? " is-running" : "") + (phase === "done" ? " is-done" : "")}
        noValidate
        onSubmit={submit}
      >
        <WinBar title="new-message.ts" />
        <div className="cform__body">
          {/* anti-spam: hidden from people, bots fill it */}
          <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <div className="two">
          <label className={fld("name")}>
            <span className="fld__k">
              <b>const</b> <em>name</em> =
            </span>
            <span className="fld__row">
              <span className="q">&quot;</span>
              <input name="name" autoComplete="name" placeholder={t("ph_name")} onInput={clear("name")} />
              <span className="q">&quot;</span>
            </span>
            <span className="fld__err">{errs.name}</span>
          </label>
            <label className={fld("phone")}>
              <span className="fld__k">
                <b>const</b> <em>phone</em> =
              </span>
              <span className="fld__row">
                <span className="q">&quot;</span>
                <input name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="+20 10 0000 0000" onInput={clear("phone")} />
                <span className="q">&quot;</span>
              </span>
              <span className="fld__err">{errs.phone}</span>
            </label>
          </div>
          <label className={fld("msg")}>
            <span className="fld__k">
              <b>const</b> <em>details</em> = <span style={{ color: "var(--dim)" }}>// {t("optional")}</span>
            </span>
            <span className="fld__row">
              <textarea name="msg" rows={3} placeholder={t("ph_msg")} />
            </span>
            <span className="fld__err" />
          </label>
          <div className="cform__foot">
            <small>{t("form_note")}</small>
            <button className="btn btn--lime" type="submit">
              <span>{t("form_send")}</span>
              <Arrow />
            </button>
          </div>
        </div>
        <div className="cform__run">
          <pre className="code" ref={pre} />
          <div className="req">
            <span>{req.txt}</span>
            <span className="req__bar">
              <span style={{ ["--p" as string]: req.p }} />
            </span>
            <span className={req.ok ? "ok" : ""}>{req.code}</span>
          </div>
        </div>
        <div className="done">
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" />
            <path d="M25 41l10 10 20-22" />
          </svg>
          <h3 dangerouslySetInnerHTML={{ __html: done?.title || "" }} />
          <p dangerouslySetInnerHTML={{ __html: done?.body || "" }} />
          <div className="done__acts">{done?.acts}</div>
        </div>
        {sparks.map((s) => (
          <span
            key={s.id}
            className="spark"
            style={{ left: s.x, top: s.y, ["--dx" as string]: s.dx + "px", ["--dy" as string]: s.dy + "px" }}
          />
        ))}
      </form>
    </Reveal>
  );
}

export default function Contact() {
  const { t, copyEmail } = useApp();
  const [titleRef, titleIn] = useInView<HTMLHeadingElement>();
  const wordmark = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState("--:--");
  const [year, setYear] = useState<number | null>(null);

  const socials = CONFIG.socials
    .filter((s) => s.icon !== "whatsapp" || CONFIG.whatsapp)
    .map((s) => (s.icon === "whatsapp" ? { ...s, url: "https://wa.me/" + CONFIG.whatsapp.replace(/\D/g, "") } : s));

  useEffect(() => {
    setYear(new Date().getFullYear());
    const tick = () => {
      try {
        setClock(
          new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date()),
        );
      } catch {}
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useScrollFrame(() => {
    const el = wordmark.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const seen = innerHeight - r.top; // px of scroll since the wordmark entered the screen
    const left = document.documentElement.scrollHeight - innerHeight - scrollY; // px of scroll still possible
    el.style.setProperty("--fill", (seen <= 0 ? 0 : clamp(seen / (seen + left))) * 100 + "%");
  });

  return (
    <footer className="contact" id="contact">
      <div className="wrap">
        <span className="sec-num">
          <b>06</b> // <span>{t("n_contact")}</span>
        </span>
        <h2 className={"contact__title" + (titleIn ? " is-in" : "")} ref={titleRef}>
          <span className="line">
            <span style={{ ["--i" as string]: 0 }}>{t("ct1")}</span>
          </span>
          <span className="line">
            <span style={{ ["--i" as string]: 1 }}>
              {t("ct2")} <em className="lime">{t("ct3")}</em>
            </span>
          </span>
        </h2>
        <div className="contact__row">
          <div>
            <ContactForm />
            <div className="mail">
              <span className="mail__addr">{CONFIG.email}</span>
              <button className="copy" type="button" onClick={copyEmail}>
                {t("copy")}
              </button>
              <a className="btn btn--lime" href={"mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("New project")}>
                <span>{t("send")}</span>
                <Arrow />
              </a>
            </div>
            <p className="contact__note" dangerouslySetInnerHTML={{ __html: t("ct_note") }} />
          </div>
          <div>
            <span className="side-k">
              <b>$</b> <span>{t("find_me")}</span>
            </span>
            <nav className="soc" aria-label="Social" style={{ ["--n" as string]: socials.length }}>
              {socials.map((s) => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  {SOC_ICONS[s.icon]}
                  <span>{s.label}</span>
                </a>
              ))}
            </nav>
            <div className="win" style={{ marginTop: 18 }}>
              <div className="npm__body" style={{ fontSize: 12.5 }}>
                <div>
                  <span className="kw">status</span>: <span className="lime">&quot;{t("avail")}&quot;</span>
                </div>
                <div>
                  <span className="kw">reply</span>: <span className="st">&quot;&lt; 24h&quot;</span>
                </div>
                <div>
                  <span className="kw">based</span>: <span className="st">&quot;Cairo, Egypt&quot;</span>
                </div>
                <div>
                  <span className="kw">lang</span>: [<span className="st">&quot;ar&quot;</span>, <span className="st">&quot;en&quot;</span>]
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="wordmark" ref={wordmark} aria-hidden="true">
          &lt;{CONFIG.name.toLowerCase()}
          <span className="s">/</span>&gt;
        </div>
        <div className="foot">
          <span>
            © {year} {SITE.fullName} · <span lang="ar">{SITE.fullNameAr}</span> — <span dangerouslySetInnerHTML={{ __html: t("built") }} />
          </span>
          <span className="ops">
            <i />
            <span>{t("ops")}</span> · Cairo <span className="tnum">{clock}</span>
          </span>
          <span>
            <kbd>/</kbd> {t("kbd")} · <kbd>L</kbd> {t("kbd2")}
          </span>
        </div>
      </div>
    </footer>
  );
}
