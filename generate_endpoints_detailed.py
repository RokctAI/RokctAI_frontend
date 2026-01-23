import os
import re

def generate_endpoints_detailed(output_file="endpoints_detailed.md"):
    files = []
    for root, dirs, filenames in os.walk("."):
        parts = root.split(os.sep)
        if "node_modules" in parts or ".git" in parts or ".next" in parts:
            continue
        for filename in filenames:
            if filename.endswith(".ts") or filename.endswith(".tsx"):
                files.append(os.path.join(root, filename))

    route_handlers = []
    server_actions = []

    http_methods = {'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'}

    for filepath in files:
        try:
            with open(filepath, 'r') as f:
                content = f.read()

            # --- Route Handlers ---
            if filepath.endswith('route.ts'):
                clean_path = filepath
                if clean_path.startswith("./"):
                    clean_path = clean_path[2:]
                if clean_path.startswith("app/"):
                    url_path = clean_path[4:]
                else:
                    url_path = clean_path

                url_path = url_path.replace("/route.ts", "")

                parts = url_path.split('/')
                clean_parts = [p for p in parts if not (p.startswith('(') and p.endswith(')'))]
                url_path = "/" + "/".join(clean_parts)

                found_methods = []
                for method in http_methods:
                    pattern = r'export\s+(async\s+)?(function\s+' + method + r'\b|const\s+' + method + r'\s*=)'
                    if re.search(pattern, content):
                        found_methods.append(method)

                destructuring_pattern = r'export\s+const\s+\{([^}]+)\}\s*='
                match = re.search(destructuring_pattern, content)
                if match:
                    inside_braces = match.group(1)
                    parts_list = [p.strip() for p in inside_braces.split(',')]
                    for part in parts_list:
                        method_name = part.split(':')[0].strip()
                        if method_name in http_methods and method_name not in found_methods:
                            found_methods.append(method_name)

                if found_methods:
                    route_handlers.append({
                        "path": url_path,
                        "methods": sorted(found_methods),
                        "file": filepath
                    })

            # --- Server Actions ---
            lines = content.splitlines()
            is_top_level_server = False
            for line in lines[:20]:
                if re.match(r'^\s*[\'"]use server[\'"]\s*;?', line):
                    is_top_level_server = True
                    break

            if is_top_level_server:
                # Capture function signature
                # 1. export async function Name(args...)
                # 2. export const Name = async (args...) =>

                # Regex for "export async function Name(arguments) ..."
                # We try to capture the arguments string inside parentheses

                # Use DOTALL to match across lines if needed, but for simplicity we iterate matches

                # Pattern 1: export async function
                # Group 1: Name
                # Group 2: Arguments content
                p1 = r'export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)'
                matches1 = re.findall(p1, content, re.DOTALL)

                for name, args in matches1:
                    clean_args = " ".join(args.split()).strip()
                    server_actions.append({
                        "function": name,
                        "arguments": clean_args,
                        "file": filepath
                    })

                # Pattern 2: export const Name = async (...)
                p2 = r'export\s+const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)'
                matches2 = re.findall(p2, content, re.DOTALL)

                for name, args in matches2:
                    clean_args = " ".join(args.split()).strip()
                    server_actions.append({
                        "function": name,
                        "arguments": clean_args,
                        "file": filepath
                    })

        except Exception as e:
            pass

    # Sort
    route_handlers.sort(key=lambda x: x['path'])
    server_actions.sort(key=lambda x: (x['file'], x['function']))

    # Write Markdown
    with open(output_file, 'w') as f:
        f.write("# API Endpoints Detailed\n\n")
        f.write(f"Total Endpoints Found: {len(route_handlers) + len(server_actions)}\n")
        f.write(f"- Route Handlers: {len(route_handlers)}\n")
        f.write(f"- Server Actions: {len(server_actions)}\n\n")

        f.write("## Route Handlers\n\n")
        f.write("| Path | Methods | File |\n")
        f.write("| :--- | :--- | :--- |\n")
        for handler in route_handlers:
            methods_str = ", ".join(handler['methods'])
            f.write(f"| `{handler['path']}` | {methods_str} | `{handler['file']}` |\n")

        f.write("\n## Server Actions\n\n")
        f.write("| Function Name | Arguments | File |\n")
        f.write("| :--- | :--- | :--- |\n")
        for action in server_actions:
            # Escape pipes in arguments to avoid breaking markdown table
            args_display = action['arguments'].replace("|", "\\|")
            f.write(f"| `{action['function']}` | `{args_display}` | `{action['file']}` |\n")

    print(f"Generated {output_file} with {len(route_handlers) + len(server_actions)} endpoints.")

if __name__ == "__main__":
    generate_endpoints_detailed()
