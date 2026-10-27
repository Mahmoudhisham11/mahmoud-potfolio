import { CONFIG, PROJECTS, SITE } from "./data";

const abs = (path: string) => new URL(path, SITE.url).toString();

// Only real profile links belong in `sameAs` (bare "https://github.com/" placeholders are skipped).
const realUrl = (u: string) => {
  try {
    const { pathname } = new URL(u);
    return pathname.replace(/\/+$/, "").length > 0;
  } catch {
    return false;
  }
};

export function jsonLd() {
  const person = {
    "@type": "Person",
    "@id": abs("/#person"),
    name: SITE.fullName,
    alternateName: [SITE.fullNameAr, CONFIG.name, "محمود"],
    givenName: "Mahmoud",
    familyName: "Hisham",
    url: SITE.url,
    image: {
      "@type": "ImageObject",
      "@id": abs("/#photo"),
      url: abs(CONFIG.photo),
      contentUrl: abs(CONFIG.photo),
      width: 768,
      height: 960,
      caption: `${SITE.fullName} (${SITE.fullNameAr}) — ${SITE.jobTitle}`,
      creditText: SITE.fullName,
      creator: { "@id": abs("/#person") },
      copyrightNotice: `© ${SITE.fullName}`,
    },
    email: `mailto:${CONFIG.email}`,
    jobTitle: SITE.jobTitle,
    description: SITE.description,
    worksFor: { "@type": "Organization", name: SITE.company },
    address: { "@type": "PostalAddress", addressLocality: SITE.city, addressCountry: SITE.country },
    nationality: { "@type": "Country", name: "Egypt" },
    knowsAbout: ["Next.js", "PHP", "Python", "JavaScript", "Web development", "Dashboards", "Backend development"],
    knowsLanguage: ["ar", "en"],
    sameAs: [...CONFIG.socials.filter((s) => s.icon !== "whatsapp").map((s) => s.url), ...CONFIG.profiles].filter(realUrl),
    telephone: "+" + CONFIG.whatsapp,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      {
        "@type": "Organization",
        "@id": abs("/#devora"),
        name: SITE.company,
        founder: { "@id": abs("/#person") },
      },
      {
        "@type": "WebSite",
        "@id": abs("/#website"),
        url: SITE.url,
        name: SITE.fullName,
        alternateName: [SITE.fullNameAr, "mahmoudhisham.online"],
        inLanguage: ["en", "ar"],
        publisher: { "@id": abs("/#person") },
      },
      {
        "@type": "ProfilePage",
        "@id": abs("/#profile"),
        url: SITE.url,
        name: SITE.title,
        description: SITE.description,
        isPartOf: { "@id": abs("/#website") },
        about: { "@id": abs("/#person") },
        mainEntity: { "@id": abs("/#person") },
        primaryImageOfPage: { "@id": abs("/#photo") },
        inLanguage: "en",
      },
      {
        "@type": "ItemList",
        "@id": abs("/#projects"),
        name: `Projects by ${SITE.fullName}`,
        itemListElement: PROJECTS.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareApplication",
            name: p.title,
            url: p.link,
            description: p.desc,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            image: abs(p.image.src),
            dateCreated: p.year,
            author: { "@id": abs("/#person") },
          },
        })),
      },
    ],
  };
}
