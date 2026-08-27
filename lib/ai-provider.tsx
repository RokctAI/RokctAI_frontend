/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import { LanguageModel } from "ai";
import React, { createContext, useContext, useEffect, useState } from "react";

import { geminiFlashModel, geminiProPaidModel } from "@/ai";
import { getCurrentSession } from "@/app/(auth)/actions";
import { Session } from "@/app/(auth)/auth";

interface AiProviderContextType {
  availableModels: Record<string, LanguageModel>;
}

const AiProviderContext = createContext<AiProviderContextType | undefined>(
  undefined,
);

export const AiProvider = ({ children }: { children: React.ReactNode }) => {
  const [availableModels, setAvailableModels] = useState<
    Record<string, LanguageModel>
  >({});

  useEffect(() => {
    const fetchModels = async () => {
      const session: Session | null = await getCurrentSession();
      const allowedModels = session?.user?.allowed_models || [];

      const models: Record<string, LanguageModel> = {};
      if (allowedModels.includes("Gemini Pro")) {
        models["gemini-pro"] = geminiProPaidModel;
      }
      if (allowedModels.includes("Gemini Flash")) {
        models["gemini-flash"] = geminiFlashModel;
      }
      setAvailableModels(models);
    };

    fetchModels();
  }, []);

  return (
    <AiProviderContext.Provider value={{ availableModels }}>
      {children}
    </AiProviderContext.Provider>
  );
};

export const useAi = () => {
  const context = useContext(AiProviderContext);
  if (!context) {
    throw new Error("useAi must be used within an AiProvider");
  }
  return context;
};
