// Phase A — scrapes the entire national pregrado/grado career catalog from
// https://guiadecarreras.siu.edu.ar by querying once per (rama × modalidad ×
// regimen) combination — 6 ramas × 2 modalidades (Presencial/Distancia) × 2
// regimenes (Estatal/Privado; Internacional is deliberately excluded) = 24
// queries, each with no pagination. Run rarely (data refresh), not on every
// DB init: see scripts/import-siu-data.ts for the fast, repeatable path that
// consumes this script's output.
//
// Usage: tsx scripts/scrape-siu.ts [--rama=CD] [--retry-failed]
import { chromium, type Page } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { RAMA_CODES, MODALIDAD_CODES, REGIMEN_CODES, type RamaCode, type ModalidadCode, type RegimenCode } from "./lib/siu-mappings";

const FORM_URL = "https://guiadecarreras.siu.edu.ar/ciie_ofertas/2.0/guia_grado.php";
const DATA_DIR = "data";
const RAW_PATH = `${DATA_DIR}/siu-careers.raw.json`;
const PROGRESS_PATH = `${DATA_DIR}/.scrape-progress.json`;

interface RawRow {
  universidad: string;
  facultad: string;
  titulo: string;
  tipoTitulo: string;
  duracion: string;
  condicionesIngreso: string;
  domicilio: string;
  telefono: string;
  web: string | null;
  mail: string;
}

interface Combo {
  rama: RamaCode;
  modalidad: ModalidadCode;
  regimen: RegimenCode;
}

interface ComboResult extends Combo {
  scrapedAt: string;
  rows: RawRow[];
}

interface RawData {
  scrapedAt: string;
  combos: ComboResult[];
}

interface Progress {
  done: string[];
  failed: string[];
}

const ALL_COMBOS: Combo[] = RAMA_CODES.flatMap((rama) =>
  MODALIDAD_CODES.flatMap((modalidad) => REGIMEN_CODES.map((regimen) => ({ rama, modalidad, regimen })))
);

function comboKey(c: Combo): string {
  return `${c.rama}|${c.modalidad}|${c.regimen}`;
}

function loadJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function saveJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2));
}

async function scrapeCombo(page: Page, { rama, modalidad, regimen }: Combo): Promise<RawRow[]> {
  await page.goto(FORM_URL, { waitUntil: "load" });
  await page.selectOption("select[name='ef_form_14000042_filtrorama']", rama);
  await page.selectOption("select[name='ef_form_14000042_filtroidtitulopresencial']", modalidad);
  await page.selectOption("select[name='ef_form_14000042_filtroregimen']", regimen);

  const popupPromise = page.waitForEvent("popup");
  await page.click("#form_14000042_filtro_filtrar");
  const popup = await popupPromise;
  await popup.waitForLoadState("load");
  await popup.waitForSelector("table.tabla-0").catch(() => null);

  const rows: RawRow[] = await popup.locator("table.tabla-0 tr.ei-cuadro-celda-impar, table.tabla-0 tr.ei-cuadro-celda-par").evaluateAll(
    (trs) =>
      trs.map((tr) => {
        const cells = Array.from(tr.querySelectorAll("td")).map((td) => td.textContent?.trim() ?? "");
        const webAnchor = tr.querySelectorAll("td")[8]?.querySelector("a");
        return {
          universidad: cells[0] ?? "",
          facultad: cells[1] ?? "",
          titulo: cells[2] ?? "",
          tipoTitulo: cells[3] ?? "",
          duracion: cells[4] ?? "",
          condicionesIngreso: cells[5] ?? "",
          domicilio: cells[6] ?? "",
          telefono: cells[7] ?? "",
          web: webAnchor ? webAnchor.getAttribute("href") : null,
          mail: cells[9] ?? "",
        };
      })
  );

  await popup.close();
  return rows;
}

async function main() {
  const args = process.argv.slice(2);
  const ramaArg = args.find((a) => a.startsWith("--rama="))?.split("=")[1] as RamaCode | undefined;
  const retryFailed = args.includes("--retry-failed");

  mkdirSync(DATA_DIR, { recursive: true });

  const raw = loadJson<RawData>(RAW_PATH, { scrapedAt: new Date().toISOString(), combos: [] });
  const progress = loadJson<Progress>(PROGRESS_PATH, { done: [], failed: [] });

  let targets: Combo[];
  if (ramaArg) {
    targets = ALL_COMBOS.filter((c) => c.rama === ramaArg);
  } else if (retryFailed) {
    targets = ALL_COMBOS.filter((c) => progress.failed.includes(comboKey(c)));
  } else {
    targets = ALL_COMBOS.filter((c) => !progress.done.includes(comboKey(c)));
  }

  if (targets.length === 0) {
    console.log("Nothing to do — all combos already scraped. Use --retry-failed or --rama=<code> to force.");
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const combo of targets) {
    const key = comboKey(combo);
    try {
      console.log(`Scraping ${key}...`);
      const rows = await scrapeCombo(page, combo);
      console.log(`  -> ${rows.length} rows`);

      raw.combos = raw.combos.filter((c) => comboKey(c) !== key);
      raw.combos.push({ ...combo, scrapedAt: new Date().toISOString(), rows });
      saveJson(RAW_PATH, raw);

      progress.done = [...new Set([...progress.done, key])];
      progress.failed = progress.failed.filter((k) => k !== key);
      saveJson(PROGRESS_PATH, progress);
    } catch (err) {
      console.error(`  FAILED ${key}:`, err);
      progress.failed = [...new Set([...progress.failed, key])];
      saveJson(PROGRESS_PATH, progress);
    }

    await page.waitForTimeout(2000 + Math.random() * 2000);
  }

  await browser.close();

  console.log(`\nDone: ${progress.done.length}/${ALL_COMBOS.length} combos, ${progress.failed.length} failed.`);
  if (progress.failed.length > 0) {
    console.log(`Failed: ${progress.failed.join(", ")} — re-run with --retry-failed`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
