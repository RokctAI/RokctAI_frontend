# Copyright (c) 2026 RokctAI
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

import os
import re

def generate_endpoints_md(output_file="endpoints_audit_raw.md"):
    # Find all TS/TSX files
    files = []
    base_dir = r"C:\Users\sinya\Desktop\RokctAI\Repos\RokctAI_frontend"
    for root, dirs, filenames in os.walk(base_dir):
        if "node_modules" in root or ".git" in root or ".next" in root:
            continue
        for filename in filenames:
            if filename.endswith(".ts") or filename.endswith(".tsx"):
                files.append(os.path.join(root, filename))

    route_handlers = []
    server_actions = []

    http_methods = {'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'}

    for filepath in files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # --- Route Handlers ---
            if filepath.endswith('route.ts'):
                clean_path = filepath.replace(base_dir, "")
                url_path = clean_path.replace("\\", "/").replace("/route.ts", "")
                if url_path.startswith("/app"): url_path = url_path[4:]
                
                parts = url_path.split('/')
                clean_parts = [p for p in parts if not (p.startswith('(') and p.endswith(')'))]
                url_path = "/" + "/".join(filter(None, clean_parts))
                
                found_methods = []
                for method in http_methods:
                    pattern = r'export\s+(async\s+)?(function\s+' + method + r'\b|const\s+' + method + r'\s*=)'
                    if re.search(pattern, content):
                        found_methods.append(method)
                
                if found_methods:
                    route_handlers.append({"path": url_path, "methods": sorted(found_methods), "file": clean_path})

            # --- Server Actions ---
            lines = content.splitlines()
            is_top_level_server = False
            for line in lines[:20]:
                if re.match(r'^\s*[\'"]use server[\'"]\s*;?', line):
                    is_top_level_server = True
                    break
            
            if is_top_level_server:
                # 1. export async function Name(arg1, arg2)
                matches1 = re.findall(r'export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)', content)
                
                # 2. export const Name = async (arg1, arg2)
                matches2 = re.findall(r'export\s+const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)', content)
                
                for name, args in matches1 + matches2:
                    server_actions.append({"function": name, "args": args.strip(), "file": filepath.replace(base_dir, "")})

        except Exception as e:
            pass

    route_handlers.sort(key=lambda x: x['path'])
    server_actions.sort(key=lambda x: (x['file'], x['function']))

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Total API Endpoints Reconstruction\n\n")
        f.write(f"Total: {len(route_handlers) + len(server_actions)}\n\n")
        f.write("## Server Actions (with Payloads)\n\n")
        f.write("| File | Function | Arguments (Payload) |\n")
        f.write("| :--- | :--- | :--- |\n")
        for action in server_actions:
            f.write(f"| `{action['file']}` | `{action['function']}` | `{action['args']}` |\n")
            
    print(f"Generated {output_file}")

if __name__ == "__main__":
    generate_endpoints_md()
