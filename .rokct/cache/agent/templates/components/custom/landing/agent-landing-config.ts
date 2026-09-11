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

// Copy for rokctapp's landing page sections (this SDK's floating-nav,
// social, all-features, workflow, pricing, copied-pricing, faq and
// testimonials templates), which register themselves into base_sdk's
// generic landing host through components/custom/landing/page-sections.ts.
// The logos section (logos.tsx) has no copy here since 1.17.0: its items
// are base's network sites and its heading base's "Trusted by".
//
// Ray, 2026-09-03: each home SDK holds its own landing page, the way a Dart
// home SDK holds its profile screens - so the words, images, links and
// prices on those sections live here, in the home SDK, and base_sdk's
// components/custom/landing/landing-config.ts keeps only the generic values
// (auth URLs, the nav's ends, the plans query). A section whose block is
// `null` is not rendered at all; this is the file a host edits to change
// what the page says (the installer's hash check then leaves the edited
// copy alone on later composes). The chat section keeps its copy inline in
// chat-section.tsx; the hero's copy stays in base_sdk's hero-config.ts.

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  ChartLine,
  ClipboardList,
  Code,
  GraduationCap,
  Megaphone,
} from "lucide-react";

import { AI_MODELS } from "@/ai/models";
import { PLATFORM_NAME } from "@/app/config/platform";

/** A link rendered as a call to action. */
export interface LandingLink {
  label: string;
  href: string;
  /** Open in a new tab. */
  external?: boolean;
}

export interface LandingImage {
  src: string;
  alt: string;
}

export interface SocialCard {
  title: string;
  text: string;
  image: LandingImage;
}

export interface SocialConfig {
  badge: string;
  heading: string;
  blurb: string;
  cta: LandingLink;
  cards: SocialCard[];
}

export interface FeaturesConfig {
  heading: string;
  blurb: string;
  items: { name: string; image: string }[];
}

export interface WorkflowPersona {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Tailwind background class for the icon disc. */
  color: string;
  query: string;
  solutions: string[];
}

export interface WorkflowConfig {
  heading: string;
  blurb: string;
  cta: LandingLink;
  /** The hint shown on a card before it is hovered. */
  hoverHint: string;
  personas: WorkflowPersona[];
}

/** What `PricingConfig.localize` resolves to: the visitor's currency. */
export interface PricingLocale {
  currency: string;
  currency_symbol?: string | null;
  exchange_rate: number;
  country_name?: string | null;
}

export interface PricingConfig {
  /** The category tab selected on load. */
  defaultCategory: string;
  /** Display labels per category id; others are title-cased. */
  categoryLabels: Record<string, string>;
  /** Tailwind classes per category tab; others get `defaultCategoryStyle`. */
  categoryStyles: Record<string, string>;
  defaultCategoryStyle: string;
  /** Categories never shown (lower-case ids). */
  hiddenCategories: string[];
  /** Categories whose free plans are hidden (lower-case ids). */
  hideFreePlansIn: string[];
  /** `{token}` substitutions applied to plan feature lines. */
  featureTokens: Record<string, string>;
  /**
   * Resolves the visitor's currency for local prices, or `null` to price
   * everything in USD. Runs on the client after the plans render.
   */
  localize: (() => Promise<PricingLocale | null>) | null;
  labels: {
    joinFree: string;
    daysFree: (days: number) => string;
    select: (plan: string) => string;
    annualBilling: string;
    save: (amount: string) => string;
    seats: string;
    billedAs: (usd: number) => string;
    approx: string;
    global: string;
  };
  ready: { heading: string; blurb: string; cta: string };
}

export interface CompareItem {
  label: string;
  price: string;
  icon?: LandingImage;
}

export interface CompareOtherCard {
  name: string;
  avatar: LandingImage;
  price: string;
  period: string[];
  listHeading: string;
  items: CompareItem[];
}

export interface CompareConfig {
  heading: string;
  blurb: string;
  /** The vertical tab labels on the two decks. */
  tabs: { platform: string; others: string };
  platform: {
    icon: LandingImage;
    price: string;
    period: string[];
    ctas: LandingLink[];
    listHeading: string;
    benefits: string[];
  };
  /** The first card is the visible "others" deck; the second fans out behind it on wide screens. */
  others: [CompareOtherCard, CompareOtherCard];
}

export interface FaqConfig {
  heading: string;
  blurb: string;
  items: { question: string; answer: string }[];
}

export interface Testimonial {
  title: string;
  text: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface TestimonialsConfig {
  items: Testimonial[];
}

export interface AgentLandingConfig {
  social: SocialConfig | null;
  features: FeaturesConfig | null;
  workflow: WorkflowConfig | null;
  pricing: PricingConfig | null;
  compare: CompareConfig | null;
  faq: FaqConfig | null;
  testimonials: TestimonialsConfig | null;
}

const CDN = "https://cdn.getmerlin.in/cms";

/** "gpt-4o-mini" -> "Gpt 4o Mini": the label plan features use for `{model}`. */
function modelLabel(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const ACTIVE_TAB =
  "data-[state=active]:text-white dark:data-[state=active]:text-black";

export const AGENT_LANDING_CONFIG: AgentLandingConfig = {
  // No `logos` block since 1.17.0: 1.13.0 turned the third-party logo wall
  // off (Ray, 2026-09-09: "everything served from another company cdn
  // tells you is placeholder") and 1.17.0 made logos.tsx the landing
  // page's "Trusted by" row, drawing base's network sites; the section
  // has no copy of its own to hold here.
  social: {
    badge: `${PLATFORM_NAME} Chrome Extension`,
    heading: "Stay social, not drained",
    blurb: `With ${PLATFORM_NAME}'s Chrome Extension, be digitally present effortlessly. Engage, reach out and express better with the world.`,
    cta: {
      label: "Start creating for free!",
      href: "https://chromewebstore.google.com/detail/merlin-1-click-access-to/camppjleccjaphfdbohjdohecfnoikec",
      external: true,
    },
    cards: [
      {
        title: "Write mails effortlessly",
        text: "Compose mails with AI and generate replies in the context of the previous mail.",
        image: { src: `${CDN}/gmail_ecea349519.webp`, alt: "Write mails effortlessly" },
      },
      {
        title: "Draft posts and replies on social media",
        text: "Generate with prompts and save them for repeated use. Engagement on top.",
        image: { src: `${CDN}/social_media_a521fbf4cc.webp`, alt: "Draft posts and replies on social media" },
      },
      {
        title: "Create content from videos",
        text: "Blogs, X posts, articles - you name it, from any YouTube video.",
        image: { src: `${CDN}/content_from_vid_336ec65ad8.webp`, alt: "Create content from videos" },
      },
      {
        title: "Get the perfect poster image",
        text: "Generate images with 20+ image models and aspect ratios for web and social media.",
        image: { src: `${CDN}/image_gen_21ee18a2ef.webp`, alt: "Get the perfect poster image" },
      },
    ],
  },

  features: {
    heading: "All that... and more",
    blurb: `Here's everything ${PLATFORM_NAME} has to offer. P.S. This list grows on every week!`,
    items: [
      { name: "Brand voice content with custom knowledge bases", image: `${CDN}/brand_voice_hover_image_1_9441c286c4.webp` },
      { name: "Working app snippets, web code and components", image: `${CDN}/code_snippets_ad5dd9c340.png` },
      { name: "Flowcharts, mindmaps and 20+ infographic types", image: `${CDN}/diagrams_405f737d5d.webp` },
      { name: "Generate images with Flux 1.1 Pro", image: `${CDN}/Generate_AI_images_and_art_Bonkers_8edfa01b5b.webp` },
      { name: "Convert YouTube videos into posts and blogs", image: `${CDN}/Youtube_Summariser_2161a48f6d.webp` },
      { name: "Posts and comments on X and LinkedIn", image: `${CDN}/Twitter_commenter_9b7d00b268.webp` },
      { name: "Solve STEM problems and puzzles with OpenAI o1", image: `${CDN}/o1_1_f3cabdfcec.webp` },
      { name: "AI tools for academic, marketing and tech research", image: `${CDN}/Chat_with_20_top_AI_models_GPT_4_Claude_3_etc_3b2e6b7e57.webp` },
      { name: "One-click blog summaries", image: `${CDN}/Blog_Summariser_91f8e612ef.webp` },
      { name: "Summarize and transcribe YouTube videos", image: `${CDN}/Youtube_Transcription_tool_3d92b8ee68.webp` },
    ],
  },

  workflow: {
    heading: "Your workflow, our magic",
    blurb: `Whether you're a student, marketer, tech pro or even a founder, ${PLATFORM_NAME} can make your life much easier at work.`,
    cta: { label: `See how ${PLATFORM_NAME} fits your workflow`, href: "/chat" },
    hoverHint: `Hover to see how ${PLATFORM_NAME} solves this`,
    personas: [
      {
        id: "students",
        title: "Students",
        icon: GraduationCap,
        color: "bg-blue-700",
        query: "How do I nail my research assignments, ace my exams and learn effectively?",
        solutions: [
          `Summarize long lecture documents and videos into powerful learning aids with ${PLATFORM_NAME} Extension`,
          `Create course bots for homework help and research with perfect citations using ${PLATFORM_NAME} Projects`,
          `Use ${PLATFORM_NAME} Tools for AI detection and humanising your submissions`,
        ],
      },
      {
        id: "marketers",
        title: "Marketers and creators",
        icon: Megaphone,
        color: "bg-indigo-700",
        query: "How do I generate creative, SEO-friendly collateral suited to my brand voice over-and-over, effortlessly?",
        solutions: [
          `Use ${PLATFORM_NAME} Projects to create knowledge bases that can be used for brand voice and content generation`,
          "Repurpose any kind of content on the web into SEO-friendly blogs, articles and copywriting",
          `Write contextualised cold outreach mails and messages on X, LinkedIn and Gmail using ${PLATFORM_NAME} Extension`,
        ],
      },
      {
        id: "entrepreneurs",
        title: "Entrepreneurs",
        icon: Briefcase,
        color: "bg-violet-700",
        query: "How do I brainstorm ideas effectively, communicate like a boss and 10x my productivity at work?",
        solutions: [
          "Maintain your flow state on the web by avoiding switching tabs for AI",
          `Use ${PLATFORM_NAME} Crafts to create mindmaps, graphs and 20+ diagrams to brainstorm like a pro`,
          `Get on top of communication and outreach woes with ${PLATFORM_NAME} on Gmail, X and LinkedIn`,
        ],
      },
      {
        id: "developers",
        title: "Developers",
        icon: Code,
        color: "bg-purple-700",
        query: "How do I iterate on code effectively, debug with context and save time on creating boilerplate code components?",
        solutions: [
          `Use ${PLATFORM_NAME} Projects to add your codebase documentation to ${PLATFORM_NAME}'s knowledge`,
          `Use ${PLATFORM_NAME} Crafts to create web components, write and debug code with just a prompt`,
          `Select anything on the web and summon ${PLATFORM_NAME} for added context on-the-fly`,
        ],
      },
      {
        id: "consultants",
        title: "Consultants and PMs",
        icon: ClipboardList,
        color: "bg-fuchsia-700",
        query: "How do I research in real-time, organise my research and visualise it effectively for presentations?",
        solutions: [
          "Use Live Search in tandem with websites and document sources to write precise, up-to-date reports",
          `Create ${PLATFORM_NAME} Projects with your research resources and chat with it for quick retrieval of information`,
          `Visualise with 20+ diagram types with just a prompt using ${PLATFORM_NAME} Crafts`,
        ],
      },
      {
        id: "analysts",
        title: "Analysts",
        icon: ChartLine,
        color: "bg-blue-900",
        query: "How do I write accurate queries faster, analyse data without having to build dashboards and present my insights better?",
        solutions: [
          `Use ${PLATFORM_NAME} Extension on Google Sheets or your DB client to write queries on-the-fly`,
          `Upload XLS/CSV files into ${PLATFORM_NAME} and ask for quick insights from the data`,
          `Use data as context and visualise with 20+ diagram types using ${PLATFORM_NAME} Crafts`,
        ],
      },
    ],
  },

  pricing: {
    defaultCategory: "rokct",
    categoryLabels: { rokct: "ROKCT/ERP" },
    categoryStyles: {
      rokct: `text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 hover:border-indigo-500 hover:text-indigo-500 data-[state=active]:bg-indigo-600 data-[state=active]:border-indigo-600 dark:data-[state=active]:bg-indigo-400 dark:data-[state=active]:border-indigo-400 ${ACTIVE_TAB}`,
      telephony: `text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800 hover:border-blue-500 hover:text-blue-500 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 dark:data-[state=active]:bg-blue-400 dark:data-[state=active]:border-blue-400 ${ACTIVE_TAB}`,
      hosting: `text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800 hover:border-orange-500 hover:text-orange-500 data-[state=active]:bg-orange-600 data-[state=active]:border-orange-600 dark:data-[state=active]:bg-orange-400 dark:data-[state=active]:border-orange-400 ${ACTIVE_TAB}`,
      lending: `text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 hover:border-emerald-500 hover:text-emerald-500 data-[state=active]:bg-emerald-600 data-[state=active]:border-emerald-600 dark:data-[state=active]:bg-emerald-400 dark:data-[state=active]:border-emerald-400 ${ACTIVE_TAB}`,
      paas: `text-teal-600 border-teal-200 dark:text-teal-400 dark:border-teal-800 hover:border-teal-500 hover:text-teal-500 data-[state=active]:bg-teal-600 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-teal-400 dark:data-[state=active]:border-teal-400 ${ACTIVE_TAB}`,
    },
    defaultCategoryStyle:
      "text-slate-600 border-slate-200 hover:border-slate-500 hover:text-slate-500 data-[state=active]:bg-slate-600 data-[state=active]:text-white dark:text-slate-400 dark:border-slate-800",
    hiddenCategories: ["lms", "hosting", "paas", "telephony"],
    hideFreePlansIn: ["rokct"],
    featureTokens: { model: modelLabel(AI_MODELS.PAID.id) },
    localize: () =>
      import("@/lib/actions/getPricingMetadata").then((m) =>
        m.getPricingMetadata(),
      ),
    labels: {
      joinFree: "Join for Free",
      daysFree: (days) => `${days} Days Free`,
      select: (plan) => `Select ${plan}`,
      annualBilling: "Annual Billing",
      save: (amount) => `Save ${amount}/yr!`,
      seats: "Seats",
      billedAs: (usd) => `Billed as $${usd} USD`,
      approx: "Approx.",
      global: "Global",
    },
    ready: {
      heading: "Ready to get started?",
      blurb: `Join the other 59,239+ clients who work faster with ${PLATFORM_NAME}.`,
      cta: "Start Free Trial",
    },
  },

  compare: {
    heading: "Most valuable AI subscription ever",
    blurb: "Untrap yourself from thousands of tools with overlapping features.",
    tabs: { platform: "AI", others: "Others" },
    platform: {
      icon: { src: `${CDN}/Group_2_b0e06c28f9.svg`, alt: `${PLATFORM_NAME} icon` },
      price: "$19",
      period: ["per month", "billed annually"],
      // 1.19.0: the plans are the `pricing` section this block renders in
      // (copied-pricing.tsx's meta.nav id, the header's `anchors` entry),
      // not a /pricing route - no host or SDK installs one.
      ctas: [
        { label: "Buy now", href: "#pricing" },
        { label: "Explore plans", href: "#pricing" },
      ],
      listHeading: "One purchase is all it takes.",
      benefits: [
        "All data in one place",
        "24x7 support at your service",
        "Great value for money",
      ],
    },
    others: [
      {
        name: "Other",
        avatar: { src: `${CDN}/Avatar_2_eee035b8d3.png`, alt: "icon" },
        price: "$130",
        period: ["per month", "for multiple tools"],
        listHeading: "Purchased individually",
        items: [
          { label: "Claude AI", price: "$30/m", icon: { src: `${CDN}/claude_7fd6ca1b3a.svg`, alt: "Claude AI" } },
          { label: "OpenAI", price: "$20/m" },
          { label: "Gemini Advanced", price: "$20/m", icon: { src: `${CDN}/gemini_860192f244.svg`, alt: "Gemini Advanced" } },
          { label: "Mistral AI", price: "$20/m", icon: { src: `${CDN}/mistral_997ea81364.svg`, alt: "Mistral AI" } },
          { label: "Open source model hosting", price: "$40/m", icon: { src: `${CDN}/meta_0e8914c0f0.svg`, alt: "Open source model hosting" } },
        ],
      },
      {
        name: "Other Pro",
        avatar: { src: `${CDN}/Avatar_4_36664caa88.svg`, alt: "icon" },
        price: "$200",
        period: ["per month", "for enterprise tools"],
        listHeading: "Purchased individually",
        items: [
          { label: "Enterprise AI", price: "$100/m" },
          { label: "Team Seats", price: "$100/m" },
        ],
      },
    ],
  },

  faq: {
    heading: "Want to know more?",
    blurb: "Here’s a list of FAQs to help you get started!",
    items: [
      {
        question: `What is ${PLATFORM_NAME} AI?`,
        answer: `${PLATFORM_NAME} is an AI Chrome Extension and web app that works as your AI-powered assistant, saving you time and money. It provides top AI models such as ChatGPT, GPT 4 , Claude, Deepseek V3, Opus, Llama, Mistral etc. to generate AI responses on Google Search, summaries for YouTube videos, blogs, documents (PDF or PPT), social media posts and replies to comments on LinkedIn, Twitter and Gmail. ${PLATFORM_NAME} also translates into more than twenty-five languages.`,
      },
      {
        question: `How does ${PLATFORM_NAME} AI Chrome Extension work?`,
        answer: `Once installed as a Chrome Extension on the browser, you can open ${PLATFORM_NAME} AI Chatbot on any website using the shortcut: Ctrl/⌘+M. On specific websites such as Twitter (now X), LinkedIn, YouTube and Gmail, you would find ${PLATFORM_NAME} buttons for easy access.`,
      },
      {
        question: `What is the difference between ${PLATFORM_NAME} Teams and ${PLATFORM_NAME} Pro plans?`,
        answer: `On ${PLATFORM_NAME} Teams, you can buy a plan for your team of 5 or above and pay per team member. This means teams can save costs by distributing costs across users. Whereas ${PLATFORM_NAME} Pro plans are ideal for individual users who prefer unlimited queries and don’t want to be limited in their daily use.`,
      },
      {
        question: `Is ${PLATFORM_NAME} AI free to use?`,
        answer: `Yes, ${PLATFORM_NAME} AI is FREE and safe to use. All free users get 102 free queries credited to their account everyday. These queries can be used by the user to run multiple AI models such as GPT 3.5, GPT 4, Claude , Opus, Mistral, Gemini etc. ${PLATFORM_NAME} consume 30 queries when user ask ${PLATFORM_NAME} anything using GPT 4, Gemini 1.5, Mistral large model whereas GPT 3.5, Gemini, Claude 3 Haiku etc. model consume only 1 query.`,
      },
      {
        question: "Do I need ChatGPT or Claude or Gemini or Llama account?",
        answer: `No, you will not need separate accounts to use top AI models such as ChatGPT or Claude or Mistral or Llama. You can create a free account at get${PLATFORM_NAME}.in and get access to all top models through a single account.`,
      },
      {
        question: `Which search engine is supported by ${PLATFORM_NAME}?`,
        answer: `${PLATFORM_NAME} currently supports Google, Baidu, Bing, DuckDuckGo, Yahoo, and Yandex.`,
      },
      {
        question: `How do I install ${PLATFORM_NAME} in my browser?`,
        answer: `To install ${PLATFORM_NAME} on your browser, you will need to follow these steps: 1. In your browser open the browser's app store or Google Chrome store 2. Search for the ${PLATFORM_NAME} extension in the chrome store 3. Click on the 'Add to Browser' or 'Install' button to begin the installation process. 4. Once the installation is complete, you will be redirected to our onboarding page 5. That’s it! viola! You are done :) . Please pin the extension for easy access.`,
      },
      {
        question: `What counts as a query in ${PLATFORM_NAME} search?`,
        answer: `When you ask ${PLATFORM_NAME} anything and click enter that's called one query. If you are on the search engine like Google, ${PLATFORM_NAME} gives response automatically and that does not count as a query, ${PLATFORM_NAME} provides FREE searches on Google.`,
      },
      {
        question: "How do I keep a track of my free queries?",
        answer: `When you open ${PLATFORM_NAME} using Ctrl/⌘+M, you will see your count of queries on the top left corner.`,
      },
      {
        question: `Why ${PLATFORM_NAME} is not opening after installation?`,
        answer: `Refresh only the tabs that were already open before installing ${PLATFORM_NAME}. But for the new tabs that you open here after installing of ${PLATFORM_NAME} there no need to refresh. But as a good practice please do refresh if ${PLATFORM_NAME} doesn't come up or certain things are amiss!`,
      },
    ],
  },

  testimonials: {
    items: [
      {
        title: "The Swiss Army Knife for research and writing",
        text: `${PLATFORM_NAME} is a welcome addition to anyone looking to simplify their research and writing process. I found the tool to be very user-friendly, fast, and reliable.`,
        author: "PetePlus",
        role: "AppSumo user",
        avatar: `${CDN}/Avatar_9274fb1b87.svg`,
      },
      {
        title: "Highly recommended for educators, marketers, and small businesses",
        text: "This tool is there for you whenever and wherever you need it. Inside Gmail? Yep. Inside YouTube? Yep. It even timestamps the video summaries. On websites? Yep.",
        author: "Paige Battcher",
        role: `${PLATFORM_NAME} Pro user`,
        avatar: `${CDN}/Avatar_1_6e26bd801c.svg`,
      },
      {
        title: "5 STAR Product.",
        text: `The team is VERY responsive. Any new ideas or bugs get talked about. They want to make ${PLATFORM_NAME} genuinely really good. You can just tell by how engaged they are, and how they make changes based on feedback.`,
        author: "gkc",
        role: "AppSumo user",
        avatar: `${CDN}/Avatar_2_aa8dbc93fb.svg`,
      },
      {
        title: "There when and where you need it.",
        text: "This tool is there for you whenever and wherever you need it. Inside Gmail? Yep. Inside YouTube? Yep. It even timestamps the video summaries. On websites? Yep.",
        author: "Nathalia Do Nascimento Silva",
        role: "AppSumo user",
        avatar: `${CDN}/Avatar_4_36664caa88.svg`,
      },
      {
        title: "An indispensable part of my academic toolkit.",
        text: `As a student, ${PLATFORM_NAME} AI has been invaluable for my academic work. The tool's automatic summarization and advanced text analysis features have significantly boosted my productivity and understanding.`,
        author: "Preston Bailey",
        role: "Extension user",
        avatar: `${CDN}/Avatar_3_7588002be1.svg`,
      },
      {
        title: "Amazing support.",
        text: `The reason for gaining trust in ${PLATFORM_NAME} lies in their communication approach. They are more honest in their communication than expected, and while they can't accommodate everything, they provide satisfaction with quick responses to users' demands. I give it 10/10!!`,
        author: "107541488344860181963",
        role: "AppSumo user",
        avatar: `${CDN}/Avatar_5_d4cf2b13d4.svg`,
      },
      {
        title: "Get straight A+s in uni.",
        text: `My Lil brother had an assignment for UNI, to use an AI to summarize a doc and display the key points using charts, Powerbi, etc.. Everyone used ChatGPT, Gemini, nothing fancy. Lil bro used ${PLATFORM_NAME} per my advise. He got an A+ and doesn't need to attend the finals from this project. I guess the professor thought he's an AI genius. Thanks ${PLATFORM_NAME} 😂🦾`,
        author: "Omar Alsharif",
        role: "Extension user",
        avatar: `${CDN}/Avatar_7_e4d61dcb33.png`,
      },
      {
        title: "Eliminates the frustration of switching between apps.",
        text: `${PLATFORM_NAME}'s user-friendly interface makes research effortless. By centralizing all my sources, it eliminates the frustration of switching between apps and losing track of valuable information.`,
        author: "Ralphiesworld000",
        role: "Apple App user",
        avatar: `${CDN}/Avatar_6_a69724eeab.svg`,
      },
      {
        title: "Keyboard friendliness.",
        text: `One of the best looking apps I've seen so far in the AI space. Integrates directly with my browser at the top toolbar. The coolest part is the Cmd + M keyboard friendliness. I've spoken to the developers and can assure that ${PLATFORM_NAME} will only get better with time.`,
        author: "Scorphx",
        role: "Extension user",
        avatar: `${CDN}/Avatar_7_430a7c6f7b.svg`,
      },
    ],
  },
};
