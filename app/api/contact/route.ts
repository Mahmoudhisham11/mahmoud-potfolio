import nodemailer from "nodemailer";
import { CONFIG, SITE } from "@/lib/data";

/*
  Contact form → your Gmail.
  Set these environment variables (Vercel → Project → Settings → Environment Variables):
    GMAIL_USER          your Gmail address (mh8011651@gmail.com)
    GMAIL_APP_PASSWORD  a 16-character Google "App password" (NOT your normal password)
    CONTACT_TO          optional — where to receive messages (defaults to GMAIL_USER)
  Optional, to use another mail server instead of Gmail: SMTP_HOST, SMTP_PORT
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { name?: unknown; phone?: unknown; msg?: unknown; company?: unknown };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// small in-memory rate limit: 5 messages / 10 minutes per IP
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // honeypot: real people never fill this hidden field
  if (str(body.company, 100)) return Response.json({ ok: true });

  const name = str(body.name, 120);
  const phone = str(body.phone, 30);
  const msg = str(body.msg, 5000);

  const errors: string[] = [];
  if (name.length < 2) errors.push("name");
  if (!/^\+?[\d\s\-()]{8,18}$/.test(phone) || phone.replace(/\D/g, "").length < 8) errors.push("phone");
  if (errors.length) return Response.json({ ok: false, error: "invalid", fields: errors }, { status: 422 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limited(ip)) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) {
    console.error("[contact] GMAIL_USER / GMAIL_APP_PASSWORD are not set");
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });

  const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", dateStyle: "full", timeStyle: "short" }).format(new Date());
  const waLink = "https://wa.me/" + phone.replace(/\D/g, "").replace(/^0/, "20");
  const row = (k: string, v: string) =>
    `<tr><td style="padding:10px 14px;color:#8d939c;font:500 13px monospace;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:10px 14px;color:#0a0b0d;font:15px/1.5 Arial,sans-serif">${v}</td></tr>`;

  const html = `<div style="background:#f3f4f1;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e3e5df">
    <div style="background:#0a0b0d;padding:20px 24px;color:#c8ff2e;font:700 18px monospace">&lt;mahmoud/&gt; · new message</div>
    <div style="padding:8px 10px">
      <table style="width:100%;border-collapse:collapse">
        ${row("name", esc(name))}
        ${row("phone", `<a href="tel:${esc(phone)}">${esc(phone)}</a> · <a href="${waLink}">WhatsApp</a>`)}
        ${msg ? row("details", esc(msg).replace(/\n/g, "<br>")) : ""}
        ${row("sent", esc(when) + " (Cairo)")}
      </table>
    </div>
    <div style="padding:14px 24px;background:#fafaf8;color:#8d939c;font:12px Arial,sans-serif">Tap WhatsApp above to answer ${esc(name)} directly · ${esc(SITE.url.replace("https://", ""))}</div>
  </div></div>`;

  const text = `New message from your portfolio\n\nName: ${name}\nPhone: ${phone}\nWhatsApp: ${waLink}\n${msg ? `\nDetails:\n${msg}\n` : ""}\nSent: ${when} (Cairo)`;

  try {
    await transport.sendMail({
      from: `"${SITE.fullName} · Portfolio" <${user}>`,
      to: process.env.CONTACT_TO || user || CONFIG.email,
      subject: `New project request — ${name}`,
      text,
      html,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
