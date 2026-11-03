/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// The words, numbers and pictures on rokct.ai's landing page (1.24.0), as
// Ray approved them in the redesign concept on 2026-11-01. The section
// components (rokct-hero, rokct-platform, rokct-how, rokct-funding,
// rokct-plans and rokct-closing under components/custom/) draw the layout
// and read everything they say from here, so this is the one file a host
// edits to change what the page says (the installer's hash check then
// leaves the edited copy alone on later composes).
//
// Every sample in the chat console and the module panes is labelled as a
// sample on the page: no real company, invoice or person is named as a
// customer. The pictures are this SDK's own drawings under
// public/landing/agent/ (rk-*.svg), installed by the manifest; nothing is
// hot-linked from another host.

import { PLATFORM_NAME } from "@/app/config/platform";

/** Where the drawn pictures are served from: the shell's own public/landing/agent/. */
export const RK_PICTURES = "/landing/agent";

/** The section ids the header links to, in the header's order. */
export const RK_ANCHORS = {
  ask: "ask",
  platform: "platform",
  how: "how",
  funding: "funding",
  plans: "plans",
  site: "site",
  prices: "prices",
} as const;

/** One tone a status pill takes. */
export type RkTone = "bad" | "ok" | "warn";

/** One row of a sample card in the console or a module pane. */
export interface RkRow {
  label: string;
  sub?: string;
  pill?: { tone: RkTone; text: string };
  /** A stock bar: how full, 0-100. */
  bar?: number;
  value?: string;
}

/** A sample card: its header, its rows and the buttons under them. */
export interface RkCard {
  title: string;
  /** Right-hand side of the card header: plain text, or a pill. */
  meta?: string | { tone: RkTone; text: string };
  rows: RkRow[];
  actions?: { label: string; solid?: boolean; icon?: "send" | "file" | "calendar" }[];
}

/** One scripted exchange in the hero's console. */
export interface RkScenario {
  key: string;
  /** The chip under the console. */
  chip: string;
  /** What the visitor "types". */
  question: string;
  /** The working line shown while ROK "thinks". */
  working: string;
  /** The answer's lead line; **double stars** mark the bold parts. */
  lead: string;
  card: RkCard;
}

export const RK_HERO = {
  eyebrow: "The AI business platform",
  /** The rotating first word of the headline, then the fixed tail. */
  words: ["Everything", "Accounting", "Payroll", "Stock", "Tenders"],
  wordIntervalMs: 2800,
  tail: ["is a chat", "away."],
  lede: `${PLATFORM_NAME.toUpperCase()} runs your accounts, people, stock and sales in one place. You ask ROK in plain words, and it does the work inside your own company system: invoices, leave, orders, leads.`,
  primary: `Start with ${PLATFORM_NAME.toUpperCase()}`,
  secondary: "See what it runs",
  meta: [
    { icon: "building", text: "Your own company site" },
    { icon: "global", text: "Your own domain" },
    { icon: "shield", text: "Big steps wait for your yes" },
  ] as const,
  console: {
    title: "ROK",
    sub: "Connected to your company",
    tag: "sample conversation",
    placeholder: "Ask ROK about your business…",
  },
};

export const RK_SCENARIOS: RkScenario[] = [
  {
    key: "owe",
    chip: "Who still owes us?",
    question: "Who still owes us?",
    working: "Reading accounts · sales invoices",
    lead: "Four invoices are unpaid, **R48 250** in total. Two are past 30 days.",
    card: {
      title: "Unpaid invoices",
      meta: "R48 250",
      rows: [
        { label: "Dube Logistics", sub: "Invoice 0142 · 41 days", pill: { tone: "bad", text: "overdue" }, value: "R18 400" },
        { label: "Naledi Interiors", sub: "Invoice 0147 · 33 days", pill: { tone: "bad", text: "overdue" }, value: "R9 950" },
        { label: "Two more", sub: "due this month", pill: { tone: "warn", text: "due" }, value: "R19 900" },
      ],
      actions: [{ label: "Send reminders", solid: true, icon: "send" }, { label: "Open in accounts" }],
    },
  },
  {
    key: "stock",
    chip: "Are we low on stock?",
    question: "Are we low on stock?",
    working: "Checking stock levels",
    lead: "Three items are below their reorder level.",
    card: {
      title: "Low stock",
      meta: "3 items",
      rows: [
        { label: "Cake flour 10kg", bar: 18, value: "4 left" },
        { label: "Takeaway boxes", bar: 26, value: "120" },
        { label: "Cooking oil 5L", bar: 30, value: "6 left" },
      ],
      actions: [{ label: "Draft a purchase order", solid: true, icon: "file" }, { label: "Not now" }],
    },
  },
  {
    key: "leave",
    chip: "Book Friday off",
    question: "Book Friday off",
    working: "Checking leave balance",
    lead: "Done. You have **9 days** left after this one. It has gone to your manager to approve.",
    card: {
      title: "Leave request",
      meta: { tone: "warn", text: "waiting for approval" },
      rows: [{ label: "Annual leave", sub: "Friday, 7 November · 1 day", value: "9 left" }],
    },
  },
  {
    key: "lead",
    chip: "Add a new lead",
    question: "Add Kagiso Bakeries as a lead, they want a quote",
    working: "Creating a lead in sales",
    lead: "Added and assigned to you. Shall I set a follow-up for Thursday?",
    card: {
      title: "New lead",
      meta: { tone: "ok", text: "saved" },
      rows: [{ label: "Kagiso Bakeries", sub: "Wants a quote · source: chat", value: "Open" }],
      actions: [{ label: "Follow up Thursday", solid: true, icon: "calendar" }, { label: "Write the quote" }],
    },
  },
  {
    key: "grant",
    chip: "Find funding for us",
    question: "Find funding for a small bakery in Gauteng",
    working: "Searching the opportunities list",
    lead: "Here are the closest matches for your size and sector.",
    card: {
      title: "Matches",
      meta: "sample",
      rows: [
        { label: "Food production grant", sub: "Grant · matched on sector", pill: { tone: "ok", text: "open" } },
        { label: "Catering supply tender", sub: "Tender · Gauteng", pill: { tone: "warn", text: "closes soon" } },
        { label: "SME growth investor", sub: "Funder · early stage", pill: { tone: "ok", text: "open" } },
      ],
    },
  },
];

/** One tab of the platform section and the pane it opens. */
export interface RkModule {
  key: string;
  icon: "bank" | "team" | "chart" | "box" | "store" | "phone";
  name: string;
  blurb: string;
  quote: string;
  points: string[];
  tags: string[];
  /** The sample exchange in the pane: the visitor's line, ROK's optional line, the card. */
  ask: string;
  reply?: string;
  card: RkCard;
}

export const RK_PLATFORM = {
  ask: "So what does it actually run?",
  heading: ["One platform.", "Every desk in", "the business."],
  lede: "Accounting comes first. Around it sit HR, sales, projects, stock, a shop till and phone lines. Each part answers to the same chat, so nobody has to learn six programs.",
};

export const RK_MODULES: RkModule[] = [
  {
    key: "money",
    icon: "bank",
    name: "Money",
    blurb: "Accounts, invoices, payments",
    quote: "What came in this month, and what's still unpaid?",
    points: [
      "Sales and purchase invoices, read and drafted by chat",
      "Pending payments and who they belong to",
      "Card payments and customer wallets",
      "Expense claims and staff advances",
    ],
    tags: ["Accounting", "Payments", "Wallets"],
    ask: "What's still unpaid?",
    card: {
      title: "Unpaid invoices",
      meta: "4",
      rows: [
        { label: "Invoice 0142", sub: "41 days", pill: { tone: "bad", text: "overdue" }, value: "R18 400" },
        { label: "Invoice 0147", sub: "33 days", pill: { tone: "bad", text: "overdue" }, value: "R9 950" },
        { label: "Invoice 0151", sub: "12 days", pill: { tone: "warn", text: "due" }, value: "R12 300" },
        { label: "Invoice 0153", sub: "4 days", pill: { tone: "warn", text: "due" }, value: "R7 600" },
      ],
    },
  },
  {
    key: "people",
    icon: "team",
    name: "People",
    blurb: "HR, leave, payslips, hiring",
    quote: "How many leave days do I have left?",
    points: [
      "Leave requests, balances and who is off",
      "Clocking in, attendance and payslips",
      "Approvals waiting on a manager, approved by chat",
      "Job openings, applicants and new-starter onboarding",
    ],
    tags: ["HR", "Payroll", "Hiring"],
    ask: "Approve the leave that's waiting on me",
    card: {
      title: "Waiting on you",
      meta: "2",
      rows: [
        { label: "Annual leave · 3 days", sub: "10 to 12 Nov", pill: { tone: "ok", text: "approved" } },
        { label: "Expense claim · fuel", sub: "R640", pill: { tone: "ok", text: "approved" } },
      ],
    },
  },
  {
    key: "sales",
    icon: "chart",
    name: "Sales",
    blurb: "Leads, deals, customers",
    quote: "Which of my deals have gone quiet?",
    points: [
      "Leads and deals, created and updated by chat",
      "Customers and every call, mail and message logged",
      "Open quotations in one list",
      "Competitors tracked and compared on request",
    ],
    tags: ["CRM", "Quotes", "Competitors"],
    ask: "Which deals have gone quiet?",
    card: {
      title: "Your deals",
      meta: "no contact 14+ days",
      rows: [
        { label: "Office fit-out", sub: "Proposal sent", pill: { tone: "warn", text: "18 days" }, value: "R86 000" },
        { label: "Catering contract", sub: "Meeting held", pill: { tone: "warn", text: "15 days" }, value: "R42 500" },
      ],
    },
  },
  {
    key: "ops",
    icon: "box",
    name: "Operations",
    blurb: "Projects, stock, buying",
    quote: "Are we running low on anything?",
    points: [
      "Stock checks and stock movements",
      "Purchase orders drafted from a sentence",
      "Projects, tasks, notes and timesheets",
      "Support tickets for your own customers",
    ],
    tags: ["Stock", "Buying", "Projects", "Support"],
    ask: "Make a task for Thursday: count the storeroom",
    card: {
      title: "Task created",
      meta: { tone: "ok", text: "done" },
      rows: [{ label: "Count the storeroom", sub: "Thursday · assigned to you" }],
    },
  },
  {
    key: "shop",
    icon: "store",
    name: "Commerce",
    blurb: "Orders, till, kitchen, bookings",
    quote: "How many orders are still cooking?",
    points: [
      "Orders, refunds, reviews and scheduled orders",
      "A shop till that scans barcodes",
      "Kitchen queue, tables and reservations",
      "Loyalty: cashback, referrals, bonuses, promotions",
    ],
    tags: ["Orders", "Till", "Kitchen", "Bookings", "Loyalty"],
    ask: "How many orders are still cooking?",
    reply: "Seven open orders. Three are cooking, the oldest for 21 minutes.",
    card: {
      title: "Kitchen now",
      meta: "7 open",
      rows: [
        { label: "Order 1038", sub: "Delivery · 21 min", pill: { tone: "warn", text: "cooking" }, value: "R248" },
        { label: "Order 1039", sub: "Pickup · 14 min", pill: { tone: "warn", text: "cooking" }, value: "R132" },
        { label: "Order 1040", sub: "Table 4 · 9 min", pill: { tone: "warn", text: "cooking" }, value: "R415" },
        { label: "Four more", sub: "accepted, not started", pill: { tone: "ok", text: "queued" } },
      ],
    },
  },
  {
    key: "reach",
    icon: "phone",
    name: "Reach",
    blurb: "Phones, notices, domains",
    quote: "Send everyone a note: we're open on the public holiday.",
    points: [
      "Business phone numbers and calls",
      "Your own domain, with the secure certificate set up for you",
      "Announcements and notifications to your team",
      "Delivery zones and maps",
    ],
    tags: ["Telephony", "Notices", "Domains", "Delivery"],
    ask: "Tell the team we're open on the 16th",
    card: {
      title: "Announcement",
      meta: { tone: "ok", text: "sent" },
      rows: [{ label: "Open on the public holiday", sub: "To all staff · now" }],
    },
  },
];

export const RK_HOW = {
  ask: "Is it safe to let a chat touch my books?",
  heading: ["You ask. ROK does", "the work. You stay", "in charge."],
  lede: "ROK works inside your company's own system, with your permissions. Anything that needs a manager's yes still waits for one.",
  steps: [
    { n: "01 · ASK", title: "Say it how you'd say it", text: "Type it the way you'd say it to a colleague. No menus to learn, no codes to remember." },
    { n: "02 · WORK", title: "It runs in your own site", text: `Every company on ${PLATFORM_NAME.toUpperCase()} gets its own system. Your plan decides which parts are switched on.` },
    { n: "03 · APPROVE", title: "Nothing big moves without you", text: "Leave, expenses and orders go to the right person for approval, and every step is recorded." },
  ],
};

/** One drawn picture in the "A day's work" grid. */
export interface RkPicture {
  file: string;
  alt: string;
  title: string;
  text: string;
}

export const RK_MAKES = {
  ask: "What will I actually see?",
  heading: ["A day's work,", "on one screen."],
  lede: "Who owes you money, who wants leave, what needs ordering. ROK puts each one in front of you with the next step ready, and you decide.",
  pictures: [
    { file: "rk-invoices.svg", alt: "Unpaid invoices adding up to R48 300, with a Send reminders button", title: "Money owed to you", text: "See who hasn't paid and how late they are, then send every reminder in one go." },
    { file: "rk-leave.svg", alt: "A leave request for five days with Approve and Decline buttons", title: "Leave", text: "Requests come with the dates and days left. Approve or decline in one tap." },
    { file: "rk-payslips.svg", alt: "A November payroll run for 24 staff with payslips ready to send", title: "Payslips", text: "The month's pay worked out with PAYE and UIF, and a payslip for every person." },
    { file: "rk-pipeline.svg", alt: "A sales pipeline with leads, quotes sent and won deals in rand", title: "Sales", text: "Every deal and where it stands, with what each stage is worth in rand." },
    { file: "rk-stock.svg", alt: "A low stock alert for three items with a Draft order button", title: "Stock", text: "Know what is running out before the shelf is empty, with the order drafted." },
    { file: "rk-till.svg", alt: "A kitchen order queue with new, cooking and ready columns", title: "Till and kitchen", text: "Orders rung up at the till land on the kitchen screen in the order they came in." },
    { file: "rk-approvals.svg", alt: "An expense claim approval trail with each step and time recorded", title: "Approvals", text: "Claims, leave and orders go to the right person, and every step is written down." },
    { file: "rk-grants.svg", alt: "A list of grant and tender matches with closing dates", title: "Funding", text: "Grants and tenders that fit your business, with the closing date on each." },
    { file: "rk-policy.svg", alt: "A staff question answered from the company's leave policy, with the page cited", title: "Your policies", text: "ROK reads your policies and manuals, and answers with the page it came from." },
    { file: "rk-phone.svg", alt: "A business phone line ringing three staff members at once", title: "Phone lines", text: "One business number that rings the right people, wherever they are working." },
    { file: "rk-address.svg", alt: "A browser showing a company's own ROKCT system at yourcompany.rokct.ai", title: "Your own address", text: "Your company runs on its own system at its own web address." },
  ] as RkPicture[],
  more: {
    title: "Ask for what isn't shown.",
    text: "Wallets, hiring, bookings and notices answer to the same chat. If something is outside what ROK can do, it tells you plainly.",
    cta: "Ask ROK something",
  },
};

export const RK_FUNDING = {
  ask: "Is there funding we qualify for?",
  heading: ["Grants, funders", "and tenders, found", "by asking."],
  lede: `${PLATFORM_NAME.toUpperCase()} keeps a growing list of grants, investors, enterprise programmes and government tenders. Describe your business and ROK shortlists what fits.`,
  counts: [
    { n: "1,276", label: "grants" },
    { n: "1,185", label: "funders and investors" },
    { n: "149", label: "government tenders" },
    { n: "22", label: "enterprise programmes" },
  ],
  source: `${PLATFORM_NAME.toUpperCase()} opportunities registry · 18 Oct 2026`,
  /** The finder's example query, shown until the visitor types. */
  example: "cleaning company in Limpopo, 12 staff",
  /** What the finder shows before a search: labelled samples. */
  samples: [
    { kind: "Tender", gold: true, title: "Office cleaning services, 36 months", sub: "Provincial department · sample listing", when: ["closes", "21 Nov"] },
    { kind: "Grant", title: "Small enterprise equipment support", sub: "Matched on size and sector · sample", when: ["open"] },
    { kind: "Programme", title: "Enterprise development partner", sub: "Supplier programme · sample", when: ["rolling"] },
    { kind: "Funder", title: "Early-stage SME investor", sub: "Ticket size fits · sample", when: ["open"] },
  ],
};

export const RK_PLANS = {
  ask: "Do I have to buy all of it?",
  heading: ["Start with the books.", "Grow into the suite."],
  lede: "Each plan switches on more of the platform. Begin with accounting, and add people, projects and phones when the business needs them, without moving your data.",
  rungs: [
    { level: "STEP 1", name: "Accounting", text: "The core every plan is built on.", items: ["Invoices and payments", "Ask ROK anything"] },
    { level: "STEP 2", name: "+ Sales and people", text: "For a growing team.", items: ["CRM, leads, deals", "HR, leave, payslips"] },
    { level: "STEP 3", name: "+ Projects and stock", text: "For running the work itself.", items: ["Projects and tasks", "Stock and buying", "Support desk"] },
    { level: "STEP 4", name: "The full suite", text: "Everything, a chat away.", items: ["Business phone lines", "Tender access", "More storage"] },
  ],
  foot: "Prices load from the live plan list, shown in your own currency.",
  cta: "See plans and prices",
};

export const RK_SITE = {
  ask: "Where does my company's data live?",
  heading: ["Your company,", "at your own", "address."],
  lede: `Every company that joins ${PLATFORM_NAME.toUpperCase()} gets its own system, set up for it alone. Point your own domain at it and the rest happens on its own.`,
  points: [
    { icon: "building", title: "A system of your own", text: "Created when you sign up. Not a shared spreadsheet." },
    { icon: "lock", title: "Secure by default", text: "The certificate for your domain is issued and renewed for you." },
    { icon: "stack", title: "Grows with your plan", text: "New modules switch on in place. Nothing to move." },
  ] as const,
  browser: {
    url: "erp.yourcompany.co.za",
    domains: [
      { icon: "global", name: "erp.yourcompany.co.za", sub: "Your company system", pill: { tone: "ok" as RkTone, text: "live" } },
      { icon: "computer", name: "yourcompany.co.za", sub: "Your shop front", pill: { tone: "warn" as RkTone, text: "setting up" } },
    ],
    track: [
      { text: "Address added", state: "done" },
      { text: "Pointing here", state: "done" },
      { text: "Securing", state: "now" },
      { text: "Live", state: "" },
    ],
    note: "ROK: your shop address is pointing here. I'm securing it now and will tell you when it's live.",
  },
};

export const RK_WHERE = {
  ask: "Where do I talk to it?",
  heading: ["Wherever you", "already are."],
  lede: "Same assistant, same company data. Start on the web today; more doors are on the way.",
  doors: [
    { icon: "computer", name: "Web app", text: "The full workspace and chat, in any browser.", live: true },
    { icon: "smartphone", name: "Phone apps", text: "Android and iPhone, for owners on the move.", live: false },
    { icon: "whatsapp", name: "WhatsApp", text: "Message ROK from the app you already use all day.", live: false },
  ] as const,
  available: "Available",
  soon: "Coming soon",
};

export const RK_FAQ = {
  ask: "A few more questions",
  heading: ["Straight", "answers."],
  items: [
    { q: `What is ${PLATFORM_NAME.toUpperCase()}?`, a: "A business platform with accounting at its heart, and HR, sales, projects, stock, shop tools and phone lines around it. ROK, its assistant, lets you run all of it by chat." },
    { q: "Is my company's data kept apart?", a: `Yes. Every company gets its own system on ${PLATFORM_NAME.toUpperCase()}, set up when you sign up. ROK only sees what your login is allowed to see.` },
    { q: "Can I use my own domain?", a: `Yes. Point your domain at ${PLATFORM_NAME.toUpperCase()} and the secure certificate is set up for you, with no manual step.` },
    { q: "How do I pay?", a: "By card, monthly or yearly depending on the plan. Prices are shown in your currency before you sign up." },
    { q: "Can I start small?", a: "Start with accounting and move up a plan when you need more. Nothing has to be moved or set up again." },
  ],
};

export const RK_FINAL = {
  eyebrow: PLATFORM_NAME.toUpperCase(),
  heading: ["Ask ROK", "anything."],
  placeholders: ["What did we sell last week?", "Who still owes us?", "Book Friday off", "Any tenders for us?"],
  label: "Ask ROK anything",
  note: `Start with ${PLATFORM_NAME.toUpperCase()}, and your first question is the setup.`,
};
