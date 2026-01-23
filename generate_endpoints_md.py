import os
import re

def generate_endpoints_md(output_file="endpoints.md"):
    # Find all TS/TSX files
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

                # Standard exports
                for method in http_methods:
                    pattern = r'export\s+(async\s+)?(function\s+' + method + r'\b|const\s+' + method + r'\s*=)'
                    if re.search(pattern, content):
                        found_methods.append(method)

                # Destructuring exports
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
                # Find exported async functions
                matches1 = re.findall(r'export\s+async\s+function\s+(\w+)', content)
                matches2 = re.findall(r'export\s+const\s+(\w+)\s*=\s*async', content)
                all_funcs = matches1 + matches2

                for func_name in all_funcs:
                    server_actions.append({
                        "function": func_name,
                        "file": filepath
                    })

        except Exception as e:
            print(f"Error processing {filepath}: {e}")

    # Sort lists
    route_handlers.sort(key=lambda x: x['path'])
    server_actions.sort(key=lambda x: (x['file'], x['function']))

    # Write Markdown
    with open(output_file, 'w') as f:
        f.write("# API Endpoints\n\n")
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
        f.write("| Function Name | File |\n")
        f.write("| :--- | :--- |\n")
        for action in server_actions:
            f.write(f"| `{action['function']}` | `{action['file']}` |\n")

    print(f"Generated {output_file} with {len(route_handlers) + len(server_actions)} endpoints.")

if __name__ == "__main__":
    generate_endpoints_md()
