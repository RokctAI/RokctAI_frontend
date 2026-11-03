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

// Every word of the Sticks landing (agent_sdk 1.25.0, app_type sticks), as
// the concept Ray approved draws it (artifact PDm9514Z16ypx8dk3oQQtq: "this
// is the best design"), with his comments on it built in: the Hire a Stick
// screen and the New hire card side by side in one row (not top to
// bottom), every screen from the app's own tour, and install buttons for
// Android and Windows from the newest release. Sticks is ROKCT's own product and app-only: there is nothing to
// sign up for on the web, so nothing here links to a login.
//
// The names and duties are the app's own (its Hire a Stick screen and the
// team its tour walks through). Tour steps are named by step id; the file
// behind each one is resolved in sticks-sources.ts.

import type { TourStep } from "./sticks-sources";

export const STICKS_SITE_NAME = "Sticks";

export const STICKS_META = {
  title: "Sticks · AI employees that ask first",
  tagline: "AI employees that ask first.",
  description:
    "Sticks are AI employees for your business. Each one has a job and a shift, and asks you before anything leaves the company. Get the app for Android and Windows.",
  keywords: ["AI employees", "AI assistant for small business", "Sticks app", "Android", "Windows"],
};

export const STICKS_NAV = [
  { href: "#meet", label: "Meet your Sticks" },
  { href: "#feed", label: "The feed" },
  { href: "#asks", label: "Asks" },
  { href: "#how", label: "How it works" },
] as const;

export const STICKS_HEADER = {
  home: "Sticks home",
  sections: "Sections",
  theme: "Switch light or dark",
  getApp: "Get the app",
};

export const STICKS_DOWNLOAD = {
  android: "Download for Android",
  windows: "Download for Windows",
  note: "Free from GitHub",
  noteUnknown: "Free from GitHub",
  platforms: "Android phones and Windows PCs",
  soon: "Coming soon",
  soonNote: "The first release is on its way. Watch the releases page to hear when it lands.",
  watch: "Watch for the release",
  missing: "{platform} is coming soon",
};

export const STICKS_HERO = {
  eyebrow: "An app for your phone and PC",
  before: "A team that ",
  mark: "asks",
  after: " before it acts.",
  lede:
    "Sticks are AI employees for your business. Each one has a job, a shift and a day's work. You run them from your phone and they check with you before anything leaves the company.",
  crowdLabel: "A crowd of Sticks seen from above. Only one is looking up.",
  tag: "Only one is looking at you. That one works for you.",
};

export const STICKS_RULES = {
  eyebrow: "The house rule",
  title: ["Sticks ask.", "They never take."],
  rules: [
    { icon: "user-forbid", title: "Never speaks as you", body: "A Stick works under its own name. It does not pretend to be the owner." },
    { icon: "key", title: "Never uses your account", body: "Your email, bank and logins stay yours. A Stick never signs in as you." },
    { icon: "hand-heart", title: "Nothing goes out until you say yes", body: "An email, a call, a shared file: each one waits on your answer." },
  ],
} as const;

export type StickKey = "thandi" | "tumi" | "kabelo" | "naledi" | "lindiwe" | "sipho";

export const STICKS_MEET = {
  eyebrow: "Meet your Sticks",
  before: "Hire for the job, ",
  mark: "not",
  after: " the tool.",
  body: "Pick a role, give the Stick a name, and it starts its shift. These are the roles in the app today.",
  startHere: "Start here",
  roles: [
    { stick: "thandi", role: "Secretary", duty: "Books meetings and sorts email. Holds messages for you and passes them on when you are ready.", featured: true },
    { stick: "tumi", role: "Tenders Officer", duty: "Finds tenders daily and builds the bid pack." },
    { stick: "kabelo", role: "Accounts Clerk", duty: "Raises and chases invoices. Captures receipts." },
    { stick: "naledi", role: "Sales Rep", duty: "Calls back leads and books demos." },
    { stick: "lindiwe", role: "Marketing", duty: "Plans posts and writes the newsletter." },
    { stick: "sipho", role: "Operations", duty: "Keeps the checklists and orders supplies." },
  ] as { stick: StickKey; role: string; duty: string; featured?: boolean }[],
  screen: { step: "sticks_hire" as TourStep, alt: "The Hire a Stick screen in the Sticks app, listing six roles" },
  hire: {
    label: "Example: hiring Sipho as your Operations Stick",
    title: "New hire",
    status: "Starting",
    name: "Sipho",
    role: "Operations",
    facts: [
      ["Reports to", "You"],
      ["Shift", "Mon to Fri, 08:00 to 17:00"],
    ] as [string, string][],
    askLabel: "Asks first",
    ask: "Orders over R2,000",
    steps: [
      { text: "Read your supplier list", done: true },
      { text: "Set up the Monday stock check", done: true },
      { text: "Writing the first order for you to approve", done: false },
    ],
  },
  real: "Real screen: Hire a Stick, with an example first day",
};

export const STICKS_FEED = {
  eyebrow: "The live feed",
  before: "See what every Stick is doing ",
  mark: "right now",
  after: ".",
  paragraphs: [
    "Open the app and the team is there: who is working, who is waiting on you, and who is off duty until the morning.",
    "When a Stick needs something from another Stick, it asks that Stick. When it needs you, it lands in your inbox.",
  ],
  checks: [
    "Every job a Stick works on is in Tasks, with what is still open",
    "Calls a Stick makes are logged with the script and the transcript",
    "A Friday report shows what each Stick finished this week",
  ],
  board: "Your team",
  live: "Live",
  boardLabel: "Example live feed",
  note: "A web demo of the feed, using the example team from the app.",
  team: [
    { stick: "tumi", name: "Tumi", state: "wait", label: "Waiting on you" },
    { stick: "thandi", name: "Thandi", state: "work", label: "Working" },
    { stick: "kabelo", name: "Kabelo", state: "wait", label: "Waiting on you" },
    { stick: "naledi", name: "Naledi", state: "off", label: "Off duty" },
  ] as { stick: StickKey; name: string; state: "work" | "wait" | "off"; label: string }[],
  events: [
    { stick: "tumi", name: "Tumi", role: "Tenders Officer", what: "Drafted the email for the Musina bid pack", pill: "ask" },
    { stick: "thandi", name: "Thandi", role: "Secretary", what: "Held Wednesday morning for the Musina closing" },
    { stick: "kabelo", name: "Kabelo", role: "Accounts Clerk", what: "Asked Thandi for the tender pricing", pill: "hand" },
    { stick: "thandi", name: "Thandi", role: "Secretary", what: "Took a message for you from Tumi: which bank statement to use", pill: "msg" },
    { stick: "kabelo", name: "Kabelo", role: "Accounts Clerk", what: "Wants to call Mokoena Builders about INV-0412", pill: "ask" },
    { stick: "tumi", name: "Tumi", role: "Tenders Officer", what: "Found two new tenders closing this month" },
    { stick: "naledi", name: "Naledi", role: "Sales Rep", what: "Clocked out and wrote the handover for tomorrow" },
    { stick: "thandi", name: "Thandi", role: "Secretary", what: "Booked the Eskom site visit" },
    { stick: "kabelo", name: "Kabelo", role: "Accounts Clerk", what: "Matched October invoices against the bank statement" },
    { stick: "tumi", name: "Tumi", role: "Tenders Officer", what: "Sent quote Q-0188 to Mokoena Builders after you said yes" },
  ] as { stick: StickKey; name: string; role: string; what: string; pill?: "ask" | "msg" | "hand" }[],
  pills: { ask: "Waiting on you", msg: "Message for you", hand: "Stick to Stick" },
};

export const STICKS_ASK = {
  eyebrow: "Asks",
  before: "You get the last word. ",
  mark: "Every time.",
  after: "",
  paragraphs: [
    "When work is about to leave the company, the Stick stops and asks. You see who asked for it, who did it, and exactly what will go out.",
    "One tap to send, change it, or say no. The app shows the same thing for calls and for sharing anything marked sensitive.",
  ],
  card: {
    tryIt: "Try it",
    chip: "Draft · email",
    title: "Tumi wants to send an email",
    due: "Answer by Friday, 10:00",
    chainLabel: "Kabelo asked, Tumi drafted, you decide",
    chain: [
      { stick: "kabelo" as StickKey, name: "Kabelo", did: "asked" },
      { stick: "tumi" as StickKey, name: "Tumi", did: "drafted" },
    ],
    you: { name: "You", did: "decide" },
    why: "Tumi drafted an email to the municipality with the bid pack, as Kabelo asked. Send it?",
    to: ["To", "bids@musina.example"] as [string, string],
    subject: ["Subject", "Musina ICT bid pack"] as [string, string],
    body: "Good day, please find our bid pack attached. Regards, Acme",
    attachment: "bid-pack.pdf",
    guard: "Nothing goes out until you answer. Tumi waits.",
    send: "Send",
    edit: "Edit",
    no: "Don't send",
    outcomes: {
      ok: "Sent. Tumi logs it on the task and tells Kabelo it went out.",
      ed: "You change the wording. Tumi sends your version, not the draft.",
      no: "Nothing is sent. Tumi tells Kabelo you said no and moves on.",
    },
    again: "Ask again",
  },
  screens: [
    { step: "sticks_ask", caption: "Real screen: an ask", alt: "App screen: a Stick asks before it acts, with what will go out", icon: "lock" },
    { step: "sticks_give", caption: "Real screen: give a task", alt: "App screen: give a Stick a task in plain words", icon: "phone" },
  ] as { step: TourStep; caption: string; alt: string; icon: "phone" | "call" | "lock" }[],
};

export const STICKS_BETWEEN = {
  eyebrow: "Who talks to whom",
  before: "It works like a front desk, ",
  mark: "not",
  after: " a stand-in.",
  body: "A Stick talks to you, or to another Stick. Messages for you are left with your Secretary, so you read them when it suits you.",
  lines: [
    { icon: "swap", title: "Stick to Stick", body: "Kabelo needs the tender pricing, so he asks Thandi. You can read every word.", never: false },
    { icon: "inbox", title: "Stick to you", body: "Questions and messages land in one inbox, or the Secretary holds them.", never: false },
    { icon: "spy", title: "Stick as you", body: "Never. No Stick signs your name or logs in as you.", never: true },
  ],
  screens: [
    { step: "sticks_talk", caption: "Real screen: Between Sticks", alt: "App screen: Between Sticks, the messages Sticks send each other" },
    { step: "sticks_inbox", caption: "Real screen: Inbox", alt: "App screen: Inbox, messages for you from your Sticks" },
  ] as { step: TourStep; caption: string; alt: string }[],
};

export const STICKS_GALLERY = {
  eyebrow: "Inside the app",
  title: "The whole office fits in your pocket.",
  body: "Every screen below is taken from the app as it is built today. Swipe to see more.",
  label: "App screens",
  screens: [
    { step: "sticks_team", title: "Your team", body: "Who is on shift and who is waiting on you." },
    { step: "sticks_tasks", title: "Tasks", body: "Every job, and what is still open." },
    { step: "sticks_stick", title: "One Stick", body: "What Thandi is doing now and what needs you." },
    { step: "sticks_calls", title: "Calls", body: "What your Sticks said on the phone." },
    { step: "sticks_report", title: "Friday report", body: "What each Stick finished this week." },
    { step: "sticks_profile", title: "Profile", body: "A Stick's role, shift and what it owns." },
    { step: "sticks_lock", title: "Lock", body: "Step away and the work stays private." },
    { step: "sticks_settings", title: "Settings", body: "What the lock screen shows, and how asks reach you." },
  ] as { step: TourStep; title: string; body: string }[],
};

export const STICKS_HOW = {
  eyebrow: "How it works",
  title: "Three steps. The first one is a download.",
  body: "There is no website to sign up on. Everything happens in the app.",
  steps: [
    { icon: "download", title: "Get the app", body: "Download the app for your Android phone or Windows PC and open it. Your phone may ask once to allow installs from your browser." },
    { icon: "user-add", title: "Hire your first Stick", body: "Choose a name, a gender and a role. That is all the setup asks. The Stick is ready for its shift." },
    { icon: "answer", title: "Answer the asks", body: "Give it a task in plain words. It plans the work, does it, and asks you before anything goes out." },
  ],
};

export const STICKS_FINAL = {
  title: "Your team is waiting in the app.",
  body: "Download Sticks, hire one Stick, and give it the job you keep putting off.",
};

export const STICKS_FOOTER = {
  links: [
    { href: "#meet", label: "Sticks" },
    { href: "#asks", label: "Asks" },
    { href: "#get", label: "Get the app" },
  ],
};

/** The feed's clock starts here (minutes after midnight) and steps a few minutes per event. */
export const FEED_START_MINUTES = 9 * 60 + 12;

export function feedTime(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** `{name}` placeholders filled from `values`; an unknown key is left as written. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => (key in values ? values[key] : whole));
}
