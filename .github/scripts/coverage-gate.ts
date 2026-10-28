// Coverage gate (QG-7.6): line coverage of a pull request must not drop below
// its base branch by more than the tolerance in percentage points.
// Usage: node --experimental-strip-types coverage-gate.ts <base-summary.json> <head-summary.json> <tolerance>
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export interface GateResult {
  readonly passed: boolean;
  readonly message: string;
}

export function checkCoverage(
  basePct: number | undefined,
  headPct: number,
  tolerance: number,
): GateResult {
  if (basePct === undefined) {
    return {
      passed: true,
      message: `No base coverage to compare with. Head line coverage: ${String(headPct)}%.`,
    };
  }
  const drop = basePct - headPct;
  return {
    passed: drop <= tolerance,
    message: `Line coverage: base ${String(basePct)}%, head ${String(headPct)}%, allowed drop ${String(tolerance)} pp.`,
  };
}

interface CoverageSummary {
  total: { lines: { pct: number } };
}

function readLinePct(path: string): number {
  const summary = JSON.parse(readFileSync(path, "utf8")) as CoverageSummary;
  return summary.total.lines.pct;
}

function main(args: readonly string[]): number {
  const [basePath, headPath, tolerance] = args;
  if (basePath === undefined || headPath === undefined || !tolerance) {
    console.error("Usage: coverage-gate.ts <base> <head> <tolerance>");
    return 2;
  }
  const basePct = existsSync(basePath) ? readLinePct(basePath) : undefined;
  const result = checkCoverage(
    basePct,
    readLinePct(headPath),
    Number(tolerance),
  );
  console.log(result.message);
  return result.passed ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
