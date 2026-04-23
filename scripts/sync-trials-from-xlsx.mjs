/**
 * Fills empty MARKET FORECAST columns in the source .xlsx with "N/A"
 * and rebuilds app/data/trials.json from the first sheet (fixed column mapping).
 *
 * Usage: node scripts/sync-trials-from-xlsx.mjs [path-to.xlsx]
 * Default source: final_output_22 copy.xlsx (project root).
 */
import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const xlsxPath = path.resolve(root, process.argv[2] || "final_output_22 copy.xlsx")
const outJson = path.join(root, "app", "data", "trials.json")

function numOrNull(v) {
  if (v === "" || v == null) return null
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

function intOrNull(v) {
  const n = numOrNull(v)
  return n == null ? null : Math.trunc(n)
}

function str(v) {
  if (v == null) return ""
  return String(v).trim()
}

function rowToTrial(row) {
  return {
    nctId: str(row[0]),
    phase: str(row[1]),
    enrollment: numOrNull(row[2]) ?? 0,
    startDate: str(row[3]),
    primaryCompletionDate: str(row[4]),
    completionDate: str(row[5]),
    durationYears: numOrNull(row[6]) ?? 0,
    arms: numOrNull(row[7]) ?? 0,
    estLaunchDate: intOrNull(row[8]),
    dosingFrequency: str(row[9]),
    molecule: str(row[10]),
    approvedBiologics: str(row[11]),
    numTrials: numOrNull(row[13]) ?? 0,
    atcCode: str(row[14]),
    endpoints: str(row[15]),
    adherenceRate: numOrNull(row[16]),
    drugBrandSwitch: str(row[17]),
    indication: str(row[18]),
    incidence2025: intOrNull(row[19]),
    approvalYear: str(row[20]),
    drugPrice: str(row[21]),
    dosageStrength: str(row[23]),
    adverseEffect: str(row[24]),
    locationOther: str(row[25]),
    sponsor: str(row[26]),
    biologicType: str(row[27]),
    age: str(row[28]),
    pharmClass: str(row[30]) || str(row[29]),
    trialDesign: str(row[31]),
    routeOfAdmin: str(row[32]),
    technology: str(row[33]),
    diseaseCondition: str(row[34]),
    adminType: str(row[35]),
    primaryEndPoint: str(row[36]),
    marketForecast2023: str(row[37]) || "N/A",
    marketForecast2024: str(row[38]) || "N/A",
    marketForecast2025: str(row[39]) || "N/A",
    marketForecast2026: str(row[40]) || "N/A",
    marketForecast2027: str(row[41]) || "N/A",
  }
}

const wb = XLSX.readFile(xlsxPath)
const ws = wb.Sheets[wb.SheetNames[0]]
const range = XLSX.utils.decode_range(ws["!ref"])

const FORECAST_START = 37
const FORECAST_END = 41

for (let R = 1; R <= range.e.r; R++) {
  for (let C = FORECAST_START; C <= FORECAST_END; C++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: C })
    const cell = ws[addr]
    const v = cell?.v
    if (v === undefined || v === null || String(v).trim() === "") {
      ws[addr] = { t: "s", v: "N/A" }
    }
  }
}

XLSX.writeFile(wb, xlsxPath)

const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" })
const trials = []
for (let i = 1; i < rows.length; i++) {
  const row = rows[i]
  if (!row[0]) continue
  trials.push(rowToTrial(row))
}

fs.writeFileSync(outJson, JSON.stringify(trials))
console.log("Wrote", trials.length, "trials to", path.relative(root, outJson))
console.log("Forecast sample:", trials[0].marketForecast2023, trials[0].marketForecast2027)
