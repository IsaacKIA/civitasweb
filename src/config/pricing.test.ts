import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PRICE_LIST,
  PRICE_VERSION_LINE,
  PRICE_TOKEN_MAP,
  formatPrice,
  formatFromPrice,
} from "./pricing.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function getAllSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === "dist" ||
      entry.name === ".git" ||
      entry.name === "Assets" ||
      entry.name === "public" ||
      entry.name === "package-lock.json"
    ) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllSourceFiles(fullPath));
    } else if (/\.(html|js|ts|tsx|jsx|json|css)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe("PRICE_LIST single source of truth", () => {
  test("has expected version, date, nextReview and currency", () => {
    assert.equal(PRICE_LIST.version, "1.2");
    assert.equal(PRICE_LIST.date, "2026-11-07");
    assert.equal(PRICE_LIST.nextReview, "2027-03-01");
    assert.equal(PRICE_LIST.currency, "GH₵");
    assert.equal(
      PRICE_VERSION_LINE,
      "Price list version 1.2, November 2026. Next review: March 2027."
    );
  });

  test("formats GH₵ currency with thousands separators", () => {
    assert.equal(formatPrice(290), "GH₵290");
    assert.equal(formatPrice(1200), "GH₵1,200");
    assert.equal(formatFromPrice(400, "per month"), "From GH₵400 per month");
  });

  test("fails if any hard-coded GH₵ or GH&#8373; amount appears outside src/config/pricing.ts", () => {
    const files = getAllSourceFiles(repoRoot);
    const allowedFiles = new Set([
      path.resolve(repoRoot, "src/config/pricing.ts"),
      path.resolve(repoRoot, "src/config/pricing.test.ts"),
      path.resolve(repoRoot, "src/lib/quote.test.ts"),
    ]);

    // Matches GH₵ followed by digits (e.g. GH₵290, GH₵ 350, GH&#8373; 180, GH&#8373;&nbsp;350)
    const hardcodedAmountRegex =
      /(?:GH₵|GH&#8373;|GH&\#x20B5;)\s*(?:&nbsp;)?\s*\d+/gi;

    const violations: string[] = [];

    for (const file of files) {
      if (allowedFiles.has(path.resolve(file))) continue;
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (hardcodedAmountRegex.test(line)) {
          const rel = path.relative(repoRoot, file);
          violations.push(`${rel}:${idx + 1}: ${line.trim()}`);
        }
        hardcodedAmountRegex.lastIndex = 0;
      });
    }

    assert.deepEqual(
      violations,
      [],
      `Found hard-coded GH₵ amounts outside src/config/pricing.ts:\n${violations.join("\n")}`
    );
  });

  test("every data-price-token attribute in HTML files maps to a valid key in PRICE_TOKEN_MAP", () => {
    const files = getAllSourceFiles(repoRoot).filter((f) => f.endsWith(".html"));
    const tokenRegex = /data-price-token="([^"]+)"/g;
    const unknownTokens: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        let match: RegExpExecArray | null;
        while ((match = tokenRegex.exec(line)) !== null) {
          const token = match[1];
          if (!(token in PRICE_TOKEN_MAP)) {
            const rel = path.relative(repoRoot, file);
            unknownTokens.push(`${rel}:${idx + 1}: unknown token "${token}"`);
          }
        }
      });
    }

    assert.deepEqual(
      unknownTokens,
      [],
      `Found unmapped data-price-token attributes:\n${unknownTokens.join("\n")}`
    );
  });
});

