import { test, expect } from '@playwright/test';

test('Hero animation displays TaskStack component', async ({ page }) => {
  await page.goto('/');

  // Wait for the task conversation to appear. This might take some time due to the animation.
  // The task conversation is the 3rd one, and each has timeouts.
  // We will wait for the text of the first task to be visible.
  const taskText = page.getByText('Finalize Q3 marketing report');

  // Wait for a maximum of 30 seconds for the element to be visible.
  await expect(taskText).toBeVisible({ timeout: 30000 });

  // Also check if the container for the TaskStack component is present.
  const taskStackContainer = page.locator('.w-full.pl-10');
  await expect(taskStackContainer).toBeVisible({ timeout: 30000 });
});
