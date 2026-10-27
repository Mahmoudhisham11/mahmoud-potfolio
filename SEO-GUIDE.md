# دليل الرفع والـ SEO — mahmoudhisham.online

## 1) ارفع المشروع على Vercel
1. ارفع الفولدر على GitHub (repo جديد).
2. من vercel.com → Add New → Project → اختار الـ repo → Deploy (من غير أي إعدادات).

## 1.5) خلّي الفورم يبعتلك إيميل على Gmail
1. فعّل **2-Step Verification** على حساب Gmail: https://myaccount.google.com/security
2. اعمل **App password**: https://myaccount.google.com/apppasswords → اكتب اسم زي "Portfolio" → Create
   → هيطلعلك كود من 16 حرف. (ده مش الباسورد بتاعك، ومتبعتوش لأي حد.)
3. في Vercel: Project → Settings → Environment Variables → ضيف:
   - `GMAIL_USER` = `mh8011651@gmail.com`
   - `GMAIL_APP_PASSWORD` = الكود اللي طلعلك
4. اعمل **Redeploy** من تبويب Deployments.
5. جرّب تبعت رسالة من الفورم على الموقع — هتوصلك على Gmail، ولو دوست Reply هترد على العميل مباشرة.

### خطة احتياطية (شغالة من غير أي إعداد)
لو الـ Gmail مش متظبط أو حصل فيه مشكلة، الفورم بيبعت تلقائيًا عن طريق **FormSubmit** على `mh8011651@gmail.com`.
- **أول مرة بس:** أول رسالة هتوصلك من FormSubmit فيها زرار **Activate Form** — دوس عليه مرة واحدة.
  بعد كده كل رسالة هتوصلك على طول. (اعمل إرسال تجريبي من الموقع بعد الرفع عشان تفعّله.)
- لو الطريقتين وقعوا مع بعض (نادر جدًا)، العميل بيظهرله زرار "ابعت على واتساب" برسالته جاهزة — فمفيش رسالة بتضيع.

## 2) اربط الدومين من Hostinger
1. في Vercel: Project → Settings → Domains → ضيف `mahmoudhisham.online` و `www.mahmoudhisham.online`.
   خلّي `mahmoudhisham.online` هو الأساسي، و`www` يعمل Redirect عليه.
2. في Hostinger: Domains → mahmoudhisham.online → DNS / Nameservers → DNS records:
   - امسح أي A record قديم للـ `@`.
   - `A`     — Name: `@`   — Points to: `76.76.21.21`
   - `CNAME` — Name: `www` — Points to: `cname.vercel-dns.com`
   (لو Vercel ورّاك قيم مختلفة في صفحة Domains، استخدم القيم اللي هو كاتبها.)
3. استنى من دقايق لكام ساعة لحد ما Vercel يكتب "Valid Configuration".

## 3) سجّل الموقع في Google Search Console
1. ادخل https://search.google.com/search-console → Add property → اختار **Domain** واكتب `mahmoudhisham.online`.
2. جوجل هيديك TXT record → حطه في Hostinger DNS (Type: TXT, Name: `@`) → Verify.
3. من Sitemaps اكتب `sitemap.xml` → Submit.
4. من URL Inspection اكتب `https://mahmoudhisham.online` → Request indexing.

## 4) حاجات بتفرق جدًا في ظهور اسمك وصورتك
- لينكات حساباتك (TikTok و Instagram و Facebook و GitHub) متحطوطة في `lib/data.ts` ومتسجلة في الـ structured data (sameAs)
  اللي بتربط اسمك بالموقع عند جوجل. لو عملت LinkedIn ضيفه في `profiles`.
- **استخدم نفس الصورة ونفس الاسم** "Mahmoud Hisham / محمود هشام" في LinkedIn و GitHub و Facebook و Instagram،
  وحط لينك `https://mahmoudhisham.online` في الـ bio بتاع كل حساب.
- **حط لينك الموقع في مشاريعك** (Nelly و Cashat و Akheen و Lead Messages) في الفوتر مثلًا: "Built by Mahmoud Hisham".
- اعمل حساب **LinkedIn** لو مش عندك — من أقوى المصادر اللي جوجل بيثق فيها للأسماء.

## 5) اعرف إن كل حاجة شغالة
- https://search.google.com/test/rich-results → اكتب الدومين → لازم يطلع "Person" و "ProfilePage".
- https://www.opengraph.xyz → اكتب الدومين → تشوف شكل الكارت لما حد يشير اللينك.

> ملحوظة: الظهور في جوجل بياخد وقت (من أيام لكام أسبوع)، وصورتك في Google Images ممكن تاخد وقت أطول.
