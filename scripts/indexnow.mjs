// Tells Bing (and Yandex, Seznam, Naver…) about every page in the sitemap via IndexNow.
// Run after each deploy:  npm run indexnow
const SITE = "https://mahmoudhisham.online";
const KEY = "57ccc5de0a01b6f806f02e41ca5473c4"; // must match public/57ccc5de0a01b6f806f02e41ca5473c4.txt

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !/\.(jpe?g|png|webp)$/i.test(u));

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(res.status, res.status === 200 || res.status === 202 ? "✓ submitted" : await res.text(), urlList);
