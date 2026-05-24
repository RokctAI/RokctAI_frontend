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

const LOCAL_MONOREPO_SCHEMAS_DIR = path.join(__dirname, '../../Monorepo/rcore/rcore/platform/schemas');

function generateTypeScriptFiles(aiTools, apiManifest) {
  console.log('  -> Hydrating TypeScript services and actions...');

  const SERVICES_PLATFORM_DIR = path.join(__dirname, '../app/services/platform');
  const ACTIONS_PLATFORM_DIR = path.join(__dirname, '../app/actions/platform');

  // Clean or recreate platform directories to avoid stale generated files
  if (fs.existsSync(SERVICES_PLATFORM_DIR)) {
    fs.rmSync(SERVICES_PLATFORM_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(ACTIONS_PLATFORM_DIR)) {
    fs.rmSync(ACTIONS_PLATFORM_DIR, { recursive: true, force: true });
  }

  fs.mkdirSync(SERVICES_PLATFORM_DIR, { recursive: true });
  fs.mkdirSync(ACTIONS_PLATFORM_DIR, { recursive: true });

  const toCamelCase = (str) =>
    str.replace(/[-_:.]([a-z])/g, (_, char) => char.toUpperCase()).replace(/^(.)/, (_, char) => char.toLowerCase());

  const toPascalCase = (str) => {
    const camel = toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  const servicesMap = {};

  for (const tool of aiTools) {
    const name = tool.name;
    const parts = name.split(':');
    let moduleName = 'general';
    let groupName = 'general';
    let methodName = name;

    if (parts.length === 1) {
      methodName = parts[0];
    } else if (parts.length === 2) {
      moduleName = parts[0];
      methodName = parts[1];
    } else {
      moduleName = parts[0];
      groupName = parts[1];
      methodName = parts.slice(2).join('_');
    }

    const tsMethodName = toCamelCase(methodName);

    if (!servicesMap[moduleName]) {
      servicesMap[moduleName] = {};
    }
    if (!servicesMap[moduleName][groupName]) {
      servicesMap[moduleName][groupName] = [];
    }

    servicesMap[moduleName][groupName].push({
      cmd: name,
      methodName: tsMethodName,
      description: tool.description,
      parameters: tool.parameters,
    });
  }

  // Hydrate Services and Actions
  for (const [moduleName, groups] of Object.entries(servicesMap)) {
    const moduleServicesDir = path.join(SERVICES_PLATFORM_DIR, moduleName);
    const moduleActionsDir = path.join(ACTIONS_PLATFORM_DIR, moduleName);

    fs.mkdirSync(moduleServicesDir, { recursive: true });
    fs.mkdirSync(moduleActionsDir, { recursive: true });

    for (const [groupName, methods] of Object.entries(groups)) {
      const pascalGroupName = toPascalCase(groupName);

      // 1. Generate Service file
      const serviceFilePath = path.join(moduleServicesDir, `${groupName}.ts`);
      const serviceContent = `// @ts-nocheck
/**
 * Generated Service for Platform Module: ${moduleName}, Group: ${groupName}
 * Author: ROKCT Code Generator
 */
import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class ${pascalGroupName}Service {
${methods.map(m => `  /**
   * ${m.description || `Execute ${m.cmd}`}
   */
  static async ${m.methodName}(payload?: any, options?: ServiceOptions) {
    const isControl = "${m.cmd}".startsWith("control:");
    const gateway = isControl ? "rcore.platform.api.control" : "rcore.platform.api.tenant";
    return await BaseService.call(
      gateway,
      {
        cmd: "${m.cmd}",
        payload
      },
      options
    );
  }`).join('\n\n')}
}
`;
      fs.writeFileSync(serviceFilePath, serviceContent, 'utf8');

      // 2. Generate Action file
      const actionFilePath = path.join(moduleActionsDir, `${groupName}.ts`);
      const actionContent = `// @ts-nocheck
/**
 * Generated Server Actions for Platform Module: ${moduleName}, Group: ${groupName}
 * Author: ROKCT Code Generator
 */
"use server";

import { ${pascalGroupName}Service } from "@/app/services/platform/${moduleName}/${groupName}";
import { revalidatePath } from "next/cache";

${methods.map(m => `/**
 * ${m.description || `Execute ${m.cmd}`}
 */
export async function ${m.methodName}(payload?: any) {
  try {
    const result = await ${pascalGroupName}Service.${m.methodName}(payload);
    return result;
  } catch (error) {
    console.error("Failed to execute Server Action ${m.methodName}:", error);
    throw error;
  }
}`).join('\n\n')}
`;
      fs.writeFileSync(actionFilePath, actionContent, 'utf8');
    }
  }

  console.log('  -> TypeScript services and actions successfully generated and hydrated.');
}

async function main() {
  console.log('----------------------------------------------------');
  console.log('   RokctAI Schema Sync: Synchronizing API Schemas');
  console.log('----------------------------------------------------');

  let schemasSynchronized = false;

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
          schemasSynchronized = true;
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
      schemasSynchronized = true;
    }
  } catch (error) {
    console.error('\n  [Warning] Remote schema synchronization failed:', error.message);
    if (!token) {
      console.warn('            Personal Access Token (MONOREPO_PAT) is missing. If this is a private repo, you must provide it.');
    }
    
    // Fallback: Check if we have local Monorepo sibling on disk
    const localVersionPath = path.join(LOCAL_MONOREPO_SCHEMAS_DIR, 'schema_version.json');
    const localToolsPath = path.join(LOCAL_MONOREPO_SCHEMAS_DIR, 'ai_tools.json');
    const localManifestPath = path.join(LOCAL_MONOREPO_SCHEMAS_DIR, 'api_manifest.json');

    if (fs.existsSync(localToolsPath) && fs.existsSync(localManifestPath)) {
      console.log('  -> Found local schemas in backend development directory! Copying...');
      try {
        fs.copyFileSync(localToolsPath, path.join(SCHEMAS_DIR, 'ai_tools.json'));
        fs.copyFileSync(localManifestPath, path.join(SCHEMAS_DIR, 'api_manifest.json'));
        if (fs.existsSync(localVersionPath)) {
          fs.copyFileSync(localVersionPath, path.join(SCHEMAS_DIR, 'schema_version.json'));
        }
        console.log('  -> Local developer schemas successfully staged.');
        schemasSynchronized = true;
      } catch (copyErr) {
        console.error('  -> Failed to copy local schemas:', copyErr.message);
      }
    } else {
      console.warn('            No local backend developer schemas found. Checking cached schemas...');
      const toolsExist = fs.existsSync(path.join(SCHEMAS_DIR, 'ai_tools.json'));
      const manifestExists = fs.existsSync(path.join(SCHEMAS_DIR, 'api_manifest.json'));
      if (toolsExist && manifestExists) {
        console.log('  -> Staging existing cached schemas.');
        schemasSynchronized = true;
      } else {
        console.error('  [Error] Core schemas (ai_tools.json or api_manifest.json) are missing locally!');
        if (process.env.CI) {
          process.exit(1); // Fail build in CI if schemas are missing
        }
      }
    }
  }

  // Hydrate TS files if schemas were successfully staged
  if (schemasSynchronized) {
    try {
      const aiTools = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'ai_tools.json'), 'utf8'));
      const apiManifest = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'api_manifest.json'), 'utf8'));
      generateTypeScriptFiles(aiTools, apiManifest);
    } catch (genErr) {
      console.error('  [Error] Failed to generate TypeScript proxy services and actions:', genErr.message);
      if (process.env.CI) {
        process.exit(1);
      }
    }
  }

  console.log('----------------------------------------------------\n');
}

main();
