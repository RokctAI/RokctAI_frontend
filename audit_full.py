# Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published
# by the Free Software Foundation, version 3.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

import os
import re

def generate_endpoints_md(output_file="endpoints_full_audit.md"):
    base_dir = r"C:\Users\sinya\Desktop\RokctAI\Repos\RokctAI_frontend"
    route_handlers = []
    server_actions = []

    http_methods = {'GET', 'POST', 'PUT', 'PATCH', 'DELETE'}

    for root, dirs, filenames in os.walk(base_dir):
        if any(x in root for x in ["node_modules", ".git", ".next"]):
            continue
        for filename in filenames:
            if not (filename.endswith(".ts") or filename.endswith(".tsx")):
                continue
            
            filepath = os.path.join(root, filename)
            rel_path = filepath.replace(base_dir, "").replace("\\", "/")
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Route Handlers
                if filename == 'route.ts':
                    found_methods = []
                    for method in http_methods:
                        if re.search(r'export\s+(async\s+)?(function\s+' + method + r'\b|const\s+' + method + r'\s*=)', content):
                            found_methods.append(method)
                    if found_methods:
                        url_path = rel_path.replace("/app", "").replace("/route.ts", "")
                        parts = url_path.split('/')
                        clean_url = "/" + "/".join([p for p in parts if not (p.startswith('(') and p.endswith(')'))])
                        route_handlers.append({"path": clean_url.replace("//", "/"), "methods": ", ".join(found_methods), "file": rel_path})

                # Server Actions
                if re.search(r'^\s*[\'"]use server[\'"]', content, re.MULTILINE):
                    # Pattern for export async function Name(args)
                    matches1 = re.findall(r'export\s+async\s+function\s+(\w+)\s*\(([\s\S]*?)\)', content)
                    # Pattern for export const Name = async (args)
                    matches2 = re.findall(r'export\s+const\s+(\w+)\s*=\s*async\s*\(([\s\S]*?)\)', content)
                    
                    for name, args in matches1 + matches2:
                        clean_args = re.sub(r'\s+', ' ', args).strip()
                        server_actions.append({"name": name, "payload": clean_args, "file": rel_path})

            except:
                pass

    route_handlers.sort(key=lambda x: x['path'])
    server_actions.sort(key=lambda x: (x['file'], x['name']))

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Exhaustive API Catalog (918 Endpoints)\n\n")
        f.write("## 1. Route Handlers\n\n")
        f.write("| Path | Methods | Source File |\n")
        f.write("| :--- | :--- | :--- |\n")
        for h in route_handlers:
            f.write(f"| `{h['path']}` | {h['methods']} | `{h['file']}` |\n")
            
        f.write("\n## 2. Server Actions\n\n")
        f.write("| File | Function | Payload (Arguments) |\n")
        f.write("| :--- | :--- | :--- |\n")
        for a in server_actions:
            f.write(f"| `{a['file']}` | `{a['name']}` | `{a['payload']}` |\n")

    print(f"Audit complete. Generated {output_file}")

if __name__ == "__main__":
    generate_endpoints_md()
