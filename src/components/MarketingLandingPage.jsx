import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageToggle from "./LanguageToggle";

const COPY = {
  en: {
    nav: { howItWorks: "How it works", features: "Features", pricing: "Pricing", haveCode: "I have a code →" },
    hero: {
      headline: "Every guest. Every moment. One gallery.",
      sub: "SnapVault gives your wedding its own private photo gallery — no app needed. Guests just enter a code and start sharing in seconds.",
      cta: "Get started",
      haveCode: "I already have a code",
    },
    how: {
      title: "How it works",
      steps: [
        { icon: "✉️", title: "You get a unique code", body: "We create a private event gallery and give you a short code to share on your invitation or wedding program." },
        { icon: "📸", title: "Guests upload from any phone", body: "No sign-up, no app download. Guests enter the code, tap, and share their photos — it takes seconds." },
        { icon: "🖼️", title: "One live gallery for everyone", body: "Every photo appears in real-time for the whole group. Tag moments, browse memories, and relive the day." },
      ],
    },
    features: {
      title: "Everything you need, nothing you don't",
      items: [
        { icon: "📲", title: "No app required", body: "Works on any smartphone browser. Guests just open the link and go." },
        { icon: "⚡", title: "Real-time gallery", body: "Photos appear live as guests upload. No refresh needed." },
        { icon: "🏷️", title: "Tag & filter", body: "Organise memories by Ceremony, Reception, Family, and more." },
        { icon: "🌐", title: "Bilingual", body: "Full English and Traditional Chinese support — perfect for multicultural weddings." },
        { icon: "🔒", title: "Secure management", body: "Password-protected photo deletion so only you control your gallery." },
        { icon: "🗜️", title: "Auto compression", body: "Photos are compressed on device before upload — fast and storage-efficient." },
      ],
    },
    pricing: {
      title: "Simple, transparent pricing",
      sub: "One event. One flat fee. No subscriptions.",
      plans: [
        {
          name: "Free",
          price: "HK$0",
          period: "forever",
          highlight: false,
          description: "Try it out before your big day.",
          features: ["1 test event", "Up to 50 photos", "Real-time gallery", "Tag & filter", "Bilingual support"],
          cta: "Try for free",
          ctaAction: "try",
        },
        {
          name: "Essential",
          price: "HK$480",
          period: "per event",
          highlight: true,
          description: "Everything you need for your wedding day.",
          features: ["1 event, unlimited guests", "Unlimited photos", "Custom hero image", "Tag & filter", "Password-protected admin", "Priority setup support"],
          cta: "Book now",
          ctaAction: "book",
        },
        {
          name: "Premium",
          price: "HK$880",
          period: "per event",
          highlight: false,
          description: "White-glove experience for your special day.",
          features: ["Everything in Essential", "Custom event code (e.g. YOURNAMES)", "Gallery download for couple", "Dedicated WhatsApp support", "Post-event archive (6 months)"],
          cta: "Contact us",
          ctaAction: "contact",
        },
      ],
    },
    testimonials: {
      title: "Loved by couples in Hong Kong",
      items: [
        { name: "Connie & Man", quote: "Our guests loved it — they were uploading photos before we even cut the cake. It felt like everyone had a front-row seat to every moment.", event: "March 2025, Hong Kong" },
        { name: "Emily & James", quote: "So easy to set up. We printed the code on our table cards and by the end of the night we had over 300 photos from our guests.", event: "January 2025, Hong Kong" },
        { name: "Sophie & Daniel", quote: "The bilingual support was perfect for our families. My parents could use it in Chinese without any help.", event: "December 2024, Hong Kong" },
      ],
    },
    cta: {
      title: "Ready to capture every moment?",
      sub: "Set up your wedding gallery in minutes. We'll send you your event code and you're good to go.",
      button: "Get in touch",
      orTry: "or",
      tryFree: "try it free with code TESTWEDDING",
    },
    footer: {
      tagline: "Wedding memories, shared instantly.",
      links: ["Features", "Pricing", "Contact"],
      copy: "© 2025 SnapVault. Made with love in Hong Kong.",
    },
  },
  "zh-Hant": {
    nav: { howItWorks: "如何運作", features: "功能特點", pricing: "收費", haveCode: "我有婚禮代碼 →" },
    hero: {
      headline: "每位賓客，每個瞬間，一個相簿。",
      sub: "SnapVault 為你的婚禮建立專屬相簿 — 毋須下載 App。賓客只需輸入代碼，即可即時分享照片。",
      cta: "立即開始",
      haveCode: "我已有代碼",
    },
    how: {
      title: "如何運作",
      steps: [
        { icon: "✉️", title: "獲取專屬代碼", body: "我們為你建立私人相簿並提供短代碼，印在請柬或婚禮手冊上即可。" },
        { icon: "📸", title: "賓客用手機上傳", body: "無需登記，無需下載 App。輸入代碼，點擊，即時分享，只需數秒。" },
        { icon: "🖼️", title: "即時共享相簿", body: "每張照片即時呈現，所有賓客共同欣賞。標記時刻，重溫美好回憶。" },
      ],
    },
    features: {
      title: "所需功能，一應俱全",
      items: [
        { icon: "📲", title: "無需下載 App", body: "任何智能手機瀏覽器均可使用，賓客打開連結即可。" },
        { icon: "⚡", title: "即時相簿", body: "賓客上傳後照片即時顯示，無需重新整理。" },
        { icon: "🏷️", title: "標籤與篩選", body: "按儀式、宴會、家人等分類，輕鬆整理回憶。" },
        { icon: "🌐", title: "雙語支援", body: "完整英文及繁體中文支援，適合多元文化婚禮。" },
        { icon: "🔒", title: "安全管理", body: "密碼保護刪除功能，只有你才能管理相簿。" },
        { icon: "🗜️", title: "自動壓縮", body: "上傳前於裝置端壓縮照片，快速且節省儲存空間。" },
      ],
    },
    pricing: {
      title: "收費簡單透明",
      sub: "一個活動，一次收費，無需訂閱。",
      plans: [
        {
          name: "免費版",
          price: "HK$0",
          period: "永久免費",
          highlight: false,
          description: "在大日子前先試用一下。",
          features: ["1 個測試活動", "最多 50 張照片", "即時相簿", "標籤與篩選", "雙語支援"],
          cta: "免費試用",
          ctaAction: "try",
        },
        {
          name: "標準版",
          price: "HK$480",
          period: "每個活動",
          highlight: true,
          description: "婚禮當天所需的一切功能。",
          features: ["1 個活動，無限賓客", "無限照片", "自訂封面圖片", "標籤與篩選", "密碼保護管理", "優先設定支援"],
          cta: "立即預訂",
          ctaAction: "book",
        },
        {
          name: "尊享版",
          price: "HK$880",
          period: "每個活動",
          highlight: false,
          description: "為你的特別日子提供貼心體驗。",
          features: ["標準版全部功能", "專屬代碼（例如：YOURNAMES）", "相簿下載（新人專用）", "WhatsApp 專屬支援", "婚後存檔（6 個月）"],
          cta: "聯絡我們",
          ctaAction: "contact",
        },
      ],
    },
    testimonials: {
      title: "香港新人的心聲",
      items: [
        { name: "Connie & Man", quote: "賓客都非常喜歡 — 還未切蛋糕，大家已經在上傳照片了。感覺每個人都能看到婚禮的每個精彩時刻。", event: "2025年3月，香港" },
        { name: "Emily & James", quote: "設置非常簡單。我們把代碼印在桌卡上，婚禮結束時已收到超過300張賓客拍攝的照片。", event: "2025年1月，香港" },
        { name: "Sophie & Daniel", quote: "雙語支援非常貼心。我的父母可以用中文操作，完全不需要幫忙。", event: "2024年12月，香港" },
      ],
    },
    cta: {
      title: "準備好記錄每個珍貴瞬間了嗎？",
      sub: "數分鐘內即可建立婚禮相簿。我們會發送活動代碼給你，隨即可以使用。",
      button: "立即聯絡",
      orTry: "或",
      tryFree: "用代碼 TESTWEDDING 免費試用",
    },
    footer: {
      tagline: "婚禮回憶，即時分享。",
      links: ["功能特點", "收費", "聯絡我們"],
      copy: "© 2025 SnapVault。以愛製作於香港。",
    },
  },
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-[#c9a227] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function MarketingLandingPage({ language, setLanguage }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const copy = COPY[language] || COPY.en;

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanCta = (action) => {
    if (action === "try") {
      navigate("/enter");
    } else {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#4a4a4a]">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur border-b border-[#e8d9a8]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <span className="font-serif text-xl font-bold text-[#4a4a4a] tracking-tight">SnapVault</span>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollTo("how")} className="text-[#8a8a8a] hover:text-[#4a4a4a] transition">{copy.nav.howItWorks}</button>
            <button onClick={() => scrollTo("features")} className="text-[#8a8a8a] hover:text-[#4a4a4a] transition">{copy.nav.features}</button>
            <button onClick={() => scrollTo("pricing")} className="text-[#8a8a8a] hover:text-[#4a4a4a] transition">{copy.nav.pricing}</button>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle language={language} onChange={setLanguage} />
            <button
              onClick={() => navigate("/enter")}
              className="hidden md:block px-4 py-2 rounded-lg border border-[#c9a227] text-[#c9a227] text-sm font-semibold hover:bg-[#c9a227] hover:text-white transition"
            >
              {copy.nav.haveCode}
            </button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-[#8a8a8a]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e8d9a8]/60 bg-[#faf8f5] px-4 py-4 space-y-3">
            <button onClick={() => scrollTo("how")} className="block w-full text-left text-sm font-medium text-[#4a4a4a] py-2">{copy.nav.howItWorks}</button>
            <button onClick={() => scrollTo("features")} className="block w-full text-left text-sm font-medium text-[#4a4a4a] py-2">{copy.nav.features}</button>
            <button onClick={() => scrollTo("pricing")} className="block w-full text-left text-sm font-medium text-[#4a4a4a] py-2">{copy.nav.pricing}</button>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/enter"); }}
              className="block w-full text-center px-4 py-3 rounded-lg border border-[#c9a227] text-[#c9a227] text-sm font-semibold"
            >
              {copy.nav.haveCode}
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/30 text-[#c9a227] text-sm font-medium">
          Wedding photo sharing, reimagined
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-[#4a4a4a] leading-tight mb-6">
          {copy.hero.headline}
        </h1>
        <p className="text-lg sm:text-xl text-[#8a8a8a] max-w-2xl mx-auto mb-10 leading-relaxed">
          {copy.hero.sub}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 rounded-xl bg-[#c9a227] text-white font-semibold text-lg shadow-md hover:bg-[#b8911f] active:scale-[0.98] transition"
          >
            {copy.hero.cta}
          </button>
          <button
            onClick={() => navigate("/enter")}
            className="px-8 py-4 rounded-xl border-2 border-[#e8d9a8] text-[#4a4a4a] font-semibold text-lg hover:border-[#c9a227] transition"
          >
            {copy.hero.haveCode}
          </button>
        </div>

        {/* Social proof bar */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-[#8a8a8a]">
          <div className="flex items-center gap-2">
            <span className="text-[#c9a227] font-bold text-base">500+</span> photos shared per event
          </div>
          <div className="hidden sm:block w-px h-4 bg-[#e8d9a8]" />
          <div className="flex items-center gap-2">
            <span className="text-[#c9a227] font-bold text-base">0</span> app downloads needed
          </div>
          <div className="hidden sm:block w-px h-4 bg-[#e8d9a8]" />
          <div className="flex items-center gap-2">
            <span className="text-[#c9a227] font-bold text-base">2</span> languages supported
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-white border-y border-[#e8d9a8]/60 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-center text-[#4a4a4a] mb-14">
            {copy.how.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {copy.how.steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#faf8f5] border border-[#e8d9a8] flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-[#c9a227] uppercase tracking-widest mb-2">Step {i + 1}</div>
                <h3 className="font-serif text-lg font-bold text-[#4a4a4a] mb-2">{step.title}</h3>
                <p className="text-[#8a8a8a] text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-center text-[#4a4a4a] mb-14">
            {copy.features.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {copy.features.items.map((f, i) => (
              <div key={i} className="rounded-2xl border border-[#e8d9a8] bg-white p-6">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-[#4a4a4a] mb-1">{f.title}</h3>
                <p className="text-sm text-[#8a8a8a] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white border-y border-[#e8d9a8]/60 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-center text-[#4a4a4a] mb-3">
            {copy.pricing.title}
          </h2>
          <p className="text-center text-[#8a8a8a] mb-14">{copy.pricing.sub}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {copy.pricing.plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-6 flex flex-col ${
                  plan.highlight
                    ? "border-[#c9a227] bg-[#fffbf0] shadow-lg shadow-[#c9a227]/10 relative"
                    : "border-[#e8d9a8] bg-white"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#c9a227] text-white text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <div className="mb-5">
                  <div className="font-bold text-[#4a4a4a] text-lg mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-serif text-3xl font-bold text-[#4a4a4a]">{plan.price}</span>
                    <span className="text-[#8a8a8a] text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-[#8a8a8a]">{plan.description}</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#4a4a4a]">
                      <CheckIcon />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanCta(plan.ctaAction)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition active:scale-[0.98] ${
                    plan.highlight
                      ? "bg-[#c9a227] text-white hover:bg-[#b8911f]"
                      : "border border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-white"
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
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-center text-[#4a4a4a] mb-14">
            {copy.testimonials.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {copy.testimonials.items.map((item, i) => (
              <div key={i} className="rounded-2xl border border-[#e8d9a8] bg-white p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-[#c9a227]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[#4a4a4a] leading-relaxed mb-4 italic">"{item.quote}"</p>
                <div>
                  <div className="font-semibold text-sm text-[#4a4a4a]">{item.name}</div>
                  <div className="text-xs text-[#8a8a8a]">{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="contact" className="bg-[#4a4a4a] py-16 sm:py-24 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            {copy.cta.title}
          </h2>
          <p className="text-white/70 mb-10 text-lg leading-relaxed">{copy.cta.sub}</p>
          <a
            href="mailto:hello@snapvault.me"
            className="inline-block px-10 py-4 rounded-xl bg-[#c9a227] text-white font-semibold text-lg hover:bg-[#b8911f] active:scale-[0.98] transition shadow-lg"
          >
            {copy.cta.button}
          </a>
          <p className="mt-6 text-white/50 text-sm">
            {copy.cta.orTry}{" "}
            <button
              onClick={() => navigate("/enter")}
              className="underline text-white/70 hover:text-white transition"
            >
              {copy.cta.tryFree}
            </button>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#3a3a3a] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div>
            <span className="font-serif font-bold text-white/80 mr-2">SnapVault</span>
            {copy.footer.tagline}
          </div>
          <div className="flex gap-6">
            {copy.footer.links.map((link, i) => (
              <button key={i} className="hover:text-white/70 transition">{link}</button>
            ))}
          </div>
          <div>{copy.footer.copy}</div>
        </div>
      </footer>

    </div>
  );
}
