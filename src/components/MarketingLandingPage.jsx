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
    },
    hero: {
      headline1: "Preserve Every",
      headline2: "Candid Moment.",
      sub: "The digital heirloom for your wedding day. A private, elegant gallery where every guest becomes a storyteller. Collect memories in real-time without the noise of social media.",
      cta: "Get Started",
      haveCode: "Have a Code?",
      stat1Value: "10,000+", stat1Label: "Photos Shared",
      stat2Value: "500+",   stat2Label: "Happy Couples",
      stat3Value: "99.9%",  stat3Label: "Uptime",
    },
    how: {
      title: "The Seamless Experience",
      steps: [
        { icon: "qr_code_2",    title: "1. Get Your Code",     body: "Create your vault and get a unique QR code for your event. Print it on place cards or display it at the venue." },
        { icon: "add_a_photo",  title: "2. Guests Upload",     body: "Guests simply scan and snap. No app download required. Photos flow instantly into your private vault." },
        { icon: "photo_library",title: "3. View Your Gallery", body: "Relive the magic as it happens. Curate your digital heirloom and download high-resolution memories forever." },
      ],
    },
    features: {
      eyebrow: "Excellence in every pixel",
      title: "Curated for Quality",
      sub: "Built specifically for the high demands of luxury weddings, ensuring privacy, speed, and elegance.",
      items: [
        { icon: "devices",              title: "No App Required",        body: "Browser-based experience works on any smartphone instantly. No friction for your guests.", wide: true },
        { icon: "bolt",                 title: "Real-time Updates",      body: "Photos appear in the gallery within seconds of being taken.", highlight: true },
        { icon: "sell",                 title: "Tagging & Filtering",    body: "Organise photos by moments: Ceremony, Reception, First Dance, and more." },
        { icon: "translate",            title: "Bilingual Support",      body: "Full English and Traditional Chinese support — perfect for multicultural weddings." },
        { icon: "admin_panel_settings", title: "Admin Deletion",         body: "Full control over your gallery. Remove unwanted photos instantly." },
        { icon: "edit_note",            title: "Guest Message Notes",    body: "Guests can leave a heartfelt note alongside their upload — memories beyond the photo." },
        { icon: "qr_code_2",            title: "Branded QR Code",        body: "Your own custom QR code to print on invitations, table cards, or venue displays." },
        { icon: "slideshow",            title: "Live Slideshow",         body: "Display a real-time slideshow at your reception as photos roll in from every guest." },
        { icon: "compress",             title: "Smart Auto Compression", body: "High-quality visuals that load instantly on any connection speed without eating up guest data.", fullWidth: true },
      ],
    },
    pricing: {
      title: "Tailored for Your Celebration",
      sub: "Choose the perfect plan for your special day.",
      mostPopular: "Most Popular",
      plans: [
        {
          name: "Memories", price: "HK$0", period: "/ Event", highlight: false,
          description: "Experience the magic before your big day.",
          features: [
            "Capture up to 20 precious moments",
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
          description: "Everything you need for the most important day of your life.",
          features: [
            "Unlimited photo uploads",
            "Gallery open for up to 30 days",
            "Full high-resolution downloads",
            "Tag & organise every moment",
            "Heartfelt guest message notes",
            "Your own branded QR code",
            "Real-time live slideshow",
          ],
          cta: "Select Plan", ctaAction: "book",
        },
        {
          name: "Legacy", price: "HK$880", period: "/ Event", highlight: false,
          description: "Your love story, beautifully preserved for years to come.",
          features: [
            "Everything in Heirloom",
            "Gallery preserved for a full year",
            "Curated printed memory book (20 photos)",
            "Premium QR code cards, on us",
          ],
          cta: "Go Pro", ctaAction: "contact",
        },
      ],
    },
    testimonials: {
      title: "What Our Couples Say",
      items: [
        { quote: "Seeing our wedding through the eyes of our guests was the greatest gift. SnapVault captured the moments our professional photographer couldn't possibly catch.", name: "Sarah & James", event: "October 2024" },
        { quote: "The QR codes on the tables worked flawlessly. Even my 80-year-old grandmother was able to upload a photo of the cake!", name: "Mei & David", event: "September 2024" },
        { quote: "The real-time slideshow during the reception was a huge hit! It brought everyone together and made the dinner feel so intimate.", name: "Eleanor & Thomas", event: "December 2024" },
      ],
    },
    cta: {
      title: "Ready to Capture",
      title2: "the Magic?",
      sub: "Start your SnapVault today and ensure not a single candid smile goes unremembered.",
      email: "Email Us",
      tryDemo: "Try Demo",
    },
    footer: {
      tagline: "The Curated Heirloom Experience. Preserving candid memories for the most beautiful days of your life.",
      service: "Service",
      serviceLinks: ["How it works", "Features", "Pricing"],
      company: "Company",
      companyLinks: ["About Us", "Success Stories", "Contact"],
      legal: "Legal",
      legalLinks: ["Privacy Policy", "Terms of Service"],
      copy: "© 2025 SnapVault. The Curated Heirloom Experience.",
    },
  },
  "zh-Hant": {
    nav: {
      howItWorks: "如何運作",
      features: "功能特點",
      pricing: "收費",
      enterCode: "輸入活動代碼",
    },
    hero: {
      headline1: "保存每個",
      headline2: "珍貴瞬間。",
      sub: "你婚禮的數位傳家寶。讓每位賓客成為故事述說者。即時收集回憶，遠離社交媒體的喧囂。",
      cta: "立即開始",
      haveCode: "我有代碼？",
      stat1Value: "10,000+", stat1Label: "已分享照片",
      stat2Value: "500+",   stat2Label: "快樂新人",
      stat3Value: "99.9%",  stat3Label: "系統運行時間",
    },
    how: {
      title: "無縫的體驗",
      steps: [
        { icon: "qr_code_2",    title: "1. 獲取專屬代碼",  body: "建立你的相簿庫，獲取活動唯一二維碼。印在座位卡上或在場地展示。" },
        { icon: "add_a_photo",  title: "2. 賓客上傳",     body: "賓客只需掃描即拍。無需下載 App。照片即時流入你的私人相簿。" },
        { icon: "photo_library",title: "3. 查看相簿",     body: "即時重溫精彩時刻。精心整理數位傳家寶，永久下載高解析度回憶。" },
      ],
    },
    features: {
      eyebrow: "每個像素都精益求精",
      title: "典藏品質",
      sub: "專為豪華婚禮的高要求而設計，確保私密、快速與優雅。",
      items: [
        { icon: "devices",              title: "無需下載 App",    body: "瀏覽器即用體驗，適用於任何智能手機。賓客零障礙使用。",                                     wide: true },
        { icon: "bolt",                 title: "即時更新",       body: "照片在拍攝後數秒內即顯示於相簿中。",                                                           highlight: true },
        { icon: "sell",                 title: "標籤與篩選",     body: "按時刻分類：儀式、宴會、第一支舞等。" },
        { icon: "translate",            title: "雙語支援",       body: "完整英文及繁體中文支援，適合多元文化婚禮。" },
        { icon: "admin_panel_settings", title: "管理員刪除",     body: "完全掌控你的相簿。即時移除不想要的照片。" },
        { icon: "edit_note",            title: "賓客留言備注",   body: "賓客可在上傳照片時附上暖心留言，讓回憶更立體。" },
        { icon: "qr_code_2",            title: "品牌專屬二維碼", body: "你的專屬二維碼，可印在請柬、座位卡或場地展示板上。" },
        { icon: "slideshow",            title: "即時幻燈片",     body: "宴會上即時播放幻燈片，讓所有人分享每一個精彩時刻。" },
        { icon: "compress",             title: "智能自動壓縮",   body: "高質素影像在任何網速下即時載入，不耗盡賓客數據。",                                             fullWidth: true },
      ],
    },
    pricing: {
      title: "為你的婚慶度身訂造",
      sub: "選擇最適合你特別日子的方案。",
      mostPopular: "最受歡迎",
      plans: [
        {
          name: "回憶版", price: "HK$0", period: "/ 每個活動", highlight: false,
          description: "在大日子前先感受 SnapVault 的魔力。",
          features: [
            "珍藏最多20個珍貴瞬間",
            "24小時相簿使用權",
            "共用測試活動代碼",
            "標準畫質相片",
            "通用二維碼",
            "基本相簿瀏覽",
          ],
          cta: "免費開始", ctaAction: "try",
        },
        {
          name: "典藏版", price: "HK$480", period: "/ 每個活動", highlight: true,
          description: "為你最重要的一天，提供一切所需。",
          features: [
            "無限照片上傳",
            "相簿開放最長30天",
            "完整高解析度下載",
            "標籤並整理每個時刻",
            "賓客暖心留言備注",
            "你的專屬品牌二維碼",
            "即時幻燈片播放",
          ],
          cta: "選擇方案", ctaAction: "book",
        },
        {
          name: "傳承版", price: "HK$880", period: "/ 每個活動", highlight: false,
          description: "你的愛情故事，美麗地永久珍藏。",
          features: [
            "典藏版全部功能",
            "相簿保存整整一年",
            "精心印製回憶相冊（精選20張）",
            "尊享高質素二維碼卡",
          ],
          cta: "升級至 Pro", ctaAction: "contact",
        },
      ],
    },
    testimonials: {
      title: "新人的心聲",
      items: [
        { quote: "透過賓客的眼睛看到我們的婚禮，是最珍貴的禮物。SnapVault 捕捉了專業攝影師無法兼顧的每個瞬間。", name: "Sarah & James", event: "2024年10月" },
        { quote: "桌上的二維碼運作完美。連我80歲的祖母也能輕鬆上傳蛋糕的照片！", name: "Mei & David", event: "2024年9月" },
        { quote: "宴會上的即時幻燈片大受歡迎！它把所有人凝聚在一起，讓晚宴更加溫馨。", name: "Eleanor & Thomas", event: "2024年12月" },
      ],
    },
    cta: {
      title: "準備好捕捉",
      title2: "奇蹟時刻了嗎？",
      sub: "立即建立你的 SnapVault，確保每個珍貴笑容都永久留存。",
      email: "電郵聯繫",
      tryDemo: "試用示範",
    },
    footer: {
      tagline: "典藏傳家的體驗。為你生命中最美好的日子保留珍貴回憶。",
      service: "服務",
      serviceLinks: ["如何運作", "功能特點", "收費"],
      company: "公司",
      companyLinks: ["關於我們", "成功故事", "聯絡我們"],
      legal: "法律",
      legalLinks: ["私隱政策", "服務條款"],
      copy: "© 2025 SnapVault. 典藏傳家的體驗。",
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
    <div className="bg-[#fcf9f8] text-[#1b1c1c] font-manrope scroll-smooth">

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 sm:px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-headline font-semibold text-[#775a19]">SnapVault</div>

          <div className="hidden md:flex items-center gap-8">
            {[["how-it-works", copy.nav.howItWorks], ["features", copy.nav.features], ["pricing", copy.nav.pricing]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-zinc-600 hover:text-[#775a19] transition-colors text-sm font-medium">
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle language={language} onChange={setLanguage} />
            <button
              onClick={() => navigate("/enter")}
              className="hidden md:block silk-gradient text-white px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity"
            >
              {copy.nav.enterCode}
            </button>
            <button className="md:hidden p-2 text-zinc-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#d0c5af]/30 bg-white px-6 py-4 space-y-2">
            {[["how-it-works", copy.nav.howItWorks], ["features", copy.nav.features], ["pricing", copy.nav.pricing]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-sm font-medium text-[#1b1c1c] py-2">{label}</button>
            ))}
            <button onClick={() => { setMobileMenuOpen(false); navigate("/enter"); }} className="block w-full text-center mt-2 silk-gradient text-white px-4 py-3 rounded-full text-sm font-semibold">
              {copy.nav.enterCode}
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 px-6 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div className="z-10">
            <h1 className="font-headline text-5xl md:text-7xl font-semibold leading-[1.1] mb-6 -tracking-wide">
              {copy.hero.headline1} <br />
              <span className="text-[#775a19] italic">{copy.hero.headline2}</span>
            </h1>
            <p className="text-lg md:text-xl text-[#4d4635] max-w-xl mb-10 leading-relaxed">
              {copy.hero.sub}
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="silk-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:opacity-90 transition-all"
              >
                {copy.hero.cta}
              </button>
              <button
                onClick={() => navigate("/enter")}
                className="bg-white border border-[#d0c5af]/40 text-[#775a19] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#f6f3f2] transition-all"
              >
                {copy.hero.haveCode}
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 items-center border-t border-[#d0c5af]/30 pt-8">
              {[
                [copy.hero.stat1Value, copy.hero.stat1Label],
                [copy.hero.stat2Value, copy.hero.stat2Label],
                [copy.hero.stat3Value, copy.hero.stat3Label],
              ].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-headline font-bold text-[#775a19]">{val}</div>
                  <div className="text-xs uppercase tracking-widest text-[#4d4635] font-bold">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: images */}
          <div className="relative hidden lg:block">
            {/* Main image */}
            <div className="aspect-[4/5] rounded-xl overflow-hidden relative shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 bg-[#e4e2e1]">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                alt="Wedding celebration"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Secondary image */}
            <div className="absolute -bottom-8 -left-8 w-64 aspect-square rounded-xl overflow-hidden shadow-2xl -rotate-6 bg-[#e4e2e1]">
              <img
                src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=400&q=80"
                alt="Candid wedding photo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 sm:px-8 bg-[#f6f3f2]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-headline text-4xl md:text-5xl font-semibold mb-4 italic">{copy.how.title}</h2>
            <div className="h-1 w-20 bg-[#d4ad65] mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {copy.how.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <Icon name={step.icon} className="text-[#775a19] text-3xl" />
                </div>
                <h3 className="font-headline text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-[#4d4635] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[#775a19] font-bold tracking-widest text-xs uppercase block mb-2">{copy.features.eyebrow}</span>
              <h2 className="font-headline text-4xl font-semibold">{copy.features.title}</h2>
            </div>
            <p className="max-w-md text-[#4d4635]">{copy.features.sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {copy.features.items.map((item, i) => {
              if (item.fullWidth) {
                return (
                  <div key={i} className="md:col-span-3 bg-[#f6f3f2] rounded-xl p-8">
                    <Icon name={item.icon} className="text-[#775a19] text-4xl mb-6 block" />
                    <h4 className="font-headline text-2xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-[#4d4635] max-w-2xl">{item.body}</p>
                  </div>
                );
              }
              if (item.highlight) {
                return (
                  <div key={i} className="bg-[#775a19] text-white rounded-xl p-8 relative overflow-hidden flex flex-col justify-between">
                    <Icon name={item.icon} className="text-[#e9c176] text-4xl mb-6 block" />
                    <div>
                      <h4 className="font-headline text-2xl font-semibold mb-2">{item.title}</h4>
                      <p className="text-[#ffdea5]/80 text-sm">{item.body}</p>
                    </div>
                    <div className="absolute inset-0 silk-gradient opacity-20 pointer-events-none" />
                  </div>
                );
              }
              return (
                <div key={i} className={`bg-[#f6f3f2] rounded-xl p-8 hover:bg-[#eae7e7] transition-colors ${item.wide ? "md:col-span-2 flex flex-col justify-between" : ""}`}>
                  <Icon name={item.icon} className="text-[#775a19] text-4xl mb-6 block" />
                  <div>
                    <h4 className="font-headline text-xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-[#4d4635] text-sm">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 sm:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-semibold mb-4 italic">{copy.pricing.title}</h2>
            <p className="text-[#4d4635]">{copy.pricing.sub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {copy.pricing.plans.map((plan, i) => (
              <div
                key={i}
                className={`p-8 rounded-xl flex flex-col ${
                  plan.highlight
                    ? "bg-white ring-2 ring-[#775a19] shadow-2xl relative scale-105 z-10"
                    : "bg-[#f6f3f2] border border-[#d0c5af]/20"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 silk-gradient text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase whitespace-nowrap">
                    {copy.pricing.mostPopular}
                  </div>
                )}
                <h3 className="font-headline text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-[#4d4635] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-[#4d4635] text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-[#4d4635]">
                      <Icon name="check_circle" className="text-[#775a19] text-lg" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanCta(plan.ctaAction)}
                  className={`w-full py-3 rounded-full font-bold transition-all ${
                    plan.highlight
                      ? "silk-gradient text-white hover:shadow-lg hover:opacity-90"
                      : "border border-[#775a19] text-[#775a19] hover:bg-[#775a19]/5"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 sm:px-8 bg-[#fcf9f8]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl font-semibold mb-16 text-center italic">{copy.testimonials.title}</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {copy.testimonials.items.map((item, i) => (
              <div key={i} className="relative p-8 rounded-xl bg-[#f6f3f2]">
                <Icon name="format_quote" className="text-[#775a19]/20 text-6xl absolute -top-3 -left-1" />
                <p className="italic text-[#1b1c1c] mb-6 relative z-10 leading-relaxed">"{item.quote}"</p>
                <div className="border-t border-[#d0c5af]/30 pt-4">
                  <div className="font-bold text-sm">{item.name}</div>
                  <div className="text-xs text-[#4d4635] font-medium">{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="contact" className="py-24 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto silk-gradient rounded-[2rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-bold mb-6 italic leading-tight">
              {copy.cta.title} <br /> {copy.cta.title2}
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 font-medium">{copy.cta.sub}</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <a
                href="mailto:hello@snapvault.me"
                className="bg-white text-[#775a19] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#fcf9f8] transition-colors"
              >
                {copy.cta.email}
              </a>
              <button
                onClick={() => navigate("/enter")}
                className="text-white underline underline-offset-8 font-bold hover:text-white/80 transition-colors"
              >
                {copy.cta.tryDemo}
              </button>
            </div>
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full py-12 px-6 sm:px-8 bg-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="md:col-span-1">
            <div className="text-xl font-headline text-[#775a19] mb-4 font-semibold">SnapVault</div>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">{copy.footer.tagline}</p>
          </div>
          <div>
            <h5 className="font-headline font-bold text-[#775a19] mb-6">{copy.footer.service}</h5>
            <ul className="space-y-4">
              {copy.footer.serviceLinks.map((link, i) => (
                <li key={i}><button onClick={() => scrollTo(["how-it-works","features","pricing"][i])} className="text-zinc-500 text-sm hover:underline decoration-[#775a19]/30 underline-offset-4">{link}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-headline font-bold text-[#775a19] mb-6">{copy.footer.company}</h5>
            <ul className="space-y-4">
              {copy.footer.companyLinks.map((link, i) => (
                <li key={i}><button className="text-zinc-500 text-sm hover:underline decoration-[#775a19]/30 underline-offset-4">{link}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-headline font-bold text-[#775a19] mb-6">{copy.footer.legal}</h5>
            <ul className="space-y-4">
              {copy.footer.legalLinks.map((link, i) => (
                <li key={i}><button className="text-zinc-500 text-sm hover:underline decoration-[#775a19]/30 underline-offset-4">{link}</button></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between gap-4 items-center">
          <p className="text-zinc-500 text-xs font-medium">{copy.footer.copy}</p>
          <div className="flex gap-6">
            <a href="mailto:hello@snapvault.me" className="text-zinc-400 hover:text-[#775a19] transition-colors">
              <Icon name="mail" className="text-lg" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
