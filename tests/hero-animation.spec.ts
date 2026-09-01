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

import { test, expect } from "@playwright/test";

test("Hero animation displays TaskStack component", async ({ page }) => {
  await page.goto("/");

  // Wait for the task conversation to appear. This might take some time due to the animation.
  // The task conversation is the 3rd one, and each has timeouts.
  // We will wait for the text of the first task to be visible.
  const taskText = page.getByText("Finalize Q3 marketing report");

  // Wait for a maximum of 30 seconds for the element to be visible.
  await expect(taskText).toBeVisible({ timeout: 30000 });

  // Also check if the container for the TaskStack component is present.
  const taskStackContainer = page.locator(".w-full.pl-10");
  await expect(taskStackContainer).toBeVisible({ timeout: 30000 });
});
