"use client";

import { useApp } from "./providers";
import { Html, Reveal, Scramble } from "./ui";
import { EN, type Key } from "@/lib/i18n";

function Body({ n, tag, k }: { n: string; tag: string; k: "sv1" | "sv2" | "sv3" }) {
  const { t } = useApp();
  return (
    <div className="svc__body">
      <span className="svc__num">
        {n} / {tag}
      </span>
      <Html as="h3" html={t(k)} />
      <Html as="p" html={t((k + "p") as Key)} />
      <ul>
        {(["a", "b", "c"] as const)
          .filter((x) => k + x in EN)
          .map((x) => (
          <li key={x} dangerouslySetInnerHTML={{ __html: t((k + x) as Key) }} />
        ))}
      </ul>
    </div>
  );
}

export default function Services() {
  const { t } = useApp();
  return (
    <section className="sec" id="services" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num">
            <b>03</b> // <span>{t("n_services")}</span>
          </span>
          <Scramble className="sec-title" text={t("svc_t")} />
        </header>
        <div className="svc-grid">
          <Reveal as="article" className="win svc" d={0}>
            <div className="ill ill-web">
              <div className="bro">
                <div className="t">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="rows">
                  <span className="sk" style={{ width: "55%", height: 14 }} />
                  <span className="sk" style={{ width: "80%" }} />
                  <div className="cards3">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
              <svg className="ptr" viewBox="0 0 24 24">
                <path d="M4 2l16 9-7 2-3 7z" fill="#c8ff2e" stroke="#0a0b0d" strokeWidth="1.5" />
              </svg>
            </div>
            <Body n="01" tag="web" k="sv1" />
          </Reveal>
          <Reveal as="article" className="win svc" d={1}>
            <div className="ill ill-dash">
              <div className="kpi">
                +38%<small>revenue / mo</small>
              </div>
              <div className="bars">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} style={{ ["--i" as string]: i }} />
                ))}
              </div>
            </div>
            <Body n="02" tag="dashboards" k="sv2" />
          </Reveal>
          <Reveal as="article" className="win svc" d={2}>
            <div className="ill ill-be">
              <svg viewBox="0 0 360 210" preserveAspectRatio="xMidYMid meet">
                <path className="wire" d="M70 105 H160 M200 105 H290 M180 125 V170" />
                <path className="flow" d="M70 105 H160 M200 105 H290 M180 125 V170" />
                <rect className="node" x="30" y="85" width="40" height="40" rx="9" />
                <text x="50" y="145" textAnchor="middle">client</text>
                <rect className="nodeL" x="160" y="85" width="40" height="40" rx="9" />
                <text x="180" y="78" textAnchor="middle" style={{ fill: "#c8ff2e" }}>api</text>
                <rect className="node" x="290" y="85" width="40" height="40" rx="20" />
                <text x="310" y="145" textAnchor="middle">database</text>
                <rect className="node" x="160" y="170" width="40" height="26" rx="6" />
                <text x="210" y="187">auth</text>
              </svg>
            </div>
            <Body n="03" tag="backend" k="sv3" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
