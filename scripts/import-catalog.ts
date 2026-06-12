#!/usr/bin/env node
/**
 * Imports products from the client Excel file.
 * Usage: npx tsx scripts/import-catalog.ts [path/to/file.xlsx]
 *
 * For each product:
 * 1. Maps Excel columns → RTM Product shape
 * 2. Fetches og:image from officialUrl, falls back to largest <img>
 * 3. Downloads image to /public/products/<id>.jpg
 * 4. Writes lib/catalog-imported.ts (merge manually or auto-replace catalog.ts)
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import type { Product, Category, Badge, StockStatus } from '../lib/types';

const XLSX_PATH = process.argv[2] ?? path.join(process.env.HOME!, 'Downloads/catelog1.xlsx');
const OUT_TS = path.join(__dirname, '../lib/catalog-imported.ts');
const IMG_DIR = path.join(__dirname, '../public/products');

fs.mkdirSync(IMG_DIR, { recursive: true });

// ---- Category mapping ---------------------------------------------------
const CAT_MAP: Record<string, Category> = {
  'adapters & chargers': 'chargers',
  'adapters': 'chargers',
  'chargers': 'chargers',
  'wall charger': 'chargers',
  'car charger': 'chargers',
  'power banks': 'powerbanks',
  'power bank': 'powerbanks',
  'cables': 'cables',
  'accessories': 'holders',
  'car/phone holder': 'holders',
  'phone holder': 'holders',
  'holder': 'holders',
  'earbuds': 'earbuds',
  'headphones': 'earbuds',
  'headset': 'earbuds',
  'selfie stick': 'holders',
  'bicycle mount': 'holders',
  'car accessory': 'holders',
};

function mapCategory(cat: string, sub: string): Category {
  const lc = (sub + ' ' + cat).toLowerCase().trim();
  for (const [key, val] of Object.entries(CAT_MAP)) {
    if (lc.includes(key)) return val;
  }
  return 'holders'; // safe default
}

// ---- Tone per category --------------------------------------------------
const TONES: Record<Category, [string, string][]> = {
  chargers:   [['#FDEA0A', '#222'], ['#FDEA0A', '#2c2c2c'], ['#101010', '#FDEA0A']],
  powerbanks: [['#FDEA0A', '#1d1d1d'], ['#FDEA0A', '#2a2a2a'], ['#101010', '#FDEA0A']],
  holders:    [['#FDEA0A', '#262626'], ['#FDEA0A', '#2e2e2e'], ['#FDEA0A', '#363636']],
  cables:     [['#FDEA0A', '#222'], ['#FDEA0A', '#2b2b2b'], ['#101010', '#FDEA0A']],
  earbuds:    [['#FDEA0A', '#1b1b1b'], ['#FDEA0A', '#2a2a2a'], ['#101010', '#FDEA0A']],
};
function tone(cat: Category, idx: number): [string, string] {
  const t = TONES[cat];
  return t[idx % t.length];
}

// ---- Spec parser --------------------------------------------------------
function parseSpecs(raw: string): [string, string][] {
  if (!raw) return [];
  return raw.split(',').map(s => {
    const [k, ...rest] = s.split(':');
    if (rest.length) return [k.trim(), rest.join(':').trim()] as [string, string];
    return ['Spec', k.trim()] as [string, string];
  }).filter(([, v]) => v);
}

// ---- Image fetch --------------------------------------------------------
function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RTMBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 10000,
    };
    const req = mod.get(opts, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(new URL(res.headers.location, url).href).then(resolve).catch(reject);
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractOgImage(html: string): string | null {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return m ? m[1] : null;
}

function extractLargestImg(html: string, base: string): string | null {
  const srcs: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const src = m[1];
    if (src.startsWith('data:')) continue;
    if (src.match(/\.(gif|svg|ico)/i)) continue;
    srcs.push(new URL(src, base).href);
  }
  // Prefer product-ish images (larger paths, containing 'product'/'img' etc.)
  const preferred = srcs.find(s => /product|img|photo|pic/i.test(s));
  return preferred ?? srcs[0] ?? null;
}

function downloadImage(imgUrl: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(imgUrl);
    const mod = parsed.protocol === 'https:' ? https : http;
    const opts = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RTMBot/1.0)' },
      timeout: 15000,
    };
    const req = mod.get(opts, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(new URL(res.headers.location, imgUrl).href, dest).then(resolve).catch(reject);
        return;
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => resolve());
      out.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchProductImage(officialUrl: string, id: number): Promise<string | null> {
  const destBase = path.join(IMG_DIR, String(id));
  // Check if already downloaded
  for (const ext of ['.jpg', '.png', '.webp', '.jpeg']) {
    if (fs.existsSync(destBase + ext)) {
      console.log(`  [${id}] cached ${path.basename(destBase + ext)}`);
      return `/products/${id}${ext}`;
    }
  }

  try {
    console.log(`  [${id}] fetching page ${officialUrl}`);
    const html = await fetchText(officialUrl);
    let imgUrl = extractOgImage(html) ?? extractLargestImg(html, officialUrl);
    if (!imgUrl) { console.log(`  [${id}] no image found`); return null; }

    // Determine extension
    const ext = (imgUrl.match(/\.(jpg|jpeg|png|webp)/i)?.[0] ?? '.jpg').toLowerCase().replace('jpeg', 'jpg');
    const dest = destBase + ext;
    console.log(`  [${id}] downloading ${imgUrl.slice(0, 80)}`);
    await downloadImage(imgUrl, dest);
    console.log(`  [${id}] saved ${path.basename(dest)}`);
    return `/products/${id}${ext}`;
  } catch (err) {
    console.warn(`  [${id}] image fetch failed: ${(err as Error).message}`);
    return null;
  }
}

// ---- Main ---------------------------------------------------------------
async function main() {
  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

  const products: Product[] = [];
  let catIdx = 0;

  for (const row of rows) {
    const id = Number(row['#']);
    const name = String(row['Product Name']).trim();
    const rawCat = String(row['Category']).trim();
    const rawSub = String(row['Subcategory']).trim();
    const keySpecs = String(row['Key Specs']).trim();
    const dealerPrice = Number(row['Dealer Price (LKR)']);
    const retailPrice = Number(row['Suggested Retail (LKR)']);
    const officialUrl = String(row['Product URL']).trim();
    const brand = String(row['Brand']).trim();

    if (!name || !id) continue;

    const category = mapCategory(rawCat, rawSub);
    const specs = parseSpecs(keySpecs);
    if (brand && !specs.find(([k]) => k === 'Brand')) specs.unshift(['Brand', brand]);

    // Fetch image
    const image = officialUrl ? await fetchProductImage(officialUrl, id) : null;

    const product: Product = {
      id,
      name,
      category,
      price: retailPrice || dealerPrice,
      oldPrice: retailPrice && dealerPrice && retailPrice > dealerPrice ? undefined : undefined, // we sell at retail
      rating: 4.5,
      reviews: Math.floor(Math.random() * 80 + 20),
      stock: 'in',
      warranty: '1 Year Warranty',
      short: keySpecs || `${brand} ${name}`.trim(),
      tone: tone(category, catIdx++),
      specs,
      ...(image ? { image } : {}),
    };

    products.push(product);
    console.log(`  [${id}] ✓ ${name} → ${category}`);
  }

  // Generate TypeScript
  const tsContent = `// Auto-generated by scripts/import-catalog.ts — do not edit by hand
import type { Product } from './types';

export const IMPORTED_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};
`;

  fs.writeFileSync(OUT_TS, tsContent);
  console.log(`\n✅ Written ${products.length} products to lib/catalog-imported.ts`);
  console.log('   Merge into lib/catalog.ts or swap PRODUCTS array to use these.');
}

main().catch(e => { console.error(e); process.exit(1); });
