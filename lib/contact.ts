import { CONFIG, SITE } from "./data";

export type Message = { name: string; phone: string; msg: string; company?: string };

/**
 * Sends the contact form to your Gmail.
 *  1. Own API route (/api/contact → Gmail via App password) — private and instant.
 *  2. Fallback: FormSubmit (https://formsubmit.co) straight to CONFIG.email, so a message
 *     still arrives if the API isn't configured or is down.
 * Resolves true only when one of them confirms delivery.
 */
export async function sendMessage(m: Message): Promise<boolean> {
  if (m.company) return true; // honeypot filled → bot; pretend success, send nothing

  try {
    const r = await fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(m),
    });
    if (r.ok) return true;
  } catch {}

  try {
    const r = await fetch(`https://formsubmit.co/ajax/${CONFIG.email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New project request — ${m.name}`,
        _template: "table",
        _captcha: "false",
        name: m.name,
        phone: m.phone,
        whatsapp: "https://wa.me/" + m.phone.replace(/\D/g, "").replace(/^0/, "20"),
        message: m.msg || "—",
        source: SITE.url,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && String(j.success) === "true") return true;
  } catch {}

  return false;
}
