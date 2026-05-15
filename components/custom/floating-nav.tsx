"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "hero", label: "Hero" },
  { id: "features", label: "Features" },
  { id: "ai-models", label: "AI Models" },
  { id: "pricing", label: "Pricing" },
];

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
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
    <div className="fixed left-6 lg:left-12 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-2.5">
      {SECTIONS.map((section, i) => {
        const isActive = activeSection === section.id;

        // Calculate curve shift for the wheel effect
        const mid = (SECTIONS.length - 1) / 2;
        const dist = Math.abs(i - mid);
        const shift = 20 - (dist * dist * 4); // Adjusted for fewer items

        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center"
            aria-label={`Scroll to ${section.label}`}
          >
            <motion.div
              animate={{
                width: isActive ? 40 : 20,
                opacity: isActive ? 1 : 0.3,
                marginLeft: `${Math.max(0, shift)}px`,
              }}
              className="h-[2px] bg-white transition-all duration-300 rounded-full"
            />
            <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {section.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
