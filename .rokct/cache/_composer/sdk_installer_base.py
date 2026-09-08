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
import json
import shutil
import hashlib

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# install_state.json lives inside .rokct/cache/ (an end_protocol.py
# keep-whitelisted directory) so recorded install hashes survive session
# cleanup and travel with the cached content they describe. The legacy root
# location (.rokct/install_state.json) is migrated on first read.
STATE_FILE = os.path.join(PROJECT_ROOT, ".rokct", "cache", "install_state.json")
LEGACY_STATE_FILE = os.path.join(PROJECT_ROOT, ".rokct", "install_state.json")


def migrate_legacy_state():
    if os.path.exists(LEGACY_STATE_FILE) and not os.path.exists(STATE_FILE):
        try:
            os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
            shutil.move(LEGACY_STATE_FILE, STATE_FILE)
            print(
                "[*] Migrated .rokct/install_state.json -> .rokct/cache/install_state.json"
            )
        except Exception as e:
            print(f"[!] Could not migrate legacy install_state.json: {e}")


PACKAGE_JSON_FILE = os.path.join(PROJECT_ROOT, "package.json")
TSCONFIG_FILE = os.path.join(PROJECT_ROOT, "tsconfig.json")

TEXT_EXTENSIONS = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css")
CODE_EXTENSIONS = (".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs")


def file_hash(path):
    if not os.path.exists(path):
        return None
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()


def resolve_app_type():
    """Reads this host app's own role marker (e.g. 'manager', 'customer',
    'pos') from .rokct/config/app_type - a plain one-line text file checked
    into each host app's own repo. Mirrors
    core/utils/flutter/sdk_installer_base.py's resolve_app_type() - kept as a
    local copy here rather than imported, since each stack's installer base
    is fetched and used independently.
    Returns None if the file doesn't exist - manifests with no matching
    app_type block behave exactly as before (nothing filtered)."""
    path = os.path.join(PROJECT_ROOT, ".rokct", "config", "app_type")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            value = f.read().strip().lower()
            return value or None
    return None


def load_state():
    migrate_legacy_state()
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"packages": {}}


def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def check_app_alias():
    """Next.js SDK templates import via the '@/*' -> './*' tsconfig path alias
    (the create-next-app default), not a package name placeholder like Dart's
    ${package} — a file copied to app/handson/all/lending/page.tsx importing
    '@/app/lib/roles' resolves correctly in any host that has this alias,
    with zero string rewriting needed. Warn (don't fail) if it's missing,
    since the host may use a differently-configured but equivalent alias.
    """
    if not os.path.exists(TSCONFIG_FILE):
        print(
            "[!] WARNING: no tsconfig.json found at project root. SDK templates assume the "
            "'@/*' -> './*' path alias (create-next-app default); imports may not resolve."
        )
        return
    try:
        with open(TSCONFIG_FILE, "r", encoding="utf-8-sig") as f:
            raw = f.read()
        # tsconfig.json commonly has comments; do a light substring check rather than a strict
        # JSON parse so this doesn't false-fail on a valid-but-commented file.
        if '"@/*"' not in raw:
            print(
                "[!] WARNING: tsconfig.json does not declare the '@/*' path alias. "
                "SDK templates use '@/app/...' imports and will not resolve without it."
            )
    except Exception:
        pass


def check_requires(sdk_name, requires):
    """Some SDKs' copied files import host-app paths the SDK doesn't itself
    provide (a shared UI kit component, another domain's server action, a
    host-wide lib helper) - e.g. Polaris lending's application/new page
    importing an accounting SDK's sales_order action and lib/roles.ts's
    verifyLendingRole. These aren't installable file-copies (there's no
    sibling SDK to draw them from yet in most cases), just a declared
    prerequisite the host must already satisfy. Warn per missing path rather
    than failing the install - the file still gets copied either way, it
    just may not compile until the prerequisite exists.
    """
    missing = [r for r in requires if not os.path.exists(os.path.join(PROJECT_ROOT, r))]
    if missing:
        print(
            f"  [!] WARNING: {sdk_name} expects these host-app paths to already exist "
            f"(not provided by this SDK): {', '.join(missing)}"
        )


def resolve_sdk_path(sdk_name):
    # 1. Local monorepo dev convention: sdk/<name> relative to project root
    #    (mirrors the Dart installer's equivalent fallback tier).
    local_path = os.path.join(PROJECT_ROOT, "sdk", sdk_name)
    if os.path.exists(local_path):
        return local_path

    # 2. .rokct/cache/<clean_name>, populated by sdk_composer.py's git-based
    #    compose flow. Strip a trailing "_sdk"/"_sdks" suffix to mirror the
    #    cache folder naming sdk_composer.py uses.
    clean_name = sdk_name
    if clean_name.endswith("_sdks"):
        clean_name = clean_name[:-5]
    elif clean_name.endswith("_sdk"):
        clean_name = clean_name[:-4]
    cache_path = os.path.join(PROJECT_ROOT, ".rokct", "cache", clean_name)
    if os.path.exists(cache_path):
        return cache_path

    return None


def install_sdk_files(sdk_name):
    """Install a Next.js SDK's templates into the host app.

    Unlike the Dart installer, there is no route-registration or DI-wiring
    step: Next.js App Router is filesystem-based routing, so placing a page
    file under app/<path>/page.tsx *is* the route registration. The only
    non-file-copy steps are package.json dependency merging (installs
    section) and marker-based text injection for cross-cutting host files
    such as a shared nav/sidebar (integrations section).
    """
    sdk_path = resolve_sdk_path(sdk_name)
    if not sdk_path:
        print(f"[-] Could not resolve path for SDK: {sdk_name}")
        return False

    manifest_path = os.path.join(sdk_path, "manifest.json")
    if not os.path.exists(manifest_path):
        print(f"[-] No manifest found for {sdk_name}")
        return False

    with open(manifest_path, "r", encoding="utf-8-sig") as f:
        manifest = json.load(f)

    # Everything at the manifest's top level always installs regardless of
    # role ("common gets installed regardless"). A manifest can additionally
    # declare an "app_type" block keyed by persona (manager/customer/pos/...)
    # whose own installs/dependencies/devDependencies/integrations/requires
    # get merged in ONLY when they match this host app's own
    # .rokct/config/app_type marker - the same flavor_block idea as the Dart
    # installer (core/utils/flutter/sdk_installer_base.py), applied to the
    # Next.js manifest schema.
    current_app_type = resolve_app_type()
    flavor_block = (
        (manifest.get("app_type") or {}).get(current_app_type, {})
        if current_app_type
        else {}
    )

    version = manifest.get("version", "1.0.0")
    installs = manifest.get("installs", []) + flavor_block.get("installs", [])

    check_app_alias()
    check_requires(
        sdk_name, manifest.get("requires", []) + flavor_block.get("requires", [])
    )

    state = load_state()
    package_state = state["packages"].get(sdk_name, {"version": "0.0.0", "files": {}})
    package_state["version"] = version

    print(f"\n[*] Installing SDK: {sdk_name} (v{version})")

    # 1. Sync files
    for entry in installs:
        from_rel = entry.get("from")
        to_rel = entry.get("to")
        if not from_rel or not to_rel:
            continue

        src_path = os.path.join(sdk_path, from_rel)
        dest_path = os.path.join(PROJECT_ROOT, to_rel)

        if not os.path.exists(src_path):
            print(f"  [-] Template source not found: {from_rel}")
            continue

        files_to_sync = []
        if os.path.isdir(src_path):
            for root, _, filenames in os.walk(src_path):
                for filename in filenames:
                    abs_src = os.path.join(root, filename)
                    rel_to_src = os.path.relpath(abs_src, src_path)
                    abs_dest = os.path.join(dest_path, rel_to_src)
                    rel_dest = os.path.relpath(abs_dest, PROJECT_ROOT).replace(
                        "\\", "/"
                    )
                    files_to_sync.append((abs_src, abs_dest, rel_dest))
        else:
            rel_dest = to_rel.replace("\\", "/")
            files_to_sync.append((src_path, dest_path, rel_dest))

        for file_src, file_dest, rel_dest in files_to_sync:
            # Check if file already exists in host and was hand-modified since last install
            if os.path.exists(file_dest):
                current_dest_hash = file_hash(file_dest)
                last_known_hash = package_state.get("files", {}).get(rel_dest)
                if last_known_hash and current_dest_hash != last_known_hash:
                    print(
                        f"  [!] WARNING: {rel_dest} has been modified by a developer. "
                        f"Skipping overwrite to prevent data loss. Please merge changes manually."
                    )
                    continue

            os.makedirs(os.path.dirname(file_dest), exist_ok=True)

            is_text = file_dest.endswith(TEXT_EXTENSIONS)
            if is_text:
                with open(file_src, "r", encoding="utf-8", errors="ignore") as fs:
                    content = fs.read()

                if file_dest.endswith(CODE_EXTENSIONS):
                    banner = (
                        "// ==========================================\n"
                        "// [GENERATED TEMPLATE FILE]\n"
                        f"// This file was installed from: {sdk_name}\n"
                        "// Feel free to modify and customize this code.\n"
                        "// Note: If you edit this file, the SDK installer will detect your changes\n"
                        "// and automatically skip overwriting it during future upgrades.\n"
                        "// ==========================================\n\n"
                    )
                    lines = content.splitlines(keepends=True)
                    insert_idx = 0
                    for idx, line in enumerate(lines):
                        trimmed = line.strip()
                        if (
                            trimmed == '"use server";'
                            or trimmed == "'use server';"
                            or trimmed == '"use client";'
                            or trimmed == "'use client';"
                        ):
                            # Directive prologues must stay the first statement in the file.
                            insert_idx = idx + 1
                            break
                        if trimmed.startswith("import ") or trimmed.startswith(
                            "export "
                        ):
                            insert_idx = idx
                            break
                    lines.insert(insert_idx, banner)
                    content = "".join(lines)

                with open(file_dest, "w", encoding="utf-8") as fd:
                    fd.write(content)
            else:
                shutil.copy2(file_src, file_dest)

            package_state.setdefault("files", {})[rel_dest] = file_hash(file_dest)
            print(f"  [+] COPY: {rel_dest}")

    # 2. Track dependencies/integrations for this package, then apply across
    # all installed packages. The flavor block's entries merge onto the top
    # level's - for the dependency maps the flavor's version range wins on a
    # same-name key (matching the Dart installer's flavor-wins precedence);
    # integrations concatenate like installs.
    deps_config = dict(manifest.get("dependencies") or {})
    deps_config.update(flavor_block.get("dependencies") or {})
    if deps_config:
        package_state["dependencies"] = deps_config
    dev_deps_config = dict(manifest.get("devDependencies") or {})
    dev_deps_config.update(flavor_block.get("devDependencies") or {})
    if dev_deps_config:
        package_state["devDependencies"] = dev_deps_config

    integrations_config = list(manifest.get("integrations") or []) + list(
        flavor_block.get("integrations") or []
    )
    if integrations_config:
        package_state["integrations"] = integrations_config

    state["packages"][sdk_name] = package_state
    save_state(state)

    update_package_json_dependencies()
    update_integrations()
    return True


def update_package_json_dependencies():
    """Merge each installed SDK's declared npm dependencies into the host's
    package.json. Additive and non-destructive: an existing pinned version in
    the host always wins (the host app owns its own dependency resolution;
    the SDK only asserts "this package needs to exist somewhere in the tree
    at roughly this version"). Does not run `npm install` — that is
    sdk_composer.py's job, once, after all SDKs have been installed.
    """
    if not os.path.exists(PACKAGE_JSON_FILE):
        print(f"[-] package.json not found: {PACKAGE_JSON_FILE}")
        return

    state = load_state()
    with open(PACKAGE_JSON_FILE, "r", encoding="utf-8-sig") as f:
        pkg = json.load(f)

    pkg.setdefault("dependencies", {})
    pkg.setdefault("devDependencies", {})

    added = []
    for pkg_name, pkg_data in state.get("packages", {}).items():
        for dep_name, dep_version in pkg_data.get("dependencies", {}).items():
            if dep_name not in pkg["dependencies"]:
                pkg["dependencies"][dep_name] = dep_version
                added.append(f"{dep_name}@{dep_version}")
        for dep_name, dep_version in pkg_data.get("devDependencies", {}).items():
            if (
                dep_name not in pkg["devDependencies"]
                and dep_name not in pkg["dependencies"]
            ):
                pkg["devDependencies"][dep_name] = dep_version
                added.append(f"{dep_name}@{dep_version} (dev)")

    if not added:
        return

    with open(PACKAGE_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(pkg, f, indent=2)
        f.write("\n")
    print(f"[*] Added to package.json: {', '.join(added)} (run npm install to fetch)")


def update_integrations():
    """Marker-based text injection into shared host files (e.g. a nav/sidebar
    array), mirroring the Dart installer's update_layout_integrations().
    Idempotent: skips if the replacement text is already present.

    Grouped by target file (not iterated package-by-package) so that when
    two SDKs declare an integration against the *same* marker (e.g. two
    sidebar-nav entries), each new entry is anchored after the previous
    one's already-inserted line instead of always re-inserting right after
    the placeholder — the naive per-package version of this stacked LIFO:
    the SDK installed second ended up placed *above* the one installed
    first, silently reversing nav order across separate install runs.
    """
    state = load_state()
    by_target = {}
    for pkg_name, pkg_data in state.get("packages", {}).items():
        for integration in pkg_data.get("integrations", []):
            target_rel = integration.get("target")
            placeholder = integration.get("placeholder")
            replacement = integration.get("replacement")
            if not target_rel or not placeholder or not replacement:
                continue
            by_target.setdefault(target_rel, []).append(
                (pkg_name, placeholder, replacement)
            )

    for target_rel, entries in by_target.items():
        target_abs = os.path.join(PROJECT_ROOT, target_rel)
        if not os.path.exists(target_abs):
            for pkg_name, _, _ in entries:
                print(
                    f"  [-] Integration target not found: {target_rel} (from {pkg_name})"
                )
            continue

        with open(target_abs, "r", encoding="utf-8") as f:
            content = f.read()
        original = content

        # Anchor starts at each entry's own placeholder; once an entry is
        # applied (this run or a previous one), later entries for the same
        # target insert after *it* instead, preserving declaration order.
        anchor = None
        for pkg_name, placeholder, replacement in entries:
            if replacement in content:
                anchor = replacement
                continue
            insert_after = anchor or placeholder
            if insert_after not in content:
                print(
                    f"  [!] WARNING: placeholder not found in {target_rel}, skipping integration for {pkg_name}"
                )
                continue
            content = content.replace(insert_after, f"{insert_after}\n{replacement}", 1)
            anchor = replacement

        if content != original:
            with open(target_abs, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[*] Applied integration in: {target_rel}")
