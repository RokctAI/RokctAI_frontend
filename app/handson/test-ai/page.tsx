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

import { useState } from "react";
import { AiTextHelper } from "@/components/handson/ai/AiTextHelper";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import t from "@/app/lib/i18n";

export default function AiTestPage() {
  const [text, setText] = useState("");

  const handleAiAccept = (newText: string) => {
    setText(newText);
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✨ {t("app.test_ai.title")}
          </CardTitle>
          <CardDescription>{t("app.test_ai.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="bio">{t("app.test_ai.label_text")}</Label>
              <AiTextHelper text={text} onAccept={handleAiAccept} />
            </div>
            <Textarea
              id="bio"
              placeholder={t("app.test_ai.ph_text")}
              className="min-h-[200px] resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {t("app.test_ai.char_count", { count: text.length })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-muted rounded-lg text-sm">
        <h4 className="font-semibold mb-2">{t("app.test_ai.verify_title")}</h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>{t("app.test_ai.verify_step_1")}</li>
          <li>{t("app.test_ai.verify_step_2")}</li>
          <li>
            <strong>{t("app.test_ai.verify_step_3")}</strong>
          </li>
          <li>{t("app.test_ai.verify_step_4")}</li>
          <li>{t("app.test_ai.verify_step_5")}</li>
        </ul>
      </div>
    </div>
  );
}
