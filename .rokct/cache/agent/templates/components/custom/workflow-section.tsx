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

"use client";

// The landing page's persona cards ("your workflow"). Copy and personas:
// AGENT_LANDING_CONFIG.workflow.

import React from "react";
import Link from "next/link";
import { ChevronRight, Pointer } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AGENT_LANDING_CONFIG } from "@/components/custom/landing/agent-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function WorkflowSection({ id }: { id?: string }) {
  const config = AGENT_LANDING_CONFIG.workflow;
  if (!config) return null;

  return (
    <section
      id={id}
      className="container flex w-full flex-col gap-12 py-16 mx-auto bg-background"
    >
      <div className="flex w-full max-w-7xl flex-col gap-12 mx-auto">
        <div className="flex flex-col gap-9 px-4 xl:px-0">
          <div className="flex flex-col gap-4">
            <h2 className="text-foreground font-serif text-center text-3xl font-medium tracking-normal md:text-5xl">
              {config.heading}
            </h2>
            <p className="font-sans text-center text-lg font-medium text-muted-foreground">
              {config.blurb}
            </p>
          </div>
          <div className="mx-auto">
            <Link
              href={config.cta.href}
              target={config.cta.external ? "_blank" : undefined}
              rel={config.cta.external ? "noopener noreferrer" : undefined}
              className="flex w-max items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground shadow hover:bg-primary/90 group transition-all"
            >
              {config.cta.label}
              <ChevronRight className="ml-2 size-5" />
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <Carousel
            opts={{ align: "start", loop: false, dragFree: true }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4 !-ml-0">
              {config.personas.map((persona) => {
                const Icon = persona.icon;
                return (
                  <CarouselItem
                    key={persona.id}
                    className="min-w-0 shrink-0 grow-0 basis-full flex justify-center p-0 md:basis-1/2 lg:basis-[28%] pl-4"
                  >
                    <div className="group rounded-xl border bg-card text-card-foreground relative h-[441px] w-full max-w-[335px] overflow-hidden transition-all duration-300 ease-in-out shadow hover:shadow-lg">
                      <div className="space-y-1.5 p-6 absolute top-0 z-[1] flex w-full flex-row items-center gap-2 bg-card transition-all duration-500 ease-in-out">
                        <div
                          className={`${persona.color} flex items-center justify-center rounded-full p-2 transition-transform duration-300 ease-in-out`}
                        >
                          <Icon className="size-5 text-white" aria-hidden="true" />
                        </div>
                        <h4 className="text-foreground font-sans !mt-0 text-base font-medium">
                          {persona.title}
                        </h4>
                      </div>

                      <div className="p-6 z-0 flex h-full flex-col justify-between pt-[84px] transition-all duration-500 ease-in-out translate-y-0 opacity-100 group-hover:-translate-y-4 group-hover:opacity-0">
                        <p className="text-foreground font-serif font-light text-2xl leading-[38px] line-clamp-4">
                          {persona.query}
                        </p>
                        <div className="items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground flex gap-2 w-max">
                          <Pointer className="size-3" aria-hidden="true" />
                          <p className="text-foreground font-sans font-light text-xs">
                            {config.hoverHint}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 absolute inset-x-0 top-full flex h-full flex-col px-6 pt-[84px] text-lg leading-[28px] transition-all duration-500 ease-in-out translate-y-0 opacity-0 group-hover:-translate-y-full group-hover:opacity-100 bg-card overflow-y-auto">
                        <ul className="text-foreground font-serif text-base font-light leading-6 flex flex-col gap-6 list-disc pl-4">
                          {persona.solutions.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the
 * page order and its floating-nav entry.
 */
export const meta: PageSectionMeta = {
  order: 50,
  nav: [{ id: "workflow", label: "Workflow" }],
};

export default WorkflowSection;
