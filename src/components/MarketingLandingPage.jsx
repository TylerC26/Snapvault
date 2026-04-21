import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";

function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

const COPY = {
  en: {
    nav: {
      howItWorks: "How it works",
      features: "Features",
      pricing: "Pricing",
      enterCode: "Enter Event Code",
      menu: "Menu",
    },
    hero: {
      eyebrow: "Vol. I · Est. MMXXVI",
      headline1: "Preserve every",
      headline2: "candid moment.",
      sub: "The digital heirloom for your wedding day — a private, editorial gallery where every guest becomes a storyteller. Collect memories in real-time, without the noise of social media.",
      cta: "Get Started",
      haveCode: "Have a Code?",
      plateCaption1: "The Ceremony · Plate I",
      plateCaption2: "Reception · Plate II",
      stat1Value: "10,000+", stat1Label: "Photographs",
      stat2Value: "500+",    stat2Label: "Weddings",
      stat3Value: "99.9%",   stat3Label: "Uptime",
    },
    how: {
      eyebrow: "A three-act ceremony",
      title: "The seamless experience",
      steps: [
        { num: "§ I",   title: "Your private code",   body: "Create your vault and receive a unique QR code. Print it on place cards, table numbers, or display it at the venue." },
        { num: "§ II",  title: "Guests contribute",   body: "A simple scan opens the gallery in any browser. No app download. Photographs flow into your vault the instant they're taken." },
        { num: "§ III", title: "Relive the evening",  body: "Watch the story unfold in real-time. Curate, download in high resolution, and keep the archive for a lifetime." },
      ],
    },
    features: {
      eyebrow: "Excellence in every pixel",
      title: "Curated for the occasion",
      sub: "Built for the high demands of a wedding day — private, fast, and set with intention.",
      items: [
        { num: "01", title: "No app required",        body: "Works instantly in any browser. No friction for your guests — grandparents included." },
        { num: "02", title: "Real-time arrivals",     body: "Photographs appear within seconds of being taken. Invited, the gallery never sleeps." },
        { num: "03", title: "Tags & filters",         body: "Organise by moment — Ceremony, Reception, First Dance. Filter the archive by any tag." },
        { num: "04", title: "Bilingual throughout",   body: "Full English and Traditional Chinese support, built for multicultural celebrations." },
        { num: "05", title: "Guest notes",            body: "Each photograph may carry a written note — a sentence, a wish, a quiet memory." },
        { num: "06", title: "Administrative control", body: "Your gallery, your rules. Remove any photograph with a single password." },
        { num: "07", title: "Branded QR codes",       body: "Bespoke QR printed to your wedding's palette. For invitations, place cards, venue displays." },
        { num: "08", title: "Live slideshow",         body: "Project a real-time slideshow at dinner, the evening composing itself as your guests shoot." },
        { num: "09", title: "Smart compression",      body: "High-quality images that load instantly on any connection, without eating your guests' data allowance." },
      ],
    },
    pricing: {
      eyebrow: "Three editions",
      title: "Tailored for your celebration",
      sub: "Choose the edition that suits the day.",
      mostPopular: "Most Chosen",
      plans: [
        {
          name: "Memories", price: "HK$0", period: "/ Event",
          description: "Before the day — a taste of the archive.",
          features: [
            "Up to 20 photographs",
            "24-hour gallery access",
            "Shared test event code",
            "Standard quality images",
            "Generic QR code",
            "Simple gallery browsing",
          ],
          cta: "Start Free", ctaAction: "try",
        },
        {
          name: "Heirloom", price: "HK$480", period: "/ Event", highlight: true,
          description: "Everything required for the most important day of your life.",
          features: [
            "Unlimited photographs",
            "Gallery open for 30 days",
            "Full high-resolution downloads",
            "Tag & organise every moment",
            "Guest message notes",
            "Your branded QR code",
            "Real-time live slideshow",
          ],
          cta: "Select Edition", ctaAction: "book",
        },
        {
          name: "Legacy", price: "HK$880", period: "/ Event",
          description: "Your love story, preserved and printed.",
          features: [
            "Everything in Heirloom",
            "Gallery preserved for a full year",
            "Printed memory book, 20 photographs",
            "Premium QR code cards, on us",
          ],
          cta: "Enquire", ctaAction: "contact",
        },
      ],
    },
    testimonials: {
      eyebrow: "From our couples",
      title: "What they said",
      items: [
        { quote: "Seeing our wedding through our guests' eyes was the greatest gift. SnapVault captured what our photographer never could.", name: "Sarah & James",     event: "October MMXXIV" },
        { quote: "The QR codes on the tables worked flawlessly. Even my eighty-year-old grandmother uploaded a photograph of the cake.",   name: "Mei & David",       event: "September MMXXIV" },
        { quote: "The live slideshow during the reception was the evening's highlight. It made the whole dinner feel intimate.",            name: "Eleanor & Thomas",  event: "December MMXXIV" },
      ],
    },
    cta: {
      eyebrow: "Begin",
      title: "Ready to capture",
      title2: "the magic?",
      sub: "Begin your SnapVault today. Not a single candid smile need go unremembered.",
      email: "Email Us",
      tryDemo: "Try the Demo",
    },
    footer: {
      tagline: "The curated heirloom experience. Preserving candid memories for the most beautiful days of your life.",
      service: "Service",
      serviceLinks: ["How it works", "Features", "Pricing"],
      company: "House",
      companyLinks: ["About Us", "Success Stories", "Contact"],
      legal: "Imprint",
      legalLinks: ["Privacy Policy", "Terms of Service"],
      colophon: "Set in Cormorant & Noto Serif",
      copy: "© MMXXVI SnapVault · The Curated Heirloom",
      correspondence: "Correspondence →",
    },
  },
  "zh-Hant": {
    nav: {
      howItWorks: "典禮之程",
      features: "設計細節",
      pricing: "版本規格",
      enterCode: "輸入活動代碼",
      menu: "選單",
    },
    hero: {
      eyebrow: "第 I 卷 · 始於 MMXXVI",
      headline1: "典藏每一幀",
      headline2: "真摯的光景",
      sub: "此為你婚禮之日的數位家傳——一冊私密而雋永的典藏，讓每位來賓皆成為這夕故事的筆者。遠離社交媒體的喧囂，回憶即時匯入其間。",
      cta: "開卷",
      haveCode: "已有代碼？",
      plateCaption1: "典禮 · 第 I 版",
      plateCaption2: "宴會 · 第 II 版",
      stat1Value: "10,000+", stat1Label: "幀照片典藏",
      stat2Value: "500+",    stat2Label: "對佳偶締盟",
      stat3Value: "99.9%",   stat3Label: "系統運行",
    },
    how: {
      eyebrow: "三幕典禮",
      title: "渾然天成的歷程",
      steps: [
        { num: "§ I",   title: "專屬代碼",   body: "開立你的典藏冊，獲得專屬二維碼。印於席次卡、桌號，或於場地雅置示之。" },
        { num: "§ II",  title: "來賓題錄",   body: "一掃即啟，瀏覽器內直接翻閱。毋需下載應用。照片落下之瞬，便流入你的典藏。" },
        { num: "§ III", title: "重溫當夕",   body: "故事即時展卷於前。悉心編纂，高解析下載，此冊可傳之於後世。" },
      ],
    },
    features: {
      eyebrow: "字字珠璣 · 幀幀經心",
      title: "為典禮量身編纂",
      sub: "專為婚禮之日的至高要求而設——私密、迅疾、且處處用心。",
      items: [
        { num: "01", title: "無須下載應用",   body: "瀏覽器內即啟，任何裝置皆可使用。來賓毫無滯礙，長輩亦然。" },
        { num: "02", title: "即時題錄",       body: "照片拍攝之秒，即現於典藏冊中。此席不眠，此冊常新。" },
        { num: "03", title: "分類與篩選",     body: "依時刻而分——典禮、宴會、第一支舞。可隨意翻閱。" },
        { num: "04", title: "雙語並茂",       body: "英文與繁體中文全然支援，為多元文化之婚慶而設。" },
        { num: "05", title: "題記一筆",       body: "每一幀照片皆可附以題記——一句、一願、一片靜默之心意。" },
        { num: "06", title: "主人權柄",       body: "典藏在你掌中。一密之下，可移除任何一幀。" },
        { num: "07", title: "定製二維碼",     body: "依你婚禮之調印製專屬二維碼。用於請柬、席次卡、場地雅置。" },
        { num: "08", title: "即時幻燈",       body: "宴會時投映即時幻燈，來賓之鏡頭編纂今夕之篇章。" },
        { num: "09", title: "妙絕壓縮",       body: "高質影像於任何連線皆可瞬載，不耗來賓流量分毫。" },
      ],
    },
    pricing: {
      eyebrow: "三個版本",
      title: "為你的佳期量身編纂",
      sub: "擇適合此日的一款。",
      mostPopular: "最獲青睞",
      plans: [
        {
          name: "回憶版", price: "HK$0", period: "/ 每場",
          description: "大日來臨之前——先嚐典藏之味。",
          features: [
            "最多 20 幀照片",
            "典藏冊開放 24 小時",
            "共用測試活動代碼",
            "標準畫質影像",
            "通用版二維碼",
            "基本瀏覽翻閱",
          ],
          cta: "免費試覽", ctaAction: "try",
        },
        {
          name: "典藏版", price: "HK$480", period: "/ 每場", highlight: true,
          description: "為你人生最重要的一日——所需皆備。",
          features: [
            "照片上傳無上限",
            "典藏冊開放三十日",
            "高解析度全數下載",
            "標籤分類每一時刻",
            "來賓題記悉數留存",
            "你的專屬定製二維碼",
            "即時幻燈播映",
          ],
          cta: "選此版", ctaAction: "book",
        },
        {
          name: "傳承版", price: "HK$880", period: "/ 每場",
          description: "你的愛情故事——印刻於世，傳之有年。",
          features: [
            "盡含典藏版所有",
            "典藏冊保存整整一年",
            "精裝回憶相冊（精選 20 幀）",
            "尊享二維碼卡，由我們奉贈",
          ],
          cta: "詳詢", ctaAction: "contact",
        },
      ],
    },
    testimonials: {
      eyebrow: "佳偶之言",
      title: "他們這樣說",
      items: [
        { quote: "透過來賓之眼再看一次我們的婚禮，是最珍貴的饋贈。SnapVault 捕捉了專業攝影師未能兼顧的片刻。", name: "Sarah & James",    event: "甲辰年·十月" },
        { quote: "席上的二維碼運作無礙。連八十歲的祖母也從容地上傳了一幀蛋糕的照片。",                                name: "Mei & David",      event: "甲辰年·九月"  },
        { quote: "宴會上的即時幻燈成了當夕的高潮。它讓整場晚宴格外親暱而動人。",                                      name: "Eleanor & Thomas", event: "甲辰年·十二月" },
      ],
    },
    cta: {
      eyebrow: "開卷",
      title: "可願將此刻",
      title2: "永鑄典藏？",
      sub: "即日開啟你的 SnapVault。不教一抹真摯笑顏，湮沒於時光之中。",
      email: "來函聯繫",
      tryDemo: "試覽示範",
    },
    footer: {
      tagline: "典藏傳家之所在。為你生命中最光輝的日子，悉心留存每一幀真摯。",
      service: "服務",
      serviceLinks: ["典禮之程", "設計細節", "版本規格"],
      company: "館舍",
      companyLinks: ["關於我們", "佳話輯錄", "來函聯繫"],
      legal: "版記",
      legalLinks: ["私隱政策", "服務條款"],
      colophon: "以 Cormorant 及 Noto Serif 排版",
      copy: "© MMXXVI SnapVault · 典藏傳家",
      correspondence: "來函 →",
    },
  },
};

export default function MarketingLandingPage({ language, setLanguage }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const copy = COPY[language] || COPY.en;

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanCta = (action) => {
    if (action === "try") navigate("/enter");
    else document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] scroll-smooth paper-grain">

      {/* ─────────── NAV · Masthead ─────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[var(--paper)]/90 backdrop-blur-sm border-b border-[var(--rule)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 sm:px-10 py-4">
          <button
            onClick={() => scrollTo("top")}
            className="font-display italic text-2xl text-[var(--ink)] hover:text-[var(--sepia)] transition-colors"
          >
            SnapVault
          </button>

          <div className="hidden lg:flex items-center gap-8">
            {[
              ["how-it-works", copy.nav.howItWorks],
              ["features", copy.nav.features],
              ["pricing", copy.nav.pricing],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="eyebrow hover:!text-[var(--ink)] transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <LanguageToggle language={language} onChange={setLanguage} />
            <button
              onClick={() => navigate("/enter")}
              className="hidden lg:inline-flex btn-ink"
            >
              {copy.nav.enterCode}
            </button>
            <button
              className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-[var(--ink)]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={copy.nav.menu || "Menu"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--rule)] bg-[var(--paper)] px-6 py-5">
            {[
              ["how-it-works", copy.nav.howItWorks],
              ["features", copy.nav.features],
              ["pricing", copy.nav.pricing],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left eyebrow py-3 border-b border-[var(--rule)]"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/enter"); }}
              className="btn-ink mt-5 w-full justify-center"
            >
              {copy.nav.enterCode}
            </button>
          </div>
        )}
      </nav>

      {/* ─────────── HERO · Broadsheet front page ─────────── */}
      <section id="top" className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 px-5 sm:px-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-14 lg:gap-20 items-center">

          {/* Left: editorial masthead + headline + prose */}
          <div>
            <div className="flex items-center gap-4 mb-8">
              <span className="w-10 h-px bg-[var(--sepia)]" />
              <span className="eyebrow eyebrow-accent">{copy.hero.eyebrow}</span>
            </div>

            <h1 className="font-display text-[2.75rem] sm:text-6xl md:text-[5.25rem] font-medium leading-[1.02] sm:leading-[0.98] -tracking-[0.01em] text-[var(--ink)]">
              {copy.hero.headline1}<br />
              <span className="italic text-[var(--sepia)]">{copy.hero.headline2}</span>
            </h1>

            <div className="mt-8 sm:mt-10 max-w-xl">
              <p className="font-serif text-base sm:text-lg text-[var(--ink-soft)] leading-[1.7] dropcap">
                {copy.hero.sub}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-10 sm:mt-12">
              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-ink inline-flex items-center gap-3 justify-center"
              >
                <span>{copy.hero.cta}</span>
                <span aria-hidden>→</span>
              </button>
              <button
                onClick={() => navigate("/enter")}
                className="btn-ghost justify-center"
              >
                {copy.hero.haveCode}
              </button>
            </div>
          </div>

          {/* Right: two editorial plates */}
          <div className="relative hidden lg:block">
            <figure className="relative z-10 bg-[var(--paper-card)] p-3 border border-[var(--rule)] shadow-[0_40px_60px_-35px_rgba(28,24,22,0.45)]">
              <div className="aspect-[4/5] overflow-hidden bg-[var(--paper-deep)]">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"
                  alt="Wedding celebration"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="pt-3 pb-1 px-1">
                <span className="eyebrow">{copy.hero.plateCaption1}</span>
              </figcaption>
            </figure>

            <figure className="absolute -bottom-10 -left-10 w-56 z-20 bg-[var(--paper-card)] p-3 border border-[var(--rule)] shadow-[0_40px_60px_-35px_rgba(28,24,22,0.55)]">
              <div className="aspect-square overflow-hidden bg-[var(--paper-deep)]">
                <img
                  src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=500&q=80"
                  alt="Candid wedding moment"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="pt-2 pb-0.5 px-0.5">
                <span className="eyebrow">{copy.hero.plateCaption2}</span>
              </figcaption>
            </figure>
          </div>
        </div>

        {/* Stat rule */}
        <div className="max-w-6xl mx-auto mt-16 lg:mt-24 pt-8 border-t border-[var(--rule)]">
          <div className="grid grid-cols-3 gap-4 sm:gap-10">
            {[
              [copy.hero.stat1Value, copy.hero.stat1Label],
              [copy.hero.stat2Value, copy.hero.stat2Label],
              [copy.hero.stat3Value, copy.hero.stat3Label],
            ].map(([val, label], i) => (
              <div
                key={label}
                className={i < 2 ? "sm:border-r sm:border-[var(--rule)] sm:pr-6" : ""}
              >
                <div className="font-display text-2xl sm:text-5xl text-[var(--ink)]">{val}</div>
                <div className="eyebrow mt-2 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section id="how-it-works" className="py-20 sm:py-24 px-5 sm:px-10 bg-[var(--paper-deep)]/40 border-y border-[var(--rule)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="eyebrow eyebrow-accent">{copy.how.eyebrow}</p>
            <h2 className="font-display italic text-3xl sm:text-5xl text-[var(--ink)] mt-3">
              {copy.how.title}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-5">
              <span className="w-16 h-px bg-[var(--sepia)]" />
              <span className="w-1 h-1 rounded-full bg-[var(--sepia)]" />
              <span className="w-16 h-px bg-[var(--sepia)]" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {copy.how.steps.map((step, i) => (
              <div key={i} className="relative md:px-4">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="hidden md:block absolute left-0 top-1 bottom-1 w-px bg-[var(--rule)]"
                  />
                )}
                <span className="eyebrow eyebrow-accent">{step.num}</span>
                <h3 className="font-display italic text-2xl sm:text-3xl text-[var(--ink)] mt-2">
                  {step.title}
                </h3>
                <div className="w-8 h-px bg-[var(--rule-strong)] mt-4 mb-4" />
                <p className="font-serif text-[var(--ink-soft)] leading-[1.75]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES ─────────── */}
      <section id="features" className="py-20 sm:py-24 px-5 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 sm:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--rule)] pb-8 sm:pb-10">
            <div>
              <p className="eyebrow eyebrow-accent">{copy.features.eyebrow}</p>
              <h2 className="font-display italic text-3xl sm:text-5xl text-[var(--ink)] mt-2">
                {copy.features.title}
              </h2>
            </div>
            <p className="max-w-md font-serif italic text-[var(--ink-soft)] leading-relaxed">
              {copy.features.sub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[var(--rule)] md:border-t-0">
            {copy.features.items.map((item, i) => {
              // Middle column of middle row becomes the inverted "featured" plate
              const featured = i === 4;
              const borderR = (i + 1) % 3 !== 0 ? "md:border-r md:border-[var(--rule)]" : "";
              const borderBDesktop = i < copy.features.items.length - 3 ? "md:border-b md:border-[var(--rule)]" : "";
              const borderBMobile = i < copy.features.items.length - 1 ? "border-b border-[var(--rule)] md:border-b-0" : "";

              if (featured) {
                return (
                  <div
                    key={i}
                    className={`relative bg-[var(--ink)] text-[var(--paper)] p-7 sm:p-8 md:-my-px ${borderR}`}
                  >
                    <span className="font-sans text-xs tracking-[0.22em] uppercase text-[var(--sepia)] font-semibold">
                      №&nbsp;{item.num}
                    </span>
                    <h3 className="font-display italic text-2xl sm:text-3xl mt-3">{item.title}</h3>
                    <div className="w-10 h-px bg-[var(--sepia)] mt-5 mb-5" />
                    <p className="font-serif text-[var(--paper)]/80 leading-[1.7]">
                      {item.body}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`p-7 sm:p-8 ${borderR} ${borderBDesktop} ${borderBMobile}`}
                >
                  <span className="eyebrow eyebrow-accent">№&nbsp;{item.num}</span>
                  <h3 className="font-display italic text-2xl text-[var(--ink)] mt-2">
                    {item.title}
                  </h3>
                  <div className="w-8 h-px bg-[var(--rule-strong)] mt-4 mb-4" />
                  <p className="font-serif text-[var(--ink-soft)] leading-[1.7]">
                    {item.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── PRICING ─────────── */}
      <section id="pricing" className="py-20 sm:py-24 px-5 sm:px-10 bg-[var(--paper-deep)]/40 border-y border-[var(--rule)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="eyebrow eyebrow-accent">{copy.pricing.eyebrow}</p>
            <h2 className="font-display italic text-3xl sm:text-5xl text-[var(--ink)] mt-3">
              {copy.pricing.title}
            </h2>
            <p className="font-serif italic text-[var(--ink-soft)] mt-4 px-2">{copy.pricing.sub}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {copy.pricing.plans.map((plan, i) => {
              const highlight = Boolean(plan.highlight);
              return (
                <div
                  key={i}
                  className={`relative flex flex-col p-7 sm:p-8 bg-[var(--paper-card)] transition-colors
                    ${highlight
                      ? "border-2 border-[var(--sepia)] md:-my-4 md:py-12 shadow-[0_40px_60px_-40px_rgba(122,82,48,0.35)]"
                      : "border border-[var(--rule)]"
                    }`}
                >
                  {highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--paper)] px-3">
                      <span className="eyebrow eyebrow-accent">— {copy.pricing.mostPopular} —</span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display italic text-2xl sm:text-3xl text-[var(--ink)] truncate">{plan.name}</h3>
                    <span className="eyebrow shrink-0">{["I","II","III"][i]}</span>
                  </div>
                  <p className="font-serif italic text-[var(--ink-soft)] mt-2 text-sm leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="my-6 flex items-baseline gap-2 pb-6 border-b border-[var(--rule)]">
                    <span className="font-display text-5xl text-[var(--ink)]">{plan.price}</span>
                    <span className="font-serif italic text-sm text-[var(--ink-mute)]">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-10 flex-grow">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-3 font-serif text-sm text-[var(--ink-soft)] leading-relaxed">
                        <span aria-hidden className="shrink-0 mt-[0.55rem] w-3 h-px bg-[var(--sepia)]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanCta(plan.ctaAction)}
                    className={highlight ? "btn-ink w-full justify-center" : "btn-ghost w-full justify-center"}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS · Pull quotes ─────────── */}
      <section className="py-20 sm:py-24 px-5 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="eyebrow eyebrow-accent">{copy.testimonials.eyebrow}</p>
            <h2 className="font-display italic text-3xl sm:text-5xl text-[var(--ink)] mt-3">
              {copy.testimonials.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-12">
            {copy.testimonials.items.map((item, i) => (
              <figure key={i} className="relative px-2 pt-4">
                <span
                  aria-hidden
                  className="absolute -top-2 sm:-top-6 -left-2 font-display text-[5rem] sm:text-[6rem] leading-none text-[var(--sepia)]/25 select-none"
                >
                  “
                </span>
                <blockquote className="relative font-display italic text-lg sm:text-xl text-[var(--ink)] leading-[1.5]">
                  {item.quote}
                </blockquote>
                <div className="mt-6 pt-4 border-t border-[var(--rule)] flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-serif italic text-[var(--ink)]">— {item.name}</span>
                  <span className="eyebrow">{item.event}</span>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FINAL CTA · Ink block ─────────── */}
      <section id="contact" className="py-20 sm:py-24 px-5 sm:px-10">
        <div className="max-w-5xl mx-auto relative bg-[var(--ink)] text-[var(--paper)] px-6 sm:px-16 py-16 sm:py-24 text-center overflow-hidden">
          {/* corner printer marks */}
          <span aria-hidden className="absolute top-4 sm:top-6 left-4 sm:left-6 w-8 sm:w-10 h-px bg-[var(--sepia)]" />
          <span aria-hidden className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 sm:w-10 h-px bg-[var(--sepia)]" />
          <span aria-hidden className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-8 sm:w-10 h-px bg-[var(--sepia)]" />
          <span aria-hidden className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-8 sm:w-10 h-px bg-[var(--sepia)]" />

          <p className="font-sans text-[0.7rem] sm:text-xs tracking-[0.3em] uppercase text-[var(--sepia)] font-semibold">
            — {copy.cta.eyebrow} —
          </p>
          <h2 className="font-display text-3xl sm:text-6xl mt-5 sm:mt-6 leading-[1.08] sm:leading-[1.05]">
            {copy.cta.title}<br />
            <span className="italic text-[var(--sepia)]">{copy.cta.title2}</span>
          </h2>
          <p className="font-serif italic text-base sm:text-lg text-[var(--paper)]/80 max-w-2xl mx-auto mt-6 sm:mt-8">
            {copy.cta.sub}
          </p>
          <div className="flex items-center justify-center gap-3 mt-10">
            <span className="w-10 h-px bg-[var(--sepia)]" />
            <span className="w-1 h-1 rounded-full bg-[var(--sepia)]" />
            <span className="w-10 h-px bg-[var(--sepia)]" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-10">
            <a
              href="mailto:hello@snapvault.me"
              className="btn-ink !bg-[var(--paper)] !text-[var(--ink)] !border-[var(--paper)] hover:!bg-[var(--sepia)] hover:!text-[var(--paper)] hover:!border-[var(--sepia)]"
            >
              {copy.cta.email}
            </a>
            <button
              onClick={() => navigate("/enter")}
              className="font-sans text-xs tracking-[0.22em] uppercase font-semibold text-[var(--paper)]/80 hover:text-[var(--sepia)] border-b border-[var(--paper)]/40 hover:border-[var(--sepia)] pb-1 transition-colors"
            >
              {copy.cta.tryDemo}
            </button>
          </div>
        </div>
      </section>

      {/* ─────────── FOOTER · Colophon ─────────── */}
      <footer className="px-6 sm:px-10 pt-16 pb-12 border-t border-[var(--rule)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">
            <div className="md:col-span-1">
              <div className="font-display italic text-2xl text-[var(--ink)]">SnapVault</div>
              <p className="font-serif italic text-sm text-[var(--ink-soft)] mt-4 leading-relaxed">
                {copy.footer.tagline}
              </p>
            </div>

            {[
              { heading: copy.footer.service, links: copy.footer.serviceLinks, scrollIds: ["how-it-works", "features", "pricing"] },
              { heading: copy.footer.company, links: copy.footer.companyLinks, scrollIds: [] },
              { heading: copy.footer.legal,   links: copy.footer.legalLinks,   scrollIds: [] },
            ].map((col, c) => (
              <div key={c}>
                <h5 className="eyebrow eyebrow-accent">{col.heading}</h5>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <button
                        onClick={() => col.scrollIds[i] && scrollTo(col.scrollIds[i])}
                        className="font-serif italic text-[var(--ink-soft)] text-sm hover:text-[var(--sepia)] transition-colors"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[var(--rule)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <span className="eyebrow leading-tight">{copy.footer.colophon}</span>
            <span className="font-serif italic text-xs text-[var(--ink-mute)] order-last sm:order-none">{copy.footer.copy}</span>
            <a
              href="mailto:hello@snapvault.me"
              className="eyebrow hover:!text-[var(--sepia)] transition-colors"
              aria-label="Email SnapVault"
            >
              {copy.footer.correspondence}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
