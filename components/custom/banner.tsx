"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AI_MODELS } from "@/ai/models";

export function Banner() {
  return (
    <div className="bg-gray-900 text-white text-center py-2">
      <div className="container mx-auto">
        <p className="font-semibold">
          <span className="bg-wealth-green-500 text-white text-xs font-bold rounded-full px-2 py-1 mr-2">
            NEW
          </span>
          {AI_MODELS.PAID.label} is now available!
          <a href="#" className="ml-2 underline">
            Try it now
          </a>
        </p>
      </div>
    </div>
  );
}
