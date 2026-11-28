import assert from "node:assert/strict";
import { test } from "node:test";
import { indexNowKey, llmsTxt } from "../templates/app/lib/ai-discovery.ts";

test("IndexNow key is stable, 32 hex, per host", () => {
  const k = indexNowKey("Sticks-Web.vercel.app");
  assert.match(k, /^[0-9a-f]{32}$/);
  assert.equal(k, indexNowKey("sticks-web.vercel.app"));
  assert.notEqual(k, indexNowKey("polaris-web-nu.vercel.app"));
});

test("llms.txt has name, summary and links", () => {
  const t = llmsTxt({ title: "Sticks", description: "AI employees.", tagline: "Asks first." }, "https://x.example/");
  assert.ok(t.startsWith("# Sticks\n\n> AI employees.\n\nAsks first.\n"));
  assert.ok(t.includes("- [Home](https://x.example/): Sticks"));
  assert.ok(t.includes("(https://x.example/sitemap.xml)"));
  assert.ok(!llmsTxt({ title: "A", description: "B", tagline: "" }, undefined).includes("## Links"));
});
