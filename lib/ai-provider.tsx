"use client";

import { LanguageModel } from "ai";
import React, { createContext, useContext, useEffect, useState } from "react";

import {
  geminiFlashModel,
  geminiProPaidModel,
} from "@/ai";
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
