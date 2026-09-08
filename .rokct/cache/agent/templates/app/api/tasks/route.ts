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

import { NextResponse } from "next/server";
import { createAiTask } from "@/app/actions/ai/create";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, priority, end_date, project, modelId } = body;

    console.log("Creating AI Task:", { name, project, modelId });

    const result = await createAiTask({
      name,
      priority,
      end_date,
      project,
      modelId,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Task Created",
        data: result.message,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 },
    );
  }
}
