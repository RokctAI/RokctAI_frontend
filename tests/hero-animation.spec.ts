/*
 * Copyright (c) 2026 RokctAI
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
