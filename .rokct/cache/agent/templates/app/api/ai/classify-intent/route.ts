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

import { NextRequest, NextResponse } from "next/server";
import { intentClassifierService } from "@/app/services/server/intent-classifier";

export async function POST(request: NextRequest) {
  try {
    const { text, context } = await request.json();

    if (!text) {
      return NextResponse.json({ status: "error", message: "Text is required" }, { status: 400 });
    }

    const result = await intentClassifierService.classify(
      text, 
      context?.entity
    );

    return NextResponse.json({
      status: "success",
      ...result
    });
  } catch (error: any) {
    console.error("Intent Classification Error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
