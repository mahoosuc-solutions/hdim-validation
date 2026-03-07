#!/usr/bin/env node

import { readFile, access, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import OpenAI from "openai";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_DIR = join(__dirname, "..");
const PROMPTS_FILE = join(SITE_DIR, "image-prompts.md");
const OUTPUT_DIR = join(SITE_DIR, "public", "images");

const RESPONSIVE_WIDTHS = [1280, 640];

// Image map matching image-prompts.md
const IMAGE_MAP = [
  { num: 1, filename: "hero-dashboard" },
  { num: 2, filename: "problem-fragmented" },
  { num: 3, filename: "solution-insights" },
  { num: 4, filename: "data-flow" },
  { num: 5, filename: "use-case-diabetes" },
  { num: 6, filename: "use-case-preventive" },
  { num: 7, filename: "use-case-elderly" },
  { num: 8, filename: "story-morning" },
  { num: 9, filename: "story-platform" },
  { num: 10, filename: "story-future" },
];

// Parse CLI args
const { values: args } = parseArgs({
  options: {
    only: { type: "string" },
    force: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
  },
  strict: true,
});

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse image-prompts.md and extract prompt text for each image number.
 * Splits on "## Image NN:" headers and finds "### Prompt" sections.
 */
async function parsePrompts() {
  const md = await readFile(PROMPTS_FILE, "utf-8");
  const prompts = new Map();

  // Split into image sections
  const sections = md.split(/^## Image (\d+):/m);

  // sections[0] is content before first image header (style preamble area)
  // Then pairs: sections[1]=num, sections[2]=content, sections[3]=num, sections[4]=content, ...
  for (let i = 1; i < sections.length; i += 2) {
    const num = parseInt(sections[i], 10);
    const content = sections[i + 1];
    if (!content) continue;

    // Extract text after "### Prompt" until the next "---" or "##" or end
    const promptMatch = content.match(
      /### Prompt\n([\s\S]*?)(?=\n---|\n## |\n### |$)/
    );
    if (promptMatch) {
      const promptText = promptMatch[1].trim();
      prompts.set(num, promptText);
    }
  }

  return prompts;
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function saveWithVariants(imageBuffer, filename) {
  const basePath = join(OUTPUT_DIR, `${filename}.webp`);

  // Full size WebP
  await sharp(imageBuffer).webp({ quality: 85 }).toFile(basePath);
  console.log(`    Saved: ${filename}.webp`);

  // Responsive variants
  for (const width of RESPONSIVE_WIDTHS) {
    const variantPath = join(OUTPUT_DIR, `${filename}-${width}.webp`);
    await sharp(imageBuffer)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(variantPath);
    console.log(`    Saved: ${filename}-${width}.webp`);
  }
}

async function main() {
  console.log("HDIM Validation — DALL-E 3 Image Generator\n");

  // Parse prompts from markdown
  const prompts = await parsePrompts();
  console.log(`Found ${prompts.size} prompts in image-prompts.md\n`);

  // Filter to selected images
  let images = IMAGE_MAP;
  if (args.only) {
    const onlyNum = parseInt(args.only, 10);
    images = images.filter((img) => img.num === onlyNum);
    if (images.length === 0) {
      console.error(`No image found with number ${args.only}`);
      process.exit(1);
    }
  }

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  if (args["dry-run"]) {
    console.log("=== DRY RUN — showing prompts without calling API ===\n");
    for (const img of images) {
      const prompt = prompts.get(img.num);
      console.log(
        `Image ${String(img.num).padStart(2, "0")}: ${img.filename}`
      );
      console.log(`Prompt (${prompt?.length ?? 0} chars):`);
      console.log(prompt ?? "(not found)");
      console.log("\n---\n");
    }
    return;
  }

  // Validate API key
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "Error: OPENAI_API_KEY environment variable is required.\n" +
        "Usage: OPENAI_API_KEY=sk-... node scripts/generate-images.mjs"
    );
    process.exit(1);
  }

  const openai = new OpenAI();

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const img of images) {
    const label = `Image ${String(img.num).padStart(2, "0")}: ${img.filename}`;
    const fullSizePath = join(OUTPUT_DIR, `${img.filename}.webp`);

    // Resume support: skip existing unless --force
    if (!args.force && (await fileExists(fullSizePath))) {
      console.log(`[SKIP] ${label} — already exists (use --force to regenerate)`);
      skipped++;
      continue;
    }

    const prompt = prompts.get(img.num);
    if (!prompt) {
      console.log(`[FAIL] ${label} — no prompt found in markdown`);
      failed++;
      continue;
    }

    console.log(`[GENERATING] ${label}...`);
    const startTime = Date.now();

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        response_format: "url",
      });

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      if (revisedPrompt) {
        console.log(
          `    Revised prompt: ${revisedPrompt.substring(0, 100)}...`
        );
      }

      // Download and save
      console.log("    Downloading...");
      const imageBuffer = await downloadImage(imageUrl);

      console.log("    Converting to WebP and generating variants...");
      await saveWithVariants(imageBuffer, img.filename);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[DONE] ${label} (${elapsed}s)\n`);
      generated++;
    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`[FAIL] ${label} (${elapsed}s) — ${err.message}\n`);
      failed++;
    }
  }

  // Summary
  console.log("=".repeat(50));
  console.log("Summary:");
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${images.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
