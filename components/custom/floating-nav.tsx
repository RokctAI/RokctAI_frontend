"use client";

import { PLATFORM_NAME } from "@/app/config/platform";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "hero", label: "Hero" },
  { id: "extension", label: "Chrome Extension" },
  { id: "chat", label: `${PLATFORM_NAME} Chat` },
  { id: "projects", label: "Projects" },
  { id: "crafts", label: "Crafts" },
  { id: "research", label: "Research Machine" },
  { id: "social", label: "Social Media" },
  { id: "features", label: "Features" },
  { id: "security", label: "Data Security" },
  { id: "devices", label: "Devices" },
  { id: "workflow", label: "Workflow" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
  { id: "testimonials", label: "Testimonials" },
  { id: "footer", label: "Footer" },
];

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -20% 0px",
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-1.5 items-start">
      {SECTIONS.map((section) => {
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center py-1.5 px-2"
            aria-label={`Scroll to ${section.label}`}
          >
            <motion.div
              animate={{
                width: isActive ? 32 : 16,
              }}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-zinc-900 dark:bg-white opacity-100"
                  : "bg-zinc-400 dark:bg-zinc-500 opacity-50 group-hover:opacity-100 group-hover:w-[24px]"
              }`}
            />

            {/* Label Tooltip */}
            <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
