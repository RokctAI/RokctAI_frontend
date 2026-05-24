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
  console.log('  -> Hydrating TypeScript services, actions, validation schemas, and react form components...');

  const SERVICES_PLATFORM_DIR = path.join(__dirname, '../app/services/platform');
  const ACTIONS_PLATFORM_DIR = path.join(__dirname, '../app/actions/platform');
  const VALIDATORS_PLATFORM_DIR = path.join(__dirname, '../lib/platform/validators');
  const FORMS_PLATFORM_DIR = path.join(__dirname, '../components/platform/forms');

  // Clean or recreate platform directories to avoid stale generated files
  const dirs = [SERVICES_PLATFORM_DIR, ACTIONS_PLATFORM_DIR, VALIDATORS_PLATFORM_DIR, FORMS_PLATFORM_DIR];
  for (const d of dirs) {
    if (fs.existsSync(d)) {
      fs.rmSync(d, { recursive: true, force: true });
    }
    fs.mkdirSync(d, { recursive: true });
  }

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

  // Hydrate Services, Actions, Validators, and Forms
  for (const [moduleName, groups] of Object.entries(servicesMap)) {
    const moduleServicesDir = path.join(SERVICES_PLATFORM_DIR, moduleName);
    const moduleActionsDir = path.join(ACTIONS_PLATFORM_DIR, moduleName);
    const moduleValidatorsDir = path.join(VALIDATORS_PLATFORM_DIR, moduleName);
    const moduleFormsDir = path.join(FORMS_PLATFORM_DIR, moduleName);

    fs.mkdirSync(moduleServicesDir, { recursive: true });
    fs.mkdirSync(moduleActionsDir, { recursive: true });
    fs.mkdirSync(moduleValidatorsDir, { recursive: true });
    fs.mkdirSync(moduleFormsDir, { recursive: true });

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

      // 3. Generate Zod Validator file
      const validatorFilePath = path.join(moduleValidatorsDir, `${groupName}.ts`);
      const validatorContent = `// @ts-nocheck
/**
 * Generated Zod Validators for Platform Module: ${moduleName}, Group: ${groupName}
 * Author: ROKCT Code Generator
 */
import * as z from "zod";

${methods.map(m => {
  const pascalFuncName = toPascalCase(m.methodName);
  const props = m.parameters?.properties || {};
  return `export const ${m.methodName}Schema = z.object({
${Object.entries(props).map(([pName, pValue]) => {
  const isRequired = m.parameters?.required?.includes(pName);
  let zodType = 'z.any()';
  if (pValue.type === 'string') {
    zodType = isRequired ? 'z.string().min(1, "Required")' : 'z.string().optional().or(z.literal(""))';
  } else if (pValue.type === 'number' || pValue.type === 'integer') {
    zodType = isRequired ? 'z.coerce.number()' : 'z.coerce.number().optional()';
  } else if (pValue.type === 'boolean') {
    zodType = isRequired ? 'z.boolean()' : 'z.boolean().optional()';
  } else if (pValue.type === 'array') {
    zodType = isRequired ? 'z.array(z.any())' : 'z.array(z.any()).optional()';
  } else if (pValue.type === 'object') {
    zodType = isRequired ? 'z.any()' : 'z.any().optional()';
  }
  return `  ${pName}: ${zodType},`;
}).join('\n')}
});

export type ${pascalFuncName}Values = z.infer<typeof ${m.methodName}Schema>;
`;
}).join('\n\n')}
`;
      fs.writeFileSync(validatorFilePath, validatorContent, 'utf8');

      // 4. Generate Form Component file
      const formFilePath = path.join(moduleFormsDir, `${groupName}.tsx`);
      const formContent = `// @ts-nocheck
/**
 * Generated Form Components for Platform Module: ${moduleName}, Group: ${groupName}
 * Author: ROKCT Code Generator
 */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import * as actions from "@/app/actions/platform/${moduleName}/${groupName}";
import * as validators from "@/lib/platform/validators/${moduleName}/${groupName}";

${methods.map(m => {
  const pascalFuncName = toPascalCase(m.methodName);
  const props = m.parameters?.properties || {};
  return `
export interface ${pascalFuncName}FormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  defaultValues?: Partial<validators.${pascalFuncName}Values>;
}

export function ${pascalFuncName}Form({ onSuccess, onError, defaultValues }: ${pascalFuncName}FormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<validators.${pascalFuncName}Values>({
    resolver: zodResolver(validators.${m.methodName}Schema),
    defaultValues: {
      ${Object.entries(props).map(([pName, pValue]) => {
        let defVal = 'undefined';
        if (pValue.type === 'string') defVal = '""';
        else if (pValue.type === 'boolean') defVal = 'false';
        return `${pName}: ${defVal},`;
      }).join('\n      ')}
      ...defaultValues,
    },
  });

  const onSubmit = async (values: validators.${pascalFuncName}Values) => {
    setSubmitting(true);
    try {
      const result = await actions.${m.methodName}(values);
      toast.success("Action executed successfully");
      if (onSuccess) onSuccess(result);
    } catch (err) {
      console.error("Action execution error:", err);
      toast.error(err.message || "Failed to execute action");
      if (onError) onError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>${pascalFuncName}</CardTitle>
        <CardDescription>${m.description || `Execute ${m.cmd} whitelisted API`}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            ${Object.entries(props).map(([pName, pValue]) => {
              const label = toPascalCase(pName).replace(/([A-Z])/g, ' $1').trim();
              const isTextArea = pName.toLowerCase().includes("description") || pName.toLowerCase().includes("overview") || pName.toLowerCase().includes("notes") || pName.toLowerCase().includes("payload");
              const isNumber = pValue.type === "number" || pValue.type === "integer";
              const isBoolean = pValue.type === "boolean";

              let inputComponent = `<Input placeholder="Enter ${pName}..." {...field} />`;
              if (isTextArea) {
                inputComponent = `<Textarea placeholder="Enter ${pName}..." className="min-h-[80px]" {...field} />`;
              } else if (isNumber) {
                inputComponent = `<Input type="number" placeholder="0" {...field} />`;
              } else if (isBoolean) {
                inputComponent = `<Input type="checkbox" className="w-4 h-4 cursor-pointer" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />`;
              }

              return `
            <FormField
              control={form.control}
              name="${pName}"
              render={({ field }) => (
                <FormItem className="${isBoolean ? 'flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3' : ''}">
                  <FormLabel>${label}</FormLabel>
                  <FormControl>
                    ${inputComponent}
                  </FormControl>
                  ${pValue.description ? `<FormDescription>${pValue.description}</FormDescription>` : ''}
                  <FormMessage />
                </FormItem>
              )}
            />`;
            }).join('\n')}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                "Execute Action"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
`;
}).join('\n')}
`;
      fs.writeFileSync(formFilePath, formContent, 'utf8');
    }
  }

  console.log('  -> TypeScript services, Server Actions, Zod validators, and forms successfully hydrated.');
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
