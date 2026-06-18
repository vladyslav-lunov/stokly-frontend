// ─── Stokly translations — EN / PL / UK ──────────────────────────────────────

export type Locale = "en" | "pl" | "uk";

export interface Translations {
  // Meta
  appName: string;
  tagline: string;

  // Nav
  nav: { features: string; howItWorks: string; pricing: string; signIn: string; getStarted: string };

  // Announcement bar
  announcementBar: string;
  announcementCta: string;

  // Hero
  heroBadge: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroCta: string;
  heroSecondary: string;
  heroBullets: string[];

  // Pain
  painHeadline: string;
  painSubtitle: string;
  painItems: string[];
  painClosure: string;

  // Features
  featuresLabel: string;
  featuresHeadline: string;
  featuresSubtitle: string;
  features: { title: string; desc: string }[];

  // Outcomes
  outcomesLabel: string;
  outcomesHeadline: string;
  outcomeBefore: string;
  outcomeAfter: string;
  outcomes: { before: string; after: string }[];

  // How it works
  howLabel: string;
  howHeadline: string;
  steps: { title: string; desc: string }[];
  howCta: string;

  // Integrations
  integrationsLabel: string;

  // Pricing
  pricingLabel: string;
  pricingHeadline: string;
  pricingSubtitle: string;
  freePlanLabel: string;
  freePlanNote: string;
  freePlanItems: string[];
  freePlanCta: string;
  proPlanLabel: string;
  proPlanNote: string;
  proPlanItems: string[];
  proPlanCta: string;
  proBadge: string;
  migrationNote: string;

  // Open source
  ossLabel: string;
  ossHeadline: string;
  ossBody: string;
  ossGithub: string;
  ossDocs: string;

  // Final CTA
  ctaHeadline: string;
  ctaBody: string;
  ctaButton: string;
  ctaNote: string;

  // Dashboard empty states
  dashLabel: string;
  dashEmpty: string;
  dashEmptyHint: string;

  // Footer
  footerOss: string;
}

export const translations: Record<Locale, Translations> = {
  // ─────────────────────────────────────────────────────────────────── ENGLISH
  en: {
    appName: "Stokly",
    tagline: "Inventory & Sales — simplified.",

    nav: { features: "Features", howItWorks: "How it works", pricing: "Pricing", signIn: "Sign in", getStarted: "Get started free" },

    announcementBar: "Free plan available — 1 shop, 500 SKUs, 2 users. No credit card.",
    announcementCta: "Try it free",

    heroBadge: "The average small shop loses 4+ hours a week to stock admin",
    heroHeadline: "Stop losing sales to stock problems you could have caught.",
    heroSubtitle: "Stokly gives your shop a single, accurate stock count — across every location, every sales channel — updated with every transaction. In real time.",
    heroCta: "Set up your first shop — free",
    heroSecondary: "Sign in",
    heroBullets: ["Free plan, no card needed", "Set up in minutes", "Open source"],

    painHeadline: "Does this sound familiar?",
    painSubtitle: "These are the situations Stokly is built to prevent.",
    painItems: [
      "You've sold something you didn't have in stock",
      "Your spreadsheet and the shelf don't match",
      "You can't tell which shop has stock without calling",
      "Online orders come in, but you don't know what to pick",
    ],
    painClosure: "Each of these is a solved problem with the right system. Stokly is that system.",

    featuresLabel: "What's included",
    featuresHeadline: "Everything a growing shop needs.",
    featuresSubtitle: "One platform connects your physical locations, your online channels, and your courier partners.",
    features: [
      { title: "Location-based stock control",  desc: "Shops, stockrooms, warehouses — all one model. Stock is tracked per location. No more \"it should be there\"." },
      { title: "POS and order management",       desc: "Sell in person at the counter or fulfill online orders from Allegro, WooCommerce, or your own site — same workflow." },
      { title: "Full movement ledger",           desc: "Every delivery, transfer, and adjustment is logged with who did it and when. You can always see what happened." },
      { title: "Scan to pick",                   desc: "Scan a barcode or QR code to check stock across all locations, or mark order lines as picked from the floor." },
      { title: "Channel integrations",           desc: "Allegro, WooCommerce, InPost, DPD, Nova Poshta. Orders come in automatically. Stock updates go back out." },
      { title: "Team roles and permissions",     desc: "Staff only see their shop. Managers see their locations. Owners see everything. No accidental changes." },
    ],

    outcomesLabel: "What changes",
    outcomesHeadline: "The day-to-day difference is immediate.",
    outcomeBefore: "Before",
    outcomeAfter: "With Stokly",
    outcomes: [
      { before: "Calling staff to check if something's in stock",   after: "Open Stokly and see every location in real time" },
      { before: "Selling the same item twice across two channels",   after: "One stock count, synced to all your sales channels" },
      { before: "Doing a physical count to reconcile your numbers",  after: "Every movement is logged — your count is always live" },
      { before: "Printing and sorting paper pick lists",             after: "Scan a QR code, mark it picked, move on" },
    ],

    howLabel: "Setup",
    howHeadline: "Up and running in minutes — not days.",
    steps: [
      { title: "Create your account",   desc: "Sign up in under a minute. Add your business name and create your first shop location — that's it." },
      { title: "Add your products",     desc: "Import a CSV or add items manually. Set opening stock quantities per location from the start." },
      { title: "Sell and stay accurate", desc: "Use the POS for in-person sales. Online orders sync automatically. Stock adjusts with every transaction." },
    ],
    howCta: "Start step 1 now — it's free",

    integrationsLabel: "Connects with the platforms you already use",

    pricingLabel: "Pricing",
    pricingHeadline: "Start free. Pay only when you grow.",
    pricingSubtitle: "The free plan is permanent — not a trial. When your business grows past it, upgrading takes one click.",
    freePlanLabel: "Free — always",
    freePlanNote: "No credit card, no expiry, no catch.",
    freePlanItems: ["1 shop location", "Up to 500 SKUs", "2 team members", "POS and stock movements", "Basic reports"],
    freePlanCta: "Create free account",
    proPlanLabel: "Pro",
    proPlanNote: "Unlimited locations, SKUs, and users. Cancel anytime.",
    proPlanItems: ["Unlimited locations", "Unlimited SKUs and users", "Allegro + WooCommerce sync", "InPost, DPD, Nova Poshta", "Advanced reports and exports", "Priority support"],
    proPlanCta: "Start 14-day free trial",
    proBadge: "MOST POPULAR",
    migrationNote: "No migration headaches. Start with your current product list — import a CSV or add items one by one. Most shops are fully set up within a day.",

    ossLabel: "Open source",
    ossHeadline: "Your data stays yours — always.",
    ossBody: "Stokly is open source. You can inspect the code, run it yourself, or contribute. No vendor lock-in. No black-box pricing. If we ever shut down, your data and codebase remain with you.",
    ossGithub: "View on GitHub",
    ossDocs: "Read the docs",

    ctaHeadline: "Your stock is either accurate or it isn't.",
    ctaBody: "Stokly makes it accurate — across every location, every channel, every transaction. Set up your first shop for free and see it yourself.",
    ctaButton: "Set up your free shop now",
    ctaNote: "Takes about 5 minutes. No credit card. You can add your products the same day.",

    dashLabel: "Operations Center",
    dashEmpty: "—",
    dashEmptyHint: "Your data starts here. Create an account to begin.",

    footerOss: "open source",
  },

  // ─────────────────────────────────────────────────────────────────── POLISH
  pl: {
    appName: "Stokly",
    tagline: "Stany pod kontrolą. Sprzedaż bez niespodzianek.",

    nav: { features: "Funkcje", howItWorks: "Jak to działa", pricing: "Cennik", signIn: "Zaloguj się", getStarted: "Zacznij bezpłatnie" },

    announcementBar: "Bezpłatny plan na zawsze — 1 sklep, 500 SKU, 2 osoby. Bez karty.",
    announcementCta: "Zacznij teraz",

    heroBadge: "Przeciętny sklep traci 4+ godziny tygodniowo na sprawdzanie stanów",
    heroHeadline: "Zawsze wiedz, co masz na stanie — bez telefonów i arkuszy.",
    heroSubtitle: "Stokly łączy Twoje sklepy, magazyn i kurierów w jeden system. Stany aktualizują się po każdej sprzedaży — w każdym kanale, automatycznie.",
    heroCta: "Otwórz pierwszy sklep — za darmo",
    heroSecondary: "Zaloguj się",
    heroBullets: ["Bezpłatnie, bez karty", "Konfiguracja w 5 minut", "Open source"],

    painHeadline: "Znasz to uczucie?",
    painSubtitle: "Stokly powstał właśnie po to, żeby to się już nie zdarzało.",
    painItems: [
      "Sprzedałeś towar, którego już nie było — i teraz przepraszasz klienta",
      "Excel mówi jedno, półka mówi drugie",
      "Żeby sprawdzić stan w drugim sklepie, musisz dzwonić",
      "Paczkomat już czeka, a Ty nie wiesz jeszcze, co pakować",
    ],
    painClosure: "To rozwiązywalne problemy. Stokly rozwiązuje je jednym narzędziem.",

    featuresLabel: "Co dostajesz",
    featuresHeadline: "Wszystko, czego potrzebuje sklep, który rośnie.",
    featuresSubtitle: "Jedna platforma — dla każdego sklepu, kanału sprzedaży i kuriera.",
    features: [
      { title: "Stany po lokalizacjach",     desc: "Każdy sklep, magazyn i zaplecze to osobna lokalizacja. Stany śledzone osobno, bez pomyłek. Koniec z \"gdzieś powinno być\"." },
      { title: "Kasa i zamówienia w jednym", desc: "Sprzedawaj przy kasie lub realizuj zamówienia z Allegro i WooCommerce — ten sam proces, te same dane." },
      { title: "Pełna historia ruchów",      desc: "Każde przyjęcie, przesunięcie i korekta zapisane z datą i autorem. Zawsze wiadomo, co się stało i kiedy." },
      { title: "Skanuj i kompletuj",         desc: "Skanujesz kod — sprawdzasz stany we wszystkich lokalizacjach lub oznaczasz pozycję jako skompletowaną. Bez papierów." },
      { title: "Integracje bez konfiguracji", desc: "Allegro, WooCommerce, InPost, DPD, Nova Poshta. Zamówienia spływają same. Stany wychodzą automatycznie." },
      { title: "Role dla całego zespołu",    desc: "Kasjer widzi swój sklep. Kierownik — swoje lokalizacje. Właściciel — wszystko. Bez zbędnych uprawnień i pomyłek." },
    ],

    outcomesLabel: "Co się zmienia",
    outcomesHeadline: "Różnicę czujesz od pierwszego dnia.",
    outcomeBefore: "Wcześniej",
    outcomeAfter: "Ze Stokly",
    outcomes: [
      { before: "Telefon do sprzedawcy: 'ile zostało niebieskich w rozmiarze M?'", after: "Otwierasz Stokly — widzisz każdą lokalizację na żywo" },
      { before: "Ta sama para sprzedana i w sklepie, i na Allegro jednocześnie",   after: "Jeden stan, zsynchronizowany wszędzie i od razu" },
      { before: "Raz w miesiącu liczysz ręcznie i zawsze coś nie gra",             after: "Każdy ruch zarejestrowany — stan zawsze się zgadza" },
      { before: "Znajomy plik 'CO_PAKOWAĆ_FINAŁ_v3.xlsx'",                         after: "Skanujesz, kompletujesz, idziesz dalej" },
    ],

    howLabel: "Jak zacząć",
    howHeadline: "Działasz tego samego dnia — nie za tydzień.",
    steps: [
      { title: "Zarejestruj się",        desc: "Minuta na rejestrację. Podaj nazwę firmy — pierwsza lokalizacja gotowa od razu." },
      { title: "Dodaj produkty",          desc: "Wgraj CSV lub dodaj ręcznie. Od razu ustal stany otwarcia po każdej lokalizacji." },
      { title: "Sprzedawaj bez stresu",   desc: "Kasa do sprzedaży stacjonarnej. Zamówienia z Allegro synchronizują się same. Stany zawsze aktualne." },
    ],
    howCta: "Zacznij teraz — bezpłatnie",

    integrationsLabel: "Integruje się z tym, czego już używasz",

    pricingLabel: "Cennik",
    pricingHeadline: "Zacznij za darmo. Płać, gdy naprawdę urośniesz.",
    pricingSubtitle: "Bezpłatny plan nie wygasa. To nie jest trial — możesz korzystać z niego na zawsze.",
    freePlanLabel: "Bezpłatny — na zawsze",
    freePlanNote: "Bez karty. Bez limitu czasowego. Bez żadnego haczyka.",
    freePlanItems: ["1 lokalizacja sklepu", "Do 500 SKU", "2 osoby w zespole", "Kasa i ruchy magazynowe", "Podstawowe raporty"],
    freePlanCta: "Załóż bezpłatne konto",
    proPlanLabel: "Pro",
    proPlanNote: "Bez limitów lokalizacji, SKU i użytkowników. Rezygnujesz kiedy chcesz.",
    proPlanItems: ["Nieograniczone lokalizacje", "Bez limitu SKU i użytkowników", "Allegro + WooCommerce na żywo", "InPost, DPD, Nova Poshta", "Zaawansowane raporty i eksport", "Wsparcie na pierwszym miejscu"],
    proPlanCta: "Wypróbuj Pro przez 14 dni — bezpłatnie",
    proBadge: "NAJPOPULARNIEJSZY",
    migrationNote: "Żadnych bólów głowy z przepinaniem. Zacznij od swojej aktualnej listy produktów — wgraj CSV lub dodawaj po jednym. Większość sklepów działa w Stokly już tego samego dnia.",

    ossLabel: "Open source",
    ossHeadline: "Twój kod, Twoje dane — zawsze.",
    ossBody: "Stokly to otwarte oprogramowanie. Sprawdź kod, uruchom sam lub współtwórz. Żadnego vendor lock-in. Jeśli kiedykolwiek znikniemy — Twój system i dane zostają z Tobą.",
    ossGithub: "Przejdź do GitHub",
    ossDocs: "Dokumentacja",

    ctaHeadline: "Stan magazynowy albo się zgadza, albo nie.",
    ctaBody: "Stokly sprawia, że się zgadza — w każdym sklepie, każdym kanale, po każdej transakcji. Zacznij za darmo i sprawdź sam, jak to wygląda w praktyce.",
    ctaButton: "Zacznij bezpłatnie teraz",
    ctaNote: "Około 5 minut. Bez karty. Produkty możesz dodać jeszcze dzisiaj.",

    dashLabel: "Centrum operacji",
    dashEmpty: "—",
    dashEmptyHint: "Tutaj zaczną się Twoje dane. Załóż konto, żeby wystartować.",

    footerOss: "open source",
  },

  // ─────────────────────────────────────────────────────────────────── UKRAINIAN
  uk: {
    appName: "Stokly",
    tagline: "Залишки під контролем. Продажі без сюрпризів.",

    nav: { features: "Функції", howItWorks: "Як це працює", pricing: "Ціни", signIn: "Увійти", getStarted: "Спробувати безкоштовно" },

    announcementBar: "Безкоштовний план назавжди — 1 магазин, 500 SKU, 2 особи. Без картки.",
    announcementCta: "Спробувати зараз",

    heroBadge: "Малий магазин витрачає 4+ год/тиждень на облік — і це не норма",
    heroHeadline: "Завжди знайте, що є в наявності — без дзвінків і таблиць.",
    heroSubtitle: "Stokly об'єднує всі ваші точки продажу, склад і кур'єрів в одну систему. Залишки оновлюються після кожного продажу — автоматично, в усіх каналах.",
    heroCta: "Відкрити перший магазин безкоштовно",
    heroSecondary: "Увійти",
    heroBullets: ["Безкоштовно, без картки", "Старт за 5 хвилин", "Відкритий код"],

    painHeadline: "Впізнаєте ситуацію?",
    painSubtitle: "Stokly створений саме для того, щоб цього більше не траплялось.",
    painItems: [
      "Продали товар, якого вже не було — і тепер вибачаєтесь перед покупцем",
      "Excel каже одне, полиця — інше",
      "Щоб дізнатись залишок в іншому магазині, треба дзвонити",
      "Нова Пошта вже чекає, а ви ще не знаєте, що пакувати",
    ],
    painClosure: "Це вирішувані задачі. Stokly вирішує їх одним інструментом.",

    featuresLabel: "Що входить",
    featuresHeadline: "Все необхідне для магазину, що розвивається.",
    featuresSubtitle: "Одна платформа — для кожної точки, каналу та кур'єра.",
    features: [
      { title: "Облік по точках",             desc: "Кожен магазин, склад і підсобка — окрема локація. Залишки відслідковуються окремо. Більше жодного 'десь має бути'." },
      { title: "Каса і замовлення разом",      desc: "Продавайте за касою або виконуйте замовлення з Rozetka чи власного сайту — один і той самий процес, одні дані." },
      { title: "Повна історія рухів",          desc: "Кожне надходження, переміщення і коригування — із датою і автором. Завжди можна розібратись, що сталось." },
      { title: "Сканування для збірки",        desc: "Скануйте штрих-код — дізнайтесь залишки по всіх точках або позначте позицію як зібрану. Без паперів." },
      { title: "Інтеграції без налаштувань",   desc: "Нова Пошта, Meest, Укрпошта, Rozetka, WooCommerce. Замовлення приходять самі. Залишки відходять назад." },
      { title: "Ролі для всієї команди",       desc: "Продавець бачить свій магазин. Менеджер — свої точки. Власник — усе. Жодних зайвих прав і випадкових змін." },
    ],

    outcomesLabel: "Що змінюється",
    outcomesHeadline: "Різниця відчувається вже з першого дня.",
    outcomeBefore: "Раніше",
    outcomeAfter: "Зі Stokly",
    outcomes: [
      { before: "Дзвінок продавцю: 'скільки лишилось синіх у розмірі М?'",  after: "Відкриваєте Stokly — бачите всі точки в реальному часі" },
      { before: "Одну пару продали і в магазині, і на Rozetka одночасно",    after: "Єдиний залишок, синхронізований скрізь і одразу" },
      { before: "Раз на місяць рахуєте вручну і знаходите розбіжності",      after: "Кожен рух зафіксований — залишок завжди правильний" },
      { before: "Знайомий файл 'ЩО_ПАКУВАТИ_ФІНАЛ_v3.xlsx'",                after: "Сканував, зібрав, пішов далі" },
    ],

    howLabel: "Як почати",
    howHeadline: "Працюєте того ж дня — не за тиждень.",
    steps: [
      { title: "Зареєструйтесь",         desc: "Хвилина на реєстрацію. Вкажіть назву бізнесу — і перша точка готова." },
      { title: "Додайте товари",          desc: "Завантажте CSV або додайте вручну. Відразу вкажіть залишки по локаціях." },
      { title: "Продавайте без турбот",   desc: "Каса для продажів у залі. Замовлення з Rozetka синхронізуються самі. Залишки завжди актуальні." },
    ],
    howCta: "Спробувати безкоштовно зараз",

    integrationsLabel: "Працює з тим, чим ви вже користуєтесь",

    pricingLabel: "Ціни",
    pricingHeadline: "Старт безкоштовно. Платіть лише коли зростете.",
    pricingSubtitle: "Безкоштовний план не закінчується. Це не тріал — ним можна користуватись скільки завгодно.",
    freePlanLabel: "Безкоштовно — назавжди",
    freePlanNote: "Без картки. Без терміну дії. Без прихованих умов.",
    freePlanItems: ["1 локація магазину", "До 500 SKU", "2 особи в команді", "Каса та рухи товарів", "Базові звіти"],
    freePlanCta: "Зареєструватись безкоштовно",
    proPlanLabel: "Pro",
    proPlanNote: "Без обмежень по локаціях, SKU та користувачах. Відписатись у будь-який момент.",
    proPlanItems: ["Необмежені локації", "Без ліміту SKU та користувачів", "Rozetka + WooCommerce в реальному часі", "Нова Пошта, Meest, Укрпошта", "Розширені звіти та експорт", "Підтримка у пріоритеті"],
    proPlanCta: "Спробувати Pro 14 днів безкоштовно",
    proBadge: "НАЙПОПУЛЯРНІШИЙ",
    migrationNote: "Ніякого болю з переходом. Почніть із поточного списку товарів — завантажте CSV або додайте по одному. Більшість магазинів повністю налаштовані за один день.",

    ossLabel: "Відкритий код",
    ossHeadline: "Ваш код, ваші дані — назавжди.",
    ossBody: "Stokly — відкрите ПЗ. Перевіряйте код, запускайте самостійно або робіть внески. Жодного vendor lock-in. Якщо ми зникнемо — ваша система і дані залишаться з вами.",
    ossGithub: "Переглянути на GitHub",
    ossDocs: "Документація",

    ctaHeadline: "Залишки або під контролем, або ні.",
    ctaBody: "Stokly робить так, щоб вони були під контролем — у кожній точці, кожному каналі, після кожної транзакції. Спробуйте безкоштовно і переконайтесь самі.",
    ctaButton: "Розпочати безкоштовно",
    ctaNote: "Близько 5 хвилин. Без картки. Товари можна додати цього ж дня.",

    dashLabel: "Центр операцій",
    dashEmpty: "—",
    dashEmptyHint: "Тут з'являться ваші дані. Створіть акаунт, щоб почати.",

    footerOss: "відкритий код",
  },
};

export const localeLabels: Record<Locale, string> = { en: "EN", pl: "PL", uk: "UK" };
export const localeFull:   Record<Locale, string> = { en: "English", pl: "Polski", uk: "Українська" };
