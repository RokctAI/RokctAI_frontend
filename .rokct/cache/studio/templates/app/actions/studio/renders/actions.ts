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


"use server";

import { RenderService } from "@/app/services/all/studio/renders";

import type { DeliverableOptions } from "./types";

export async function renderPreview(candidate: string, construction = false) {
  return RenderService.preview(candidate, construction);
}

export async function renderDeliverable(candidate: string, options: DeliverableOptions = {}) {
  return RenderService.deliverable(candidate, options);
}

export async function renderPages(candidates: string[], format?: string) {
  return RenderService.pages(candidates, format);
}

export async function brandbook(designSystem: string, logoFileUrl?: string) {
  return RenderService.brandbook(designSystem, logoFileUrl);
}
