"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "hero", label: "Hero" },
  { id: "extension", label: "Chrome Extension" },
  { id: "chat", label: "Merlin Chat" },
  { id: "projects", label: "Projects" },
  { id: "crafts", label: "Crafts" },
  { id: "research", label: "Research Machine" },
  { id: "social", label: "Social Media" },
  { id: "features", label: "Features" },
  { id: "security", label: "Data Security" },
  { id: "devices", label: "Devices" },
  { id: "workflow", label: "Workflow" },
  { id: "ai-models", label: "AI Models" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
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
      {SECTIONS.map((section, i) => {
        const isActive = activeSection === section.id;

        const activeIndex = SECTIONS.findIndex(s => s.id === activeSection);
        const distFromActive = Math.abs(i - activeIndex);

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center py-0.5 px-2"
            aria-label={`Scroll to ${section.label}`}
          >
            <motion.div
              animate={{
                width: isActive ? 32 : (distFromActive === 1 ? 16 : 8),
                opacity: isActive ? 1 : (distFromActive <= 2 ? 0.4 : 0.2),
              }}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-zinc-900 dark:bg-white"
                  : "bg-zinc-400 dark:bg-zinc-600"
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
