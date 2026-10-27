/* =====================================================================
   ✏️  EDIT YOUR INFO HERE — عدّل بياناتك من هنا
   ===================================================================== */

export type Skill = { name: string; level: number };
export type Social = { label: string; icon: "github" | "facebook" | "instagram" | "whatsapp" | "tiktok"; url: string };
export type Commit = {
  type: "feat" | "release" | "fix" | "init";
  date: string;
  title: string;
  body: string;
  ar: { title: string; body: string };
};

/* ---------- SEO / site identity ---------- */
export const SITE = {
  url: "https://mahmoudhisham.online",
  fullName: "Mahmoud Hisham",
  fullNameAr: "محمود هشام",
  jobTitle: "Software Engineer",
  jobTitleAr: "مهندس برمجيات",
  city: "Cairo",
  country: "EG",
  company: "Devora",
  title: "Mahmoud Hisham (محمود هشام) — Software Engineer in Cairo",
  description:
    "Mahmoud Hisham (محمود هشام) is a software engineer in Cairo, Egypt, and founder of Devora. He builds web apps, dashboards and backends with Next.js, PHP, Python and JavaScript for shops, factories and companies.",
  descriptionAr:
    "محمود هشام — مهندس برمجيات من القاهرة ومؤسس شركة Devora. ببني مواقع ولوحات تحكم وباك إند بـ Next.js و PHP و Python و JavaScript للمحلات والمصانع والشركات.",
  ogImage: "/og.jpg",
};

export const CONFIG = {
  name: "Mahmoud",
  initials: "MH",
  email: "mh8011651@gmail.com",
  photo: "/images/mahmoud-hisham.jpg",
  whatsapp: "201097025743", // 01097025743 in international format
  formEndpoint: "/api/contact", // sends the contact form to your Gmail (see app/api/contact/route.ts)
  stats: { projects: 20, clients: 50, years: 4 } as Record<string, number>,
  // My skills — level from 0 to 100
  skills: [
    { name: "next.js", level: 92 },
    { name: "javascript", level: 90 },
    { name: "php", level: 82 },
    { name: "python", level: 78 },
  ] as Skill[],
  band: ["Next.js", "PHP", "Python", "JavaScript"],
  socials: [
    { label: "github", icon: "github", url: "https://github.com/Mahmoudhisham11" },
    { label: "tiktok", icon: "tiktok", url: "https://www.tiktok.com/@mahmoudhisham_134" },
    { label: "instagram", icon: "instagram", url: "https://www.instagram.com/mahmoud_hisham777/" },
    { label: "facebook", icon: "facebook", url: "https://www.facebook.com/share/1ceYuqYa1P/" },
    { label: "whatsapp", icon: "whatsapp", url: "https://wa.me/201097025743" },
  ] as Social[],
  // extra profiles that are not shown as buttons but still tell Google they are yours
  profiles: [] as string[],
    // Journey — oldest first (the newest one gets the HEAD → main tag)
  timeline: [
    {
      type: "init", date: "2023", title: "Hello, world",
      body: "Wrote my first line of code — and never stopped.",
      ar: { title: "Hello, world", body: "كتبت أول سطر كود — ومن ساعتها ما وقفتش." },
    },
    {
      type: "release", date: "2024", title: "First paying client",
      body: "Turned code into a business — my first real product running in production.",
      ar: { title: "أول عميل بيدفع", body: "حوّلت الكود لشغل حقيقي — أول منتج حقيقي شغّال في الـ Production." },
    },
    {
      type: "release", date: "2025", title: "First 30 clients",
      body: "Thirty businesses running on systems I built — shops, factories and companies.",
      ar: { title: "أول 30 عميل", body: "30 بيزنس شغّالين على أنظمة أنا بنيتها — محلات ومصانع وشركات." },
    },
    {
      type: "feat", date: "2026", title: "Founded Devora",
      body: "My own software company — systems for shops, factories and companies.",
      ar: { title: "أسست Devora", body: "شركتي للبرمجيات — أنظمة للمحلات والمصانع والشركات." },
    },
  ] as Commit[],
};

/* =====================================================================
   🧩  YOUR PROJECTS — مشاريعك
   - image  : screenshot in /public/images (width/height = real pixel size)
   - link   : live URL opened by the "Open project" button
   ===================================================================== */
export type Project = {
  title: string;
  type: string;
  year: string;
  status: "live" | "building";
  link: string;
  image: { src: string; width: number; height: number };
  desc: string;
  ar: { title: string; type: string; desc: string };
};

export const PROJECTS: Project[] = [
  {
    title: "Cashat", type: "Payment shops management · SaaS", year: "2024", status: "live",
    link: "https://cashat-v2.vercel.app/",
    image: { src: "/images/cashat.jpg", width: 1600, height: 767 },
    desc: "A management system for mobile-payment shops — lines, transactions, capital, cash, debts and daily closing.",
    ar: { title: "Cashat", type: "إدارة محلات الدفع · SaaS", desc: "سيستم لإدارة محلات الدفع — الخطوط والعمليات ورأس المال والنقدي والديون وتقفيل اليوم." },
  },
  {
    title: "Akheen", type: "E-commerce store · Fashion", year: "2025", status: "live",
    link: "https://akheen.vercel.app/",
    image: { src: "/images/akheen.jpg", width: 1600, height: 762 },
    desc: "A premium fashion storefront — elevated essentials, categories, new arrivals, cart and checkout.",
    ar: { title: "Akheen", type: "متجر أونلاين · أزياء", desc: "متجر أزياء أونلاين راقي — تصنيفات ووصل حديثًا وسلة مشتريات ودفع." },
  },
  {
    title: "Nelly", type: "POS & inventory · Beauty", year: "2026", status: "live",
    link: "https://nelly-pos.vercel.app/",
    image: { src: "/images/nelly.jpg", width: 1600, height: 672 },
    desc: "Point of sale, stock and sales system for cosmetics & makeup shops — with day closing, treasury and customer accounts.",
    ar: { title: "Nelly", type: "كاشير ومخزون · تجميل", desc: "نظام كاشير ومخزون ومبيعات لمحلات التجميل والميكب — بتقفيل الأيام والخزنة وحسابات العملاء." },
  },
  {
    title: "Lead Messages", type: "CRM & WhatsApp", year: "2026", status: "live",
    link: "https://lead-messages.vercel.app/crm/leads",
    image: { src: "/images/lead-messages.jpg", width: 1600, height: 763 },
    desc: "A CRM to track leads and message them on WhatsApp — statuses, follow-ups, Excel import and CSV export.",
    ar: { title: "Lead Messages", type: "CRM وواتساب", desc: "CRM لمتابعة العملاء المحتملين ومراسلتهم على واتساب — حالات ومتابعة واستيراد Excel وتصدير CSV." },
  },
];

/* ===================== helpers ===================== */
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const hash = (s: string) => {
  let h = 5381;
  for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0;
  return h.toString(16).padStart(7, "0").slice(0, 7);
};
export const fileOf = (p: Project) => slug(p.title) + ".tsx";
export const hostOf = (url: string) => {
  try {
    const u = new URL(url);
    return u.host + (u.pathname === "/" ? "" : u.pathname);
  } catch {
    return url;
  }
};
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
