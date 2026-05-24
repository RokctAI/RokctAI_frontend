import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMAS_DIR = path.join(__dirname, '../app/config/schemas');
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/RokctAI/Monorepo/main/rcore/rcore/platform/schemas';

// Load Personal Access Token
const token = process.env.MONOREPO_PAT || process.env.GITHUB_TOKEN;

async function fetchWithAuth(filename) {
  const url = `${GITHUB_RAW_BASE}/${filename}`;
  const headers = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function main() {
  console.log('----------------------------------------------------');
  console.log('   RokctAI Schema Sync: Synchronizing API Schemas');
  console.log('----------------------------------------------------');

  try {
    fs.mkdirSync(SCHEMAS_DIR, { recursive: true });

    // 1. Fetch Remote Version
    console.log('  -> Fetching remote schema_version.json...');
    const remoteVersion = await fetchWithAuth('schema_version.json');
    console.log(`     Remote Version: ${remoteVersion.version} (Generated: ${remoteVersion.timestamp})`);

    // 2. Check Local Version
    const localVersionPath = path.join(SCHEMAS_DIR, 'schema_version.json');
    let shouldFetch = true;

    if (fs.existsSync(localVersionPath)) {
      try {
        const localVersion = JSON.parse(fs.readFileSync(localVersionPath, 'utf8'));
        if (localVersion.version === remoteVersion.version) {
          console.log('  -> Local schemas are already up-to-date with remote Monorepo.');
          shouldFetch = false;
        }
      } catch (e) {
        console.warn('  -> Failed to parse local schema_version.json. Re-fetching schemas.');
      }
    }

    if (shouldFetch) {
      console.log('  -> Schemas out of sync. Downloading latest definitions...');

      console.log('  -> Fetching ai_tools.json...');
      const aiTools = await fetchWithAuth('ai_tools.json');
      fs.writeFileSync(path.join(SCHEMAS_DIR, 'ai_tools.json'), JSON.stringify(aiTools, null, 4));

      console.log('  -> Fetching api_manifest.json...');
      const apiManifest = await fetchWithAuth('api_manifest.json');
      fs.writeFileSync(path.join(SCHEMAS_DIR, 'api_manifest.json'), JSON.stringify(apiManifest, null, 4));

      // Save local version descriptor
      fs.writeFileSync(localVersionPath, JSON.stringify(remoteVersion, null, 4));

      console.log('  -> Schemas successfully synchronized and saved.');
    }
  } catch (error) {
    console.error('\n  [Warning] Schema synchronization failed:', error.message);
    if (!token) {
      console.warn('            Personal Access Token (MONOREPO_PAT) is missing. If this is a private repo, you must provide it.');
    }
    console.warn('            Proceeding with existing cached schemas (if any) to prevent compile errors.\n');

    // Fallback: Check if schemas exist locally so build doesn't break
    const toolsExist = fs.existsSync(path.join(SCHEMAS_DIR, 'ai_tools.json'));
    const manifestExists = fs.existsSync(path.join(SCHEMAS_DIR, 'api_manifest.json'));
    if (!toolsExist || !manifestExists) {
      console.error('  [Error] Core schemas (ai_tools.json or api_manifest.json) are missing locally!');
      if (process.env.CI) {
        process.exit(1); // Fail build in CI if schemas are missing
      }
    }
  }
  console.log('----------------------------------------------------\n');
}

main();
