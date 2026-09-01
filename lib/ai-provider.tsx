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
