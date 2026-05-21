// Centralized configuration registry for platform and Mega Menu features.
// Driving visibility (active), names, hrefs, and badges (label) dynamically via numeric IDs
// so that changing a name does not leave old lingering terms in code IDs.

export interface FeatureLink {
  name: string;
  href: string;
  active: boolean;
  label?: "new" | "soon" | "none";
}

export const PLATFORM_FEATURES: Record<number, FeatureLink> = {
  // Left Column Platforms
  1: { name: "Browser Extension", href: "https://chromewebstore.google.com/", active: true, label: "none" },
  2: { name: "Web App", href: "/dashboard", active: true, label: "none" },
  3: { name: "Mobile Apps", href: "#", active: true, label: "none" },

  // AI Chat
  4: { name: "Chat with ROKCT", href: "/chat", active: true, label: "none" },

  // Productivity Column
  5: { name: "AI-first ERP", href: "#", active: true, label: "soon" },
  6: { name: "TenderAssist", href: "#", active: true, label: "none" },
  7: { name: "Telephony", href: "#", active: true, label: "none" },

  // Tools Column
  8: { name: "FraudDetector", href: "#", active: true, label: "none" },
  9: { name: "LoanMan", href: "#", active: true, label: "none" },
  10: { name: "Tenders", href: "#", active: true, label: "none" },
  11: { name: "Funding", href: "#", active: true, label: "none" },

  // Summary Column
  12: { name: "YouTube Summarizer", href: "#", active: true, label: "none" },
  13: { name: "Article Summarizer", href: "#", active: true, label: "none" },

  // Top-Level Nav Links
  14: { name: "Pricing", href: "#pricing", active: true, label: "none" },
  15: { name: "Affiliate", href: "/affiliate", active: true, label: "none" },
  16: { name: "Teams", href: "/teams", active: true, label: "none" },
  17: { name: "Chat with ROKCT", href: "/chat", active: true, label: "none" },
};

// Legacy boolean exports for backward compatibility if imported elsewhere
export const SHOW_EXTENSION = PLATFORM_FEATURES[1]?.active ?? true;
export const SHOW_WEB_APP = PLATFORM_FEATURES[2]?.active ?? true;
export const SHOW_MOBILE_APPS = PLATFORM_FEATURES[3]?.active ?? true;
