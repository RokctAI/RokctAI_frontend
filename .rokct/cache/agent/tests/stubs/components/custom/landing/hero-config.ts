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
// Test stand-in for base_sdk's components/custom/landing/hero-config.ts
// (1.23.0): the badge shape and the three default badges rokct.ai's hero
// draws from it, as agent-hero-copy.ts lays its one change over them.

export interface HeroBadge {
  id: string;
  href: string;
  eyebrow: string;
  label: string;
  icon?: { src: string; alt: string } | "app-store" | "chrome";
}

export const HERO_CONFIG: { badges: HeroBadge[] } = {
  badges: [
    { id: "chrome", href: "https://chromewebstore.google.com/", eyebrow: "Available in the", label: "Chrome Web Store", icon: "chrome" },
    { id: "google-play", href: "#", eyebrow: "GET IT ON", label: "Google Play" },
    { id: "app-store", href: "#", eyebrow: "Download on the", label: "App Store", icon: "app-store" },
  ],
};
