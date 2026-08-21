import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.join(__dirname, "../app");
const COMPONENTS_DIR = path.join(__dirname, "../components");
const MANIFEST_PATH = path.join(
  __dirname,
  "../app/config/schemas/api_manifest.json",
);

const toCamelCase = (str) =>
  str
    .replace(/[-_:.]([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());

function main() {
  console.log("----------------------------------------------------");
  console.log("   ROKCT Platform Auditor: Integrity Auditing");
  console.log("----------------------------------------------------");

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("  [Warning] Manifest not found. Skipping auditing.");
    process.exit(0);
  }

  // 1. Build list of valid whitelisted actions
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const whitelistedMethods = new Set();

  for (const cmd of Object.keys(manifest)) {
    const parts = cmd.split(":");
    let methodName = cmd;
    if (parts.length === 1) {
      methodName = parts[0];
    } else if (parts.length === 2) {
      methodName = parts[1];
    } else {
      methodName = parts.slice(2).join("_");
    }
    whitelistedMethods.add(toCamelCase(methodName));
  }

  // 2. Scan pages and components
  let failed = false;
  const scanDirectory = (dir) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".next" ||
          entry.name === "platform"
        )
          continue;
        scanDirectory(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
      ) {
        auditFile(fullPath, whitelistedMethods);
      }
    }
  };

  const auditFile = (filePath, validMethods) => {
    const content = fs.readFileSync(filePath, "utf8");
    // Look for platform actions imports, e.g.:
    // import { runInterestAccrual } from "@/app/actions/platform/lending/operations"
    const importRegex =
      /import\s*\{([^}]+)\}\s*from\s*["']@\/app\/actions\/platform\/[^"']+["']/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importsStr = match[1];
      const imports = importsStr
        .split(",")
        .map((s) => s.trim().split(/\s+as\s+/)[0]); // handle aliases as well

      for (const imp of imports) {
        if (!imp || imp === "revalidatePath") continue;
        if (!validMethods.has(imp)) {
          console.error(
            `\n  ❌ INTEGRITY ERROR: Stale or unauthorized API import found!`,
          );
          console.error(`     File:   ${filePath}`);
          console.error(`     Action: ${imp}`);
          console.error(
            `     Reason: '${imp}' is not in the platform's whitelisted manifest.`,
          );
          failed = true;
        }
      }
    }
  };

  scanDirectory(APP_DIR);
  scanDirectory(COMPONENTS_DIR);

  if (failed) {
    console.error(
      "\n  [Failure] Integrity check failed. Please remove or fix stale imports.",
    );
    if (process.env.CI) {
      process.exit(1);
    }
  } else {
    console.log(
      "  -> Integrity verification passed. All UI links are verified and safe.",
    );
    console.log("----------------------------------------------------\n");
  }
}

main();
