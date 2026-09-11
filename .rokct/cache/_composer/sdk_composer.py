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
import sys
import subprocess
import json
import shutil
import hashlib

PROJECT_ROOT = os.getcwd()

# Explicit, loud opt-out for running SDK installers cloned from a mutable ref
# without a sha256 pin - mirrors the engine's STARTUPOS_ALLOW_UNPINNED gate.
ALLOW_UNPINNED_ENV = "ROKCT_ALLOW_UNPINNED_SDKS"


def _is_commit_sha(ref):
    return (
        bool(ref)
        and len(ref) == 40
        and all(c in "0123456789abcdef" for c in ref.lower())
    )


def enforce_sdk_pin(sdk_name, sdk_config, target_dir, ref):
    """A cloned SDK's install.py is later executed by run_installer(), so
    content fetched over the network must be verifiable before it can run.
    Accepts the SDK when any of these hold:
      - the composer.json entry carries "sha256" (SHA-256 of the SDK's
        install.py) and it matches the extracted file;
      - the clone ref is a full 40-hex commit SHA (immutable content);
      - ROKCT_ALLOW_UNPINNED_SDKS=1 explicitly (and loudly) opts out.
    Anything else aborts the compose before any installer can execute."""
    expected = ""
    if isinstance(sdk_config, dict):
        expected = (sdk_config.get("sha256") or "").lower()
    installer = os.path.join(target_dir, "install.py")
    if expected:
        if not os.path.exists(installer):
            print(
                f"[!] {sdk_name}: composer.json pins install.py to sha256 {expected}, "
                f"but the cloned SDK has no install.py. Refusing to continue.",
                file=sys.stderr,
            )
            sys.exit(1)
        with open(installer, "rb") as f:
            data = f.read()
        actual = hashlib.sha256(data).hexdigest()
        if actual != expected:
            # composer.json pins are computed from the committed (LF) blob.
            # Git on windows-latest ships core.autocrlf=true, so the clone
            # materializes install.py with CRLF endings - byte-identical
            # content, different on-disk sha256. Re-hash with CRLF->LF
            # normalization before rejecting, so the same pin verifies on
            # every OS; genuinely different content still fails both hashes.
            normalized = hashlib.sha256(data.replace(b"\r\n", b"\n")).hexdigest()
            if normalized != expected:
                print(
                    f"[!] Integrity check failed for {sdk_name} install.py (ref {ref}):",
                    file=sys.stderr,
                )
                print(f"[!]   expected sha256 {expected}", file=sys.stderr)
                print(f"[!]   actual   sha256 {actual}", file=sys.stderr)
                print(
                    f"[!]   actual   sha256 {normalized} (after CRLF->LF normalization)",
                    file=sys.stderr,
                )
                print(
                    "[!] Refusing to execute unverified SDK installer.", file=sys.stderr
                )
                sys.exit(1)
            print(
                f"[+] Verified {sdk_name} install.py against pinned sha256 "
                "(after CRLF->LF normalization of a CRLF checkout)."
            )
            return
        print(f"[+] Verified {sdk_name} install.py against pinned sha256.")
        return
    if _is_commit_sha(ref):
        return
    if os.environ.get(ALLOW_UNPINNED_ENV, "").lower() in ("1", "true", "yes"):
        print(
            f"[!] WARNING: {sdk_name} was cloned from mutable ref '{ref}' without a sha256 pin; "
            f"proceeding because {ALLOW_UNPINNED_ENV} is set. Its install.py runs UNVERIFIED."
        )
        return
    print(
        f"[!] {sdk_name} was cloned from mutable ref '{ref}' and its install.py is unpinned.",
        file=sys.stderr,
    )
    print(
        '[!] Pin it: set "ref" to a full commit SHA or add "sha256" (of install.py) to its '
        "composer.json entry.",
        file=sys.stderr,
    )
    print(
        f"[!] To run unpinned anyway, set {ALLOW_UNPINNED_ENV}=1 explicitly.",
        file=sys.stderr,
    )
    sys.exit(1)


# SDKs that could not be resolved, cached or installed this run. A composer
# that silently omits an SDK and still exits 0 produces a quietly incomplete
# app; main() exits non-zero when this is non-empty.
FAILED_SDKS = []


def clean_sdk_name(name):
    if name.endswith("_sdk"):
        return name[:-4]
    if name.endswith("_sdks"):
        return name[:-5]
    return name


def extract_repo_name(git_url):
    url_path = git_url.rstrip("/")
    if url_path.endswith(".git"):
        url_path = url_path[:-4]
    return os.path.basename(url_path)


def get_subpath_in_repo(local_path, repo_name):
    normalized = local_path.replace("\\", "/").strip("/")
    parts = normalized.split("/")
    for idx, part in enumerate(parts):
        if part.lower() == repo_name.lower():
            return "/".join(parts[idx + 1 :])
    if len(parts) >= 2:
        return "/".join(parts[-2:])
    return normalized


def authenticated_git_url(git_url):
    """Inject MONOREPO_PAT for github.com HTTPS clones so private SDK repos
    (all SDKs are now private) resolve without ambient git credentials —
    same token/URL shape universal-flutter-build.yml already uses for its
    own private-repo clone path."""
    token = os.environ.get("MONOREPO_PAT")
    if token and git_url.startswith("https://github.com/"):
        return git_url.replace(
            "https://github.com/", f"https://x-access-token:{token}@github.com/"
        )
    return git_url


def resolve_app_type():
    """This host app's own role marker ('manager', 'customer', ...), read
    from .rokct/config/app_type - the same one-line marker file the Flutter
    composer reads (see core/utils/flutter/sdk_composer.py). Mirrors
    sdk_installer_base.py's resolve_app_type() - kept as a local copy here
    rather than imported, since sdk_composer.py and sdk_installer_base.py are
    fetched and used independently by a host's compose wrapper."""
    path = os.path.join(PROJECT_ROOT, ".rokct", "config", "app_type")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            value = f.read().strip().lower()
            return value or None
    return None


def strip_unused_role_folders(target_dir, sdk_name):
    """After vendoring an SDK's source into .rokct/cache/, remove persona
    folders under templates/ that don't apply to this host app - keep the
    common content and this app's own role only. Ported from the Dart
    composer's strip_unused_role_folders() (core/utils/flutter/
    sdk_composer.py), which strips lib/src/<persona>/ siblings of
    lib/src/common/. Next.js SDK trees have no lib/ - their installable
    content root is templates/ (see core/utils/nextjs/README.md's on-disk
    convention) - so the persona convention here is templates/<persona>/
    siblings of the common content: everything under templates/ NOT named
    after a declared persona is common, and a persona's own tree
    (templates/<persona>/app/..., referenced by its flavor block's installs)
    mirrors the host layout the same way templates/app/... does.

    Only strips a folder that is BOTH directly under templates/ AND declared
    as an app_type persona in this SDK's own manifest.json. Safe no-op when
    the app's own role can't be resolved, the manifest is missing or
    unparseable, or this SDK doesn't declare the app's role at all -
    stripping without that confirmation risks deleting something the app
    actually needs.
    """
    current_role = resolve_app_type()
    if not current_role:
        return

    manifest_path = os.path.join(target_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        return
    try:
        with open(manifest_path, "r", encoding="utf-8-sig") as f:
            manifest = json.load(f)
    except Exception:
        return

    declared_personas = list((manifest.get("app_type") or {}).keys())
    if current_role not in declared_personas:
        # This SDK doesn't declare the app's role as a persona - nothing to
        # strip; stripping blind here could remove code the app actually uses.
        return

    templates_dir = os.path.join(target_dir, "templates")
    if not os.path.isdir(templates_dir):
        return

    for persona in declared_personas:
        if persona == current_role:
            continue
        persona_dir = os.path.join(templates_dir, persona)
        if os.path.isdir(persona_dir):
            shutil.rmtree(persona_dir)
            print(
                f"[*] Stripped unused role folder templates/{persona}/ from {sdk_name} (app role: {current_role})"
            )


def _rmtree_force(path):
    def remove_readonly(func, p, excinfo):
        import stat

        os.chmod(p, stat.S_IWRITE)
        func(p)

    shutil.rmtree(path, onerror=remove_readonly)


def clone_ref(git_url, ref, dest_dir):
    """Clone git_url at ref into dest_dir. Branch and tag refs take the exact
    shallow path used before (`git clone -b <ref> --depth 1`); when that
    fails - most notably because ref is a commit SHA, which `git clone -b`
    does not accept - fall back to a full clone followed by
    `git checkout <ref>`. Raises on failure (subprocess.CalledProcessError);
    the caller decides how to fail the build. Same helper as the frappe
    composer's clone_ref() (core/utils/frappe/compose_backend.py) - kept as a
    local copy since each composer is fetched and run standalone."""
    try:
        subprocess.run(
            ["git", "clone", "-b", ref, "--depth", "1", git_url, dest_dir], check=True
        )
        return
    except subprocess.CalledProcessError:
        print(
            f"[*] `git clone -b {ref}` failed (ref is not a branch/tag?). Retrying as full clone + checkout, which also accepts commit SHAs..."
        )
    if os.path.exists(dest_dir):
        _rmtree_force(dest_dir)
    subprocess.run(["git", "clone", git_url, dest_dir], check=True)
    subprocess.run(["git", "-C", dest_dir, "checkout", ref], check=True)


def resolve_and_cache_sdks(sdks):
    """Identical resolution strategy to the Flutter composer: group by git
    remote to avoid re-cloning the same repo for multiple SDKs living in it,
    fall back to a local sibling checkout if present, otherwise shallow-clone.
    This part of the pattern has nothing Dart-specific about it, so it is
    reused as-is rather than redesigned.
    """
    cache_base = os.path.join(PROJECT_ROOT, ".rokct", "cache")
    os.makedirs(cache_base, exist_ok=True)

    git_groups = {}
    local_sdks = []

    for sdk in sdks:
        if not isinstance(sdk, dict):
            local_sdks.append(
                {"name": sdk, "path": f"../SDKs/{clean_sdk_name(sdk)}/nextjs"}
            )
            continue
        source = sdk.get("source", "local")
        if source == "git" and sdk.get("git"):
            git_groups.setdefault(sdk["git"], []).append(sdk)
        else:
            local_sdks.append(sdk)

    for git_url, group_sdks in git_groups.items():
        repo_name = extract_repo_name(git_url)
        temp_repo_dir = os.path.join(cache_base, f"{repo_name}_sdk")
        workspace_parent = os.path.dirname(PROJECT_ROOT)
        local_repo_path = os.path.join(workspace_parent, repo_name)
        is_local_available = os.path.exists(local_repo_path)

        if is_local_available:
            print(
                f"[*] Found local repository for {repo_name} at {local_repo_path}. Using local copy."
            )
            repo_source_dir = local_repo_path
        else:
            ref = group_sdks[0].get("ref", "main")
            print(f"[*] Fetching repository {git_url} into {temp_repo_dir}...")
            try:
                if os.path.exists(temp_repo_dir):
                    _rmtree_force(temp_repo_dir)
                clone_ref(authenticated_git_url(git_url), ref, temp_repo_dir)
                repo_source_dir = temp_repo_dir
            except Exception as e:
                print(f"[!] Failed to clone {git_url}: {e}")
                sys.exit(1)

        for sdk in group_sdks:
            sdk_name = sdk["name"]
            clean_name = clean_sdk_name(sdk_name)
            target_dir = os.path.join(cache_base, clean_name)
            subpath = get_subpath_in_repo(sdk.get("path", ""), repo_name)
            src_dir = os.path.join(repo_source_dir, *subpath.split("/"))

            if os.path.exists(src_dir):
                print(f"[+] Extracting {sdk_name} from {subpath} to {target_dir}...")
                if os.path.exists(target_dir):
                    shutil.rmtree(target_dir)
                shutil.copytree(src_dir, target_dir)
                strip_unused_role_folders(target_dir, sdk_name)
                if not is_local_available:
                    # Content came from a network clone - enforce the pin
                    # before its install.py can ever be executed.
                    enforce_sdk_pin(
                        sdk_name, sdk, target_dir, group_sdks[0].get("ref", "main")
                    )
            else:
                print(
                    f"[!] Error: Path {subpath} not found in repository {repo_source_dir}"
                )
                FAILED_SDKS.append(sdk_name)

        if not is_local_available and os.path.exists(temp_repo_dir):
            _rmtree_force(temp_repo_dir)

    for sdk in local_sdks:
        sdk_name = sdk["name"]
        clean_name = clean_sdk_name(sdk_name)
        target_dir = os.path.join(cache_base, clean_name)
        local_path = sdk.get("path")
        if local_path:
            src_dir = os.path.abspath(os.path.join(PROJECT_ROOT, local_path))
            if os.path.exists(src_dir):
                print(
                    f"[+] Copying local {sdk_name} from {local_path} to {target_dir}..."
                )
                if os.path.exists(target_dir):
                    shutil.rmtree(target_dir)
                shutil.copytree(src_dir, target_dir)
                strip_unused_role_folders(target_dir, sdk_name)
            else:
                print(
                    f"[-] Local path {local_path} for {sdk_name} does not exist. Skipping."
                )
                FAILED_SDKS.append(sdk_name)


def resolve_active_path(sdk_config):
    sdk_name = sdk_config["name"] if isinstance(sdk_config, dict) else sdk_config
    clean_name = clean_sdk_name(sdk_name)
    return os.path.abspath(os.path.join(PROJECT_ROOT, ".rokct", "cache", clean_name))


def run_installer(sdk_config):
    sdk_name = sdk_config["name"] if isinstance(sdk_config, dict) else sdk_config
    sdk_path = resolve_active_path(sdk_config)
    installer_script = os.path.join(sdk_path, "install.py")

    if not os.path.exists(installer_script):
        print(f"[-] No install.py found for SDK: {sdk_name} at {sdk_path}. Skipping.")
        FAILED_SDKS.append(sdk_name)
        return

    print(f"\n[*] Executing Installer for {sdk_name}...")
    try:
        result = subprocess.run(
            [sys.executable, installer_script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        # install_sdk_files() genuinely prints its non-fatal warnings (missing
        # `requires` paths, missing integration markers) — but capture_output
        # meant they were captured into result.stdout and then discarded here
        # on the success path (exit 0 never reaches the except branch below),
        # so they never reached the terminal at all. Surface them.
        if result.stdout.strip():
            print(result.stdout, end="" if result.stdout.endswith("\n") else "\n")
        if result.stderr.strip():
            print(result.stderr, end="" if result.stderr.endswith("\n") else "\n")
        print(f"[+] Installer for {sdk_name} completed successfully.")
    except subprocess.CalledProcessError as e:
        log_dir = os.path.join(PROJECT_ROOT, ".rokct", "agent", "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, f"{sdk_name}_install_error.log")
        with open(log_file, "w", encoding="utf-8") as lf:
            lf.write(f"Command: {' '.join(e.cmd)}\n")
            lf.write(f"Exit Code: {e.returncode}\n")
            lf.write(f"Stdout:\n{e.stdout}\n")
            lf.write(f"Stderr:\n{e.stderr}\n")
        print(
            f"[!] Installer for {sdk_name} failed. Error log written to: .rokct/agent/logs/{sdk_name}_install_error.log"
        )
        sys.exit(1)


def collect_post_install_checklist(sdks_to_install):
    """Re-derive the same non-fatal checks install_sdk_files() already prints
    per-SDK (missing `requires` paths, missing/placeholder-less integration
    targets), aggregated and deduplicated across every SDK installed this
    run. Fix for #1 (surfacing captured stdout again) already makes each
    SDK's own warnings visible; this additionally means a prerequisite
    shared by multiple SDKs (e.g. app/lib/roles.ts) prints once at the very
    end instead of as N near-identical lines scattered between each SDK's
    file-copy output — the thing you'd actually want to act on before
    calling the install done.
    """
    missing_requires = {}
    integration_issues = []
    current_app_type = resolve_app_type()

    for sdk_config in sdks_to_install:
        sdk_name = sdk_config["name"] if isinstance(sdk_config, dict) else sdk_config
        sdk_path = resolve_active_path(sdk_config)
        manifest_path = os.path.join(sdk_path, "manifest.json")
        if not os.path.exists(manifest_path):
            continue
        try:
            with open(manifest_path, "r", encoding="utf-8-sig") as f:
                manifest = json.load(f)
        except Exception:
            continue

        # Same flavor_block merge as install_sdk_files(): role-scoped
        # requires/integrations only count when the persona matches this
        # host's own role marker.
        flavor_block = (
            (manifest.get("app_type") or {}).get(current_app_type, {})
            if current_app_type
            else {}
        )

        for req in list(manifest.get("requires", [])) + list(
            flavor_block.get("requires", [])
        ):
            if not os.path.exists(os.path.join(PROJECT_ROOT, req)):
                missing_requires.setdefault(req, set()).add(sdk_name)

        for integration in list(manifest.get("integrations", [])) + list(
            flavor_block.get("integrations", [])
        ):
            target_rel = integration.get("target")
            placeholder = integration.get("placeholder")
            replacement = integration.get("replacement")
            if not target_rel or not placeholder:
                continue
            target_abs = os.path.join(PROJECT_ROOT, target_rel)
            if not os.path.exists(target_abs):
                integration_issues.append(
                    f"{sdk_name}: integration target missing: {target_rel}"
                )
                continue
            with open(target_abs, "r", encoding="utf-8") as f:
                content = f.read()
            # Same idempotence rule as update_integrations(): a host that
            # already carries the replacement text (committed by hand, or
            # wired in by an earlier run) is satisfied even when the
            # placeholder it would have been anchored to is absent - e.g.
            # a shell whose package.json has no "lint" script but commits
            # auth_sdk's db:migrate / migrate:generate scripts directly.
            if replacement and replacement in content:
                continue
            if placeholder not in content:
                integration_issues.append(
                    f'{sdk_name}: placeholder "{placeholder}" not found in {target_rel} '
                    f"— this SDK's entry was not wired in automatically"
                )

    if not missing_requires and not integration_issues:
        return

    print(
        "\n[*] Post-install checklist — not fatal, but nothing below got wired up automatically:"
    )
    for req, sdks in sorted(missing_requires.items()):
        print(
            f"  [!] Missing host prerequisite: {req} (needed by: {', '.join(sorted(sdks))})"
        )
    for issue in integration_issues:
        print(f"  [!] {issue}")


def run_npm_install():
    """Single npm install pass after all SDK installers have merged their
    dependencies into package.json — mirrors the Flutter composer running
    `flutter pub get` once at the end rather than per-SDK. Unlike Flutter,
    there is no codegen/build_runner-equivalent step: Next.js SDK templates
    are plain .ts/.tsx source, nothing to generate.
    """
    if not os.path.exists(os.path.join(PROJECT_ROOT, "package.json")):
        return
    # Escape hatch for hosts whose package manager is not npm (e.g. a pnpm
    # CI): skip the install step entirely and leave dependency installation
    # to the host's own tooling. Default (unset) behavior is unchanged.
    if os.environ.get("ROKCT_SKIP_NPM_INSTALL", "").lower() in ("1", "true", "yes"):
        print(
            "\n[*] ROKCT_SKIP_NPM_INSTALL is set: skipping npm install "
            "(run your package manager's install yourself)."
        )
        return
    print("\n[*] Running npm install...")
    # Pass the command as a STRING with shell=True rather than a list. A list
    # argv with shell=True silently no-ops the arguments on POSIX
    # (subprocess runs `sh -c "npm" install ...`, so `install` is dropped and
    # npm just prints its usage banner), meaning dependencies were never
    # installed while the composer reported success. A string command runs
    # correctly on both POSIX (`sh -c "npm install"`) and Windows
    # (`cmd /c "npm install"`, which resolves the npm.cmd shim). The command
    # is a fixed literal with no interpolation, so there is nothing to inject.
    result = subprocess.run("npm install", cwd=PROJECT_ROOT, shell=True)
    if result.returncode == 0:
        print("[+] npm install completed successfully.")
    else:
        # Hard-fail loudly (consistent with the clone-failure direction of
        # #167): a swallowed npm failure produced an app whose dependencies
        # were missing but whose compose exited 0.
        print(
            f"[!] npm install failed (exit {result.returncode}). Aborting composition."
        )
        sys.exit(1)


# ---------------------------------------------------------------------------
# Composer template registry — shared with the frappe composer.
#
# WHAT to compose is resolved through the frappe composer core
# (core/utils/frappe/compose_backend.py), which owns the protocol's single
# composer-template registry at core/utils/frappe/composer/. A shell repo can
# stay THIN: instead of committing a hand-maintained composer.json it commits
# only the one-line .rokct/config/app_type file naming a registry template
# (e.g. "rokctapp"); the template is materialized as composer.json before the
# SDK list is read. One template per product carries BOTH stacks' inputs: its
# "modules" array is read by the frappe engine and its "sdks" array by this
# composer — each stack reads only its own key, so a single product template
# drives the backend shell and the Next.js shell alike.
#
# The same one-line value doubles as the shell's role/persona marker (see
# resolve_app_type above) — the shared-namespace convention the flutter side
# established (supacharge/manager/driver are both personas and template
# names). A marker that names no registry template is a plain role marker and
# composing proceeds from the committed composer.json exactly as before;
# absence of the file is byte-identical legacy behavior.
# ---------------------------------------------------------------------------

PROTOCOL_REPO_NAME = "The-Rokct-Protocol"
PROTOCOL_DIR_ENV = "ROKCT_PROTOCOL_DIR"
FRAPPE_COMPOSE_BACKEND_REL = "core/utils/frappe/compose_backend.py"

# Local copy of compose_backend.SHELL_OWNED_COMPOSER_KEYS / SITE_DATA_MODES
# for the standalone fallback below, which by definition runs with no
# protocol checkout to import the shared core from. The canonical definition
# and its rationale live in core/utils/frappe/compose_backend.py; a test pins
# these equal to it. base_sdk >= 1.35.0 reads "data" (local | backend |
# hybrid) from the shell's own composer.json, so a materialized template must
# not drop the shell's declaration.
SHELL_OWNED_COMPOSER_KEYS = ("data", "_data_comment")
SITE_DATA_MODES = ("local", "backend", "hybrid")


def _carry_shell_owned_keys_standalone(template_text, composer_path):
    """Standalone twin of compose_backend.carry_shell_owned_keys(): the
    template text with the shell's SHELL_OWNED_COMPOSER_KEYS carried over
    from the committed composer.json (byte-identical when there is nothing
    to carry). Raises ValueError on an invalid "data" mode."""
    template = json.loads(template_text)
    committed = None
    if os.path.isfile(composer_path):
        try:
            with open(composer_path, "r", encoding="utf-8") as fh:
                committed = json.load(fh)
        except Exception as e:
            print(
                f"[!] WARNING: committed composer.json is not valid JSON ({e}); "
                f"none of its {', '.join(SHELL_OWNED_COMPOSER_KEYS)} keys can be "
                f"carried over."
            )
    if not isinstance(committed, dict):
        committed = {}
    carried = {k: committed[k] for k in SHELL_OWNED_COMPOSER_KEYS if k in committed}
    if isinstance(template, dict):
        mode_at = (
            ("composer.json", carried["data"])
            if "data" in carried
            else ("registry template", template.get("data"))
            if "data" in template
            else None
        )
        if mode_at is not None:
            where, value = mode_at
            if not isinstance(value, str) or value not in SITE_DATA_MODES:
                allowed = ", ".join(f'"{m}"' for m in SITE_DATA_MODES)
                raise ValueError(
                    f'{where}: "data" must be one of {allowed}, got {json.dumps(value)}'
                )
    if not carried or not isinstance(template, dict):
        return template_text
    merged = {}
    placed = False
    for key, value in template.items():
        if not placed and key not in carried and isinstance(value, (list, dict)):
            merged.update(carried)
            placed = True
        merged[key] = carried.get(key, value)  # the shell's value wins, in place
    if not placed:
        merged.update(carried)
    return json.dumps(merged, indent=2, ensure_ascii=False) + "\n"


COMPOSER_TEMPLATES_REL = "core/utils/frappe/composer"
COMPOSER_TEMPLATES_RAW_BASE = (
    "https://raw.githubusercontent.com/RokctAI/The-Rokct-Protocol/main/"
    + COMPOSER_TEMPLATES_REL
)


def _locate_composer_core():
    """Find the shared composer core (the frappe composer) on disk: an
    explicitly named protocol checkout, the checkout this file itself sits in
    (protocol clone / test runs), or the standard sibling-checkout workspace
    layout that resolve_and_cache_sdks() already relies on for SDK repos."""
    candidates = []
    protocol_dir = os.environ.get(PROTOCOL_DIR_ENV)
    if protocol_dir:
        candidates.append(
            os.path.join(protocol_dir, *FRAPPE_COMPOSE_BACKEND_REL.split("/"))
        )
    here = os.path.dirname(os.path.abspath(__file__))
    candidates.append(
        os.path.abspath(os.path.join(here, "..", "frappe", "compose_backend.py"))
    )
    candidates.append(
        os.path.join(
            os.path.dirname(os.path.abspath(PROJECT_ROOT)),
            PROTOCOL_REPO_NAME,
            *FRAPPE_COMPOSE_BACKEND_REL.split("/"),
        )
    )
    for c in candidates:
        if os.path.isfile(c):
            return c
    return None


def load_composer_core():
    """Import the shared composer core from a local protocol checkout.

    Returns the loaded compose_backend module, or None when no checkout is
    available (this composer was fetched standalone into a shell with no
    protocol clone anywhere). Never fetches code over the network — only
    already-present, locally checked-out protocol code is ever imported."""
    path = _locate_composer_core()
    if not path:
        return None
    import importlib.util

    spec = importlib.util.spec_from_file_location("rokct_composer_core", path)
    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
    except Exception as e:
        print(f"[!] Failed to load shared composer core from {path}: {e}")
        return None
    return module


def _fetch_template_standalone(name):
    """Data-only registry fallback for standalone runs with no protocol
    checkout: fetch composer/<name>.json from the protocol repo, mirroring
    the flutter CI's curl of its composer/<app_type>.json. Only template
    DATA is fetched — no code is ever downloaded or executed. Returns the
    template text or None (a 404 means the marker is a plain role name)."""
    import urllib.error
    import urllib.request

    url = f"{COMPOSER_TEMPLATES_RAW_BASE}/{name}.json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "rokct-composer"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status == 200:
                return resp.read().decode("utf-8")
    except Exception as e:
        if isinstance(e, urllib.error.HTTPError) and e.code == 404:
            return None
        print(
            f"[!] WARNING: composer template lookup for '{name}' failed ({url}): {e}. "
            f"Falling back to the committed composer.json."
        )
    return None


def resolve_composer_config():
    """Materialize composer.json from the registry template named by
    .rokct/config/app_type, when it names one. Delegates to the shared
    composer core (core/utils/frappe/compose_backend.py) whenever a protocol
    checkout is locatable, so both stacks resolve templates with one
    implementation; otherwise falls back to the same data-only fetch the
    flutter CI uses. Returns True when composer.json was (re)written. Either
    way the shell's own top-level keys (SHELL_OWNED_COMPOSER_KEYS - the
    "data" mode base_sdk reads, and its comment) survive the rewrite."""
    core = load_composer_core()
    if core is not None:
        return core.resolve_composer_config(PROJECT_ROOT)

    name = resolve_app_type()
    if not name or not all(c.islower() or c.isdigit() or c in "_-" for c in name):
        return False
    text = _fetch_template_standalone(name)
    if text is None:
        return False
    try:
        json.loads(text)
    except Exception as e:
        print(
            f"[!] WARNING: composer template '{name}' is not valid JSON: {e}. "
            f"Falling back to the committed composer.json."
        )
        return False
    composer_path = os.path.join(PROJECT_ROOT, "composer.json")
    try:
        text = _carry_shell_owned_keys_standalone(text, composer_path)
    except ValueError as e:
        print(
            f"[-] Composition aborted: {e}. The shell's data mode is its own "
            f"declaration (base_sdk lib/site-data reads it from composer.json); "
            f"fix the value before composing."
        )
        sys.exit(1)
    action = "overwritten" if os.path.exists(composer_path) else "written"
    with open(composer_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print(f"[+] composer.json {action} from registry template '{name}'")
    return True


# ---------------------------------------------------------------------------
# Home SDK - parity with the flutter composer (core/utils/flutter/
# sdk_composer.py order_sdks_for_install / sdk_installer_base.py
# resolve_home_sdk). The composer profile flags exactly one sdks[] entry
# "home_sdk": true; that SDK owns the shell's home (app/page.tsx and the
# single-answer landing registries it registers into). Before the flag the
# Next.js side resolved "home" by list order alone, silently.
# ---------------------------------------------------------------------------

# Kernel entries the home SDK never moves ahead of: base_sdk installs the
# landing registries (components/custom/landing/*.ts) the home SDK's
# integrations anchor to, and telemetry_sdk is the hard-invariant seam owner
# every profile lists first. The installer's ownership rule makes the home
# win whatever the order; this keeps the install pass predictable and its
# `requires` checks quiet.
KERNEL_SDKS = ("telemetry_sdk", "base_sdk")

# Local copy of sdk_installer_base.resolve_home_sdk()'s composer-flag rule -
# kept here rather than imported, since the composer and installer base are
# fetched and used independently by a host's compose wrapper.
INSTALL_STATE_FILE = os.path.join(PROJECT_ROOT, ".rokct", "cache", "install_state.json")
LEGACY_INSTALL_STATE_FILE = os.path.join(PROJECT_ROOT, ".rokct", "install_state.json")


def resolve_home_sdk(sdks):
    """Name of the enabled sdks[] entry flagged "home_sdk": true, or None
    when none is (a profile without the flag composes as before). More
    than one flagged entry is an error - exactly the ambiguity the flag
    exists to settle - raised as ValueError naming the entries."""
    flagged = [
        s["name"]
        for s in sdks
        if isinstance(s, dict)
        and s.get("name")
        and s.get("enabled", True)
        and s.get("home_sdk") is True
    ]
    if len(flagged) > 1:
        raise ValueError(
            f"composer.json flags {len(flagged)} SDKs as home_sdk ({', '.join(flagged)}); "
            f'exactly one sdks[] entry may carry "home_sdk": true. Unflag all but the '
            f"intended home SDK."
        )
    if not flagged:
        print(
            '[i] no home SDK: no sdks[] entry carries "home_sdk": true; installing in '
            "composer.json order (last writer wins home files, single-answer landing "
            "registries append in order with a warning on a second contributor)."
        )
        return None
    return flagged[0]


def order_sdks_for_install(sdks):
    """Return the enabled sdks[] entries in the order they are cached and
    installed: the entry flagged "home_sdk": true moved to the front,
    directly after any KERNEL_SDKS entries listed ahead of it (telemetry
    first, then base_sdk whose registries the home's integrations need);
    everything else in composer.json order.

    Ported from the flutter composer's order_sdks_for_install(). The
    install-side ownership rule (sdk_installer_base.install_sdk_files: a
    non-home SDK never writes a home-owned path, the home SDK takes over an
    unmodified copy installed earlier) already makes the home win whatever
    the order - this only makes the cache and install passes predictable
    (the home SDK is extracted, installed and logged in the same place on
    every profile) without moving it ahead of the kernel it requires."""
    ordered = list(sdks)
    home_idx = next(
        (
            idx
            for idx, entry in enumerate(ordered)
            if isinstance(entry, dict) and entry.get("home_sdk") is True
        ),
        None,
    )
    if home_idx is None:
        return ordered
    insert_at = 0
    for idx in range(home_idx):
        entry = ordered[idx]
        if isinstance(entry, dict) and entry.get("name") in KERNEL_SDKS:
            insert_at = idx + 1
    if insert_at != home_idx:
        ordered.insert(insert_at, ordered.pop(home_idx))
    return ordered


def record_home_sdk(home_sdk_name):
    """Record the resolved home SDK ("home_sdk": name, or null) at the top
    level of .rokct/cache/install_state.json - the one state file the
    Next.js compose path writes (there is no separate lock); the installers
    that run next round-trip the file, so the field survives them. Performs
    the same legacy-location migration sdk_installer_base.load_state() does,
    so writing first never strands an older .rokct/install_state.json."""
    os.makedirs(os.path.dirname(INSTALL_STATE_FILE), exist_ok=True)
    if os.path.exists(LEGACY_INSTALL_STATE_FILE) and not os.path.exists(
        INSTALL_STATE_FILE
    ):
        shutil.move(LEGACY_INSTALL_STATE_FILE, INSTALL_STATE_FILE)
    state = {"packages": {}}
    if os.path.exists(INSTALL_STATE_FILE):
        try:
            with open(INSTALL_STATE_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)
            if isinstance(loaded, dict):
                state = loaded
        except Exception as e:
            print(
                f"[!] WARNING: unreadable {INSTALL_STATE_FILE} ({e}); starting a fresh "
                "install state."
            )
    state.setdefault("packages", {})
    state["home_sdk"] = home_sdk_name
    with open(INSTALL_STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def main():
    # Template-registry resolution first: a thin shell that names a registry
    # template in .rokct/config/app_type gets its composer.json materialized
    # from the protocol's canonical template before the SDK list is read.
    # No-op (and byte-identical legacy behavior) when the marker is absent or
    # is a plain role name.
    resolve_composer_config()

    composer_path = os.path.join(PROJECT_ROOT, "composer.json")
    sdks_to_install = []

    if os.path.exists(composer_path):
        try:
            with open(composer_path, "r", encoding="utf-8") as f:
                config = json.load(f)
            sdks_to_install = [
                s
                for s in config.get("sdks", [])
                if isinstance(s, dict) and s.get("enabled", True)
            ]
            print(f"[*] Reading active SDK list from composer.json: {sdks_to_install}")
        except Exception as e:
            print(f"[!] Error reading composer.json: {e}.")
            sys.exit(1)

    # The home SDK is a property of the whole profile, not of the subset a
    # `sdk_composer.py <name>...` invocation installs: the installers read
    # the same flag from composer.json to protect the home's files even
    # when only another SDK is being (re)installed.
    try:
        home_sdk_name = resolve_home_sdk(sdks_to_install)
    except ValueError as e:
        print(f"[!] {e}", file=sys.stderr)
        sys.exit(1)
    if home_sdk_name is not None:
        print(f"[i] home SDK: {home_sdk_name}")

    if len(sys.argv) >= 2:
        requested_names = sys.argv[1:]
        sdks_to_install = [s for s in sdks_to_install if s["name"] in requested_names]

    if not sdks_to_install:
        print("[-] No SDKs found to install.")
        sys.exit(1)

    sdks_to_install = order_sdks_for_install(sdks_to_install)
    record_home_sdk(home_sdk_name)

    resolve_and_cache_sdks(sdks_to_install)

    for sdk in sdks_to_install:
        run_installer(sdk)

    run_npm_install()
    collect_post_install_checklist(sdks_to_install)

    if FAILED_SDKS:
        failed = ", ".join(sorted(set(FAILED_SDKS)))
        print(
            f"\n[!] Compose FAILED: the following SDK(s) were not installed: {failed}"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
