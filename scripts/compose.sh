#!/usr/bin/env bash
# Compose this Next.js shell from its committed SDK cache.
#
# Ray's standing ruling for Next.js shells (2026-09-03): the shell commits
# its SDK cache under .rokct/cache/ and composes from that committed cache
# at build time; the composed output the installers write into the host
# stays gitignored. This is the Dart app shells' model (paas_manager,
# paas_driver both track .rokct/cache/) applied to a Next.js shell: Vercel
# builds from a commit, so everything the build composes from has to be in
# the commit - no token, no clone, no second place holding a secret.
#
#   bash scripts/compose.sh            offline mode (default) - what Vercel
#                                      runs (vercel.json buildCommand), what
#                                      CI runs, what a developer runs. Composes
#                                      ONLY from the committed .rokct/cache/.
#                                      No git, no network, no token. Every SDK
#                                      listed in .rokct/lock.json must be
#                                      present in the cache and match its pins,
#                                      or this exits non-zero before running
#                                      any installer.
#
#   bash scripts/compose.sh refresh    a maintainer, or Actions with a
#                                      MONOREPO_PAT. Re-fetches the
#                                      protocol composer and every SDK named by
#                                      the registry template
#                                      (.rokct/config/app_type ->
#                                      core/utils/frappe/composer/<app_type>.json),
#                                      replaces .rokct/cache/<sdk>/ wholesale,
#                                      rewrites .rokct/lock.json (every SDK's
#                                      pins and its home_sdk flag), the
#                                      composed-output block in .gitignore and
#                                      (only when a dependency changed)
#                                      pnpm-lock.yaml, and stages the cache.
#                                      Commit the result to main; that commit
#                                      is what triggers the Vercel build.
#
# .rokct/cache/ is listed in the root .gitignore and committed anyway with
# `git add -f` (the refresh does this for you). The ignore rule exists only to
# keep the fleet linter's `prettier --write . --ignore-path .gitignore` pass
# off the vendored templates: reformatting one would change the cache content
# the lock pins, and the next Vercel build would refuse to compose.
#
# The composer itself is The-Rokct-Protocol's core/utils/nextjs/sdk_composer.py
# and sdk_installer_base.py. Refresh vendors both into .rokct/cache/_composer/
# and pins them in lock.json; offline mode verifies those pins before
# importing anything - the same fetch-then-verify rule protocol.lock.json
# applies to every executed file.
#
# Environment (refresh only):
#   MONOREPO_PAT                 token for the private SDK repos; the composer
#                                injects it into clone URLs (see
#                                authenticated_git_url). Never set on Vercel.
#   ROKCT_PROTOCOL_REF           protocol ref to vendor the composer from
#                                (default main)
#   ROKCT_REFRESH_ALLOW_SIBLINGS set to 1 to let the composer read an SDK from
#                                a sibling checkout (../core next to this
#                                repo) instead of cloning. Off by default:
#                                the sibling path skips the composer's sha256
#                                pin gate and would pin lock.json to whatever
#                                that checkout happens to be at.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

MODE="${1:-offline}"
case "$MODE" in
offline | refresh) ;;
*)
  echo "usage: scripts/compose.sh [offline|refresh]" >&2
  exit 2
  ;;
esac

if ! command -v python3 >/dev/null 2>&1; then
  echo "[!] python3 is required to run the SDK installers." >&2
  exit 1
fi

if [ "$MODE" = "refresh" ]; then
  if ! command -v git >/dev/null 2>&1; then
    echo "[!] refresh needs git (clones the protocol and every SDK repo)." >&2
    exit 1
  fi
  if [ -z "${MONOREPO_PAT:-}" ]; then
    echo "[*] MONOREPO_PAT is not set - SDK repo clones will rely on ambient git credentials."
  fi
fi

# The installers import sdk_installer_base from .rokct/; it is a transient
# runtime copy (gitignored), never the vendored one in the cache.
cleanup() {
  rm -f .rokct/sdk_installer_base.py
  rm -rf .rokct/__pycache__ .rokct/cache/_composer/__pycache__
  find .rokct/cache -mindepth 2 -type d -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null || true
}
trap cleanup EXIT

python3 - "$MODE" <<'PY'
import hashlib
import json
import os
import shutil
import subprocess
import sys

MODE = sys.argv[1]
ROOT = os.getcwd()

PROTOCOL_GIT = "https://github.com/RokctAI/The-Rokct-Protocol"
PROTOCOL_FILES = ("sdk_composer.py", "sdk_installer_base.py")
PROTOCOL_UTILS_REL = os.path.join("core", "utils", "nextjs")
PROTOCOL_TEMPLATES_REL = os.path.join("core", "utils", "frappe", "composer")

ROKCT_DIR = os.path.join(ROOT, ".rokct")
CACHE_DIR = os.path.join(ROKCT_DIR, "cache")
VENDOR_DIR = os.path.join(CACHE_DIR, "_composer")
STATE_FILE = os.path.join(CACHE_DIR, "install_state.json")
LOCK_FILE = os.path.join(ROKCT_DIR, "lock.json")
APP_TYPE_FILE = os.path.join(ROKCT_DIR, "config", "app_type")
RUNTIME_INSTALLER_BASE = os.path.join(ROKCT_DIR, "sdk_installer_base.py")
COMPOSER_JSON = os.path.join(ROOT, "composer.json")
PACKAGE_JSON = os.path.join(ROOT, "package.json")
ROOT_GITIGNORE = os.path.join(ROOT, ".gitignore")

# Directories the cache-content hash skips (the Flutter composer's
# HASH_EXCLUDED_DIRS, with Next.js toolchain output in place of .dart_tool).
HASH_EXCLUDED_DIRS = {".git", "node_modules", "__pycache__", ".next", "build"}
# Cache entries that are not SDKs.
CACHE_RESERVED = {"_composer", "install_state.json"}

COMPOSED_START = "# @rokct-composed-start"
COMPOSED_END = "# @rokct-composed-end"

def die(*lines):
    for line in lines:
        print(f"[!] {line}", file=sys.stderr)
    sys.exit(1)


def sha256_file(path, normalize_newlines=True):
    """SHA-256 of a file. CRLF is folded to LF so a checkout on a
    core.autocrlf machine verifies against pins computed from the committed
    LF blobs - the same normalization sdk_composer.enforce_sdk_pin applies."""
    with open(path, "rb") as f:
        data = f.read()
    if normalize_newlines:
        data = data.replace(b"\r\n", b"\n")
    return hashlib.sha256(data).hexdigest()


def cache_dir_hash(d):
    """Content hash of a cache directory: every file's relative path plus
    its (newline-normalized) content hash, in sorted order. Mirrors the
    Flutter composer's cache_dir_hash so a committed cache entry can be
    checked against lock.json before its install.py is executed."""
    hasher = hashlib.sha256()
    entries = []
    for root, dirs, files in os.walk(d):
        dirs[:] = sorted(x for x in dirs if x not in HASH_EXCLUDED_DIRS)
        for name in files:
            if name.endswith(".pyc"):
                continue
            full = os.path.join(root, name)
            rel = os.path.relpath(full, d).replace("\\", "/")
            entries.append((rel, sha256_file(full)))
    for rel, digest in sorted(entries):
        hasher.update(rel.encode("utf-8"))
        hasher.update(b"\0")
        hasher.update(digest.encode("ascii"))
        hasher.update(b"\n")
    return hasher.hexdigest()


def clean_sdk_name(name):
    if name.endswith("_sdks"):
        return name[:-5]
    if name.endswith("_sdk"):
        return name[:-4]
    return name


def repo_name(git_url):
    url = git_url.rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]
    return os.path.basename(url)


def read_app_type():
    if not os.path.exists(APP_TYPE_FILE):
        return None
    with open(APP_TYPE_FILE, "r", encoding="utf-8") as f:
        return f.read().strip().lower() or None


def load_json(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def write_json(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def read_bytes(path):
    with open(path, "rb") as f:
        return f.read()


def load_vendored_composer():
    """Import the vendored sdk_composer module. PROJECT_ROOT inside it is
    os.getcwd(), which is the repo root here."""
    sys.path.insert(0, VENDOR_DIR)
    import sdk_composer  # noqa: E402

    return sdk_composer


def lock_home_sdk(sdks):
    """Name of the lock entry flagged "home_sdk": true (the flag build_lock()
    copies from the composer profile), or None for a lock written before the
    flag existed. Two flagged entries is the ambiguity the flag exists to
    settle, so it stops the compose - the same rule the composer applies."""
    flagged = [s["name"] for s in sdks if s.get("home_sdk") is True]
    if len(flagged) > 1:
        die(f"lock.json flags {len(flagged)} SDKs as home_sdk ({', '.join(flagged)}); "
            "exactly one entry may. Fix the registry template and refresh.")
    return flagged[0] if flagged else None


def run_installers(sdks):
    """Run each cached SDK's install.py through the composer's own
    run_installer (same logging, same failure handling), then its
    post-install checklist. Never touches resolve_and_cache_sdks, so nothing
    is fetched.

    The installers resolve the home SDK from composer.json (the profile the
    shell was composed from), which an offline compose does not have: the
    refresh discarded its scratch copy and the file is gitignored. Give them
    the lock's answer the same way - a scratch composer.json carrying just
    the sdks[] names and their home_sdk flags, removed again afterwards - so
    the home SDK's ownership of its files and of the single-answer landing
    registries holds at deploy time exactly as it does at refresh time. A
    composer.json already in the tree is the installers' input as it stands."""
    shutil.copyfile(os.path.join(VENDOR_DIR, "sdk_installer_base.py"), RUNTIME_INSTALLER_BASE)
    composer = load_vendored_composer()
    configs = [{"name": s["name"]} for s in sdks]
    scratch_composer = not os.path.exists(COMPOSER_JSON)
    if scratch_composer:
        write_json(COMPOSER_JSON, {
            "_comment": ("Scratch copy written by `scripts/compose.sh` (offline) from "
                         ".rokct/lock.json for the SDK installers; removed when the "
                         "compose ends. Do not commit."),
            "sdks": [{"name": s["name"], "enabled": True, "home_sdk": s.get("home_sdk") is True}
                     for s in sdks],
        })
    try:
        for cfg in configs:
            composer.run_installer(cfg)
        composer.collect_post_install_checklist(configs)
    finally:
        if scratch_composer and os.path.exists(COMPOSER_JSON):
            os.remove(COMPOSER_JSON)
    if composer.FAILED_SDKS:
        die("Compose FAILED: " + ", ".join(sorted(set(composer.FAILED_SDKS))))


def installed_files_from_state():
    if not os.path.exists(STATE_FILE):
        return {}
    state = load_json(STATE_FILE)
    files = {}
    for pkg_name, pkg in (state.get("packages") or {}).items():
        for rel in (pkg.get("files") or {}):
            files.setdefault(rel, pkg_name)
    return files


# ---------------------------------------------------------------- offline --


def offline():
    print("[*] compose: OFFLINE mode - composing from the committed .rokct/cache/ only.")
    if not os.path.exists(LOCK_FILE):
        die(".rokct/lock.json is missing - run `scripts/compose.sh refresh` in CI first.")
    lock = load_json(LOCK_FILE)
    problems = []

    # 1. The vendored composer must match its pins before it is imported.
    pinned_files = (lock.get("protocol") or {}).get("files") or {}
    for name in PROTOCOL_FILES:
        path = os.path.join(VENDOR_DIR, name)
        if not os.path.exists(path):
            problems.append(f"vendored composer file missing: .rokct/cache/_composer/{name}")
            continue
        expected = pinned_files.get(name)
        if not expected:
            problems.append(f"lock.json carries no sha256 for {name}")
        elif sha256_file(path) != expected:
            problems.append(f".rokct/cache/_composer/{name} does not match its lock.json sha256")

    # 2. Every locked SDK must be in the cache, intact, with its installer
    #    pinned - the offline equivalent of the composer's enforce_sdk_pin.
    sdks = lock.get("sdks") or []
    if not sdks:
        problems.append("lock.json lists no SDKs")
    for sdk in sdks:
        name = sdk.get("name", "?")
        cache_rel = sdk.get("cache") or f".rokct/cache/{clean_sdk_name(name)}"
        cache_abs = os.path.join(ROOT, *cache_rel.split("/"))
        if not os.path.isdir(cache_abs):
            problems.append(f"{name}: cache entry {cache_rel}/ is missing from the checkout")
            continue
        installer = os.path.join(cache_abs, "install.py")
        if not os.path.exists(installer):
            problems.append(f"{name}: {cache_rel}/install.py is missing")
        elif sha256_file(installer) != (sdk.get("install_py_sha256") or ""):
            problems.append(f"{name}: {cache_rel}/install.py does not match its lock.json sha256")
        if not os.path.exists(os.path.join(cache_abs, "manifest.json")):
            problems.append(f"{name}: {cache_rel}/manifest.json is missing")
        expected_content = sdk.get("content_sha256")
        if expected_content and cache_dir_hash(cache_abs) != expected_content:
            problems.append(
                f"{name}: {cache_rel}/ content differs from lock.json (partial checkout, "
                f"local edits, or a refresh that was not committed whole)"
            )

    if problems:
        die("Refusing to compose - the committed cache does not match .rokct/lock.json:", *problems,
            "Run `scripts/compose.sh refresh` in GitHub Actions and commit the result.")

    print(f"[+] lock.json verified: composer at protocol {lock.get('protocol', {}).get('ref', '?')[:12]}, "
          f"{len(sdks)} SDK(s) present and pinned.")
    for sdk in sdks:
        print(f"    {sdk['name']:<18} {sdk.get('version') or '?':<8} {(sdk.get('commit') or '?')[:12]}  "
              f"installing from committed {sdk.get('cache')}")
    home_sdk = lock_home_sdk(sdks)
    if home_sdk:
        print(f"[i] home SDK: {home_sdk}")
    else:
        print("[i] no home SDK: lock.json carries no home_sdk flag (written before the flag existed) - "
              "home files land in install order; run `scripts/compose.sh refresh` to record it.")
    if os.path.exists(COMPOSER_JSON):
        tree_home = lock_home_sdk([
            s for s in load_json(COMPOSER_JSON).get("sdks", [])
            if isinstance(s, dict) and s.get("name") and s.get("enabled", True)
        ])
        if tree_home != home_sdk:
            print(f"[!] composer.json in the tree flags {tree_home or 'no'} home SDK but lock.json flags "
                  f"{home_sdk or 'none'}; the installers read composer.json. Mirror it to the registry.")

    # 3. Install. The refresh commit already carries every dependency the
    #    installers merge into package.json, so a diff here means the commit
    #    was incomplete - fail rather than build against an unlocked tree.
    before = read_bytes(PACKAGE_JSON)
    run_installers(sdks)
    if read_bytes(PACKAGE_JSON) != before:
        die("The installers changed package.json during an offline compose.",
            "The committed package.json/pnpm-lock.yaml are behind the cache - "
            "run `scripts/compose.sh refresh` in GitHub Actions and commit the result.")

    files = installed_files_from_state()
    print(f"[+] Composed {len(sdks)} SDK(s) from the committed cache: "
          f"{len(files)} file(s) installed into the host.")


# ---------------------------------------------------------------- refresh --


def authenticated(url):
    token = os.environ.get("MONOREPO_PAT")
    if token and url.startswith("https://github.com/"):
        return url.replace("https://github.com/", f"https://x-access-token:{token}@github.com/")
    return url


def git(*args, **kwargs):
    return subprocess.run(["git", *args], check=True, text=True, capture_output=True, **kwargs).stdout


def resolve_commit(url, ref):
    """Commit the composer just cloned for <ref>. A 40-hex ref is already a
    commit; otherwise ask the remote (branches and tags)."""
    if len(ref) == 40 and all(c in "0123456789abcdef" for c in ref.lower()):
        return ref.lower()
    # ls-remote patterns match by trailing path component, so "main" would
    # also list refs/heads/<anything>/main - select the exact ref name.
    out = git("ls-remote", authenticated(url), f"refs/heads/{ref}", f"refs/tags/{ref}")
    found = {}
    for line in out.splitlines():
        sha, _, name = line.partition("\t")
        if sha and name:
            found[name.strip()] = sha
    for name in (f"refs/heads/{ref}", f"refs/tags/{ref}", f"refs/tags/{ref}^{{}}"):
        if name in found:
            return found[name]
    die(f"could not resolve ref '{ref}' on {url}")


def clone_protocol(dest):
    ref = os.environ.get("ROKCT_PROTOCOL_REF", "main")
    if os.path.exists(dest):
        shutil.rmtree(dest)
    print(f"[*] Cloning {PROTOCOL_GIT} @ {ref} ...")
    subprocess.run(
        ["git", "clone", "-q", "--depth", "1", "-b", ref, authenticated(PROTOCOL_GIT), dest],
        check=True,
    )
    return git("rev-parse", "HEAD", cwd=dest).strip()


def vendor_composer(protocol_dir):
    os.makedirs(VENDOR_DIR, exist_ok=True)
    pins = {}
    for name in PROTOCOL_FILES:
        src = os.path.join(protocol_dir, PROTOCOL_UTILS_REL, name)
        if not os.path.exists(src):
            die(f"protocol checkout has no {PROTOCOL_UTILS_REL}/{name}")
        dst = os.path.join(VENDOR_DIR, name)
        shutil.copyfile(src, dst)
        pins[name] = sha256_file(dst)
    return pins


def guard_sibling_checkouts(protocol_dir, app_type):
    """sdk_composer.resolve_and_cache_sdks() prefers ../<repo> next to this
    repo over cloning, and that path skips enforce_sdk_pin(). A refresh must
    pin lock.json to the commit it actually vendored, so refuse to run with
    a sibling checkout present unless explicitly allowed."""
    if os.environ.get("ROKCT_REFRESH_ALLOW_SIBLINGS", "").lower() in ("1", "true", "yes"):
        return
    template = os.path.join(protocol_dir, PROTOCOL_TEMPLATES_REL, f"{app_type}.json")
    if not os.path.exists(template):
        die(f"registry template '{app_type}' is missing from the protocol checkout ({PROTOCOL_TEMPLATES_REL}/{app_type}.json)")
    urls = {s.get("git") for s in load_json(template).get("sdks", [])
            if isinstance(s, dict) and s.get("enabled", True) and s.get("git")}
    parent = os.path.dirname(ROOT)
    siblings = sorted(os.path.join(parent, repo_name(u)) for u in urls
                      if os.path.exists(os.path.join(parent, repo_name(u))))
    if siblings:
        die("Refusing to refresh: the composer would read these sibling checkouts instead of cloning "
            "(and skip the sha256 pin gate):", *siblings,
            "Run the refresh from a directory with no sibling SDK checkouts (GitHub Actions does), "
            "or set ROKCT_REFRESH_ALLOW_SIBLINGS=1 to accept that.")


def wipe_cache():
    """Replace, never reconcile: every SDK entry is deleted before the
    composer re-extracts it, so a stale or hand-edited cache can never be
    kept by mistake and SDKs dropped from the template are pruned. The
    install record goes with it - the run rebuilds it for exactly the SDKs
    it composes."""
    os.makedirs(CACHE_DIR, exist_ok=True)
    for entry in os.listdir(CACHE_DIR):
        if entry in CACHE_RESERVED:
            continue
        path = os.path.join(CACHE_DIR, entry)
        if os.path.isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)
        print(f"[*] Removed stale cache entry {entry}")
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)


def run_composer(protocol_dir):
    env = dict(os.environ)
    env["ROKCT_PROTOCOL_DIR"] = protocol_dir  # local registry: no template fetch
    env["ROKCT_SKIP_NPM_INSTALL"] = "1"  # pnpm-lock.yaml is refreshed below
    env.pop("ROKCT_ALLOW_UNPINNED_SDKS", None)  # every entry must carry its pin
    shutil.copyfile(os.path.join(VENDOR_DIR, "sdk_installer_base.py"), RUNTIME_INSTALLER_BASE)
    composer = os.path.join(protocol_dir, PROTOCOL_UTILS_REL, "sdk_composer.py")
    print(f"[*] Running {PROTOCOL_UTILS_REL}/sdk_composer.py (network) ...")
    result = subprocess.run([sys.executable, composer], cwd=ROOT, env=env)
    if result.returncode != 0:
        die(f"sdk_composer.py exited {result.returncode}")


def build_lock(protocol_ref, composer_pins, app_type):
    config = load_json(COMPOSER_JSON)
    entries = [s for s in config.get("sdks", []) if isinstance(s, dict) and s.get("enabled", True)]
    if not entries:
        die("composer.json lists no enabled SDKs after compose")
    sdks = []
    commits = {}
    for entry in entries:
        name = entry["name"]
        clean = clean_sdk_name(name)
        cache_abs = os.path.join(CACHE_DIR, clean)
        if not os.path.isdir(cache_abs):
            die(f"{name}: composer reported success but .rokct/cache/{clean}/ is missing")
        url = entry.get("git", "")
        ref = entry.get("ref", "main")
        key = (url, ref)
        if key not in commits:
            commits[key] = resolve_commit(url, ref) if url else None
        manifest = load_json(os.path.join(cache_abs, "manifest.json"))
        sdks.append(
            {
                "name": name,
                "home_sdk": entry.get("home_sdk") is True,
                "cache": f".rokct/cache/{clean}",
                "git": url,
                "path": entry.get("path", ""),
                "ref": ref,
                "commit": commits[key],
                "version": manifest.get("version"),
                "install_py_sha256": sha256_file(os.path.join(cache_abs, "install.py")),
                "content_sha256": cache_dir_hash(cache_abs),
            }
        )
    lock = {
        "_comment": (
            "Generated by `scripts/compose.sh refresh`. Pins the vendored "
            "composer and every committed .rokct/cache/<sdk>/ entry; offline composes verify "
            "these before running any installer. Do not edit by hand."
        ),
        "generated_from": "scripts/compose.sh refresh",
        "app_type": app_type,
        "protocol": {
            "git": PROTOCOL_GIT,
            "ref": protocol_ref,
            "vendored": ".rokct/cache/_composer",
            "files": composer_pins,
        },
        "sdks": sdks,
    }
    write_json(LOCK_FILE, lock)
    return sdks


def tracked_paths():
    out = git("ls-files", "-z")
    return set(p for p in out.split("\0") if p)


def gitignore_escape(rel):
    """Quote a literal path for .gitignore: Next.js dynamic-route segments
    such as app/admin/shops/[id]/page.tsx would otherwise be read as a
    character class and never match."""
    out = []
    for ch in rel:
        if ch in "\\[]*?#!":
            out.append("\\" + ch)
        else:
            out.append(ch)
    return "".join(out)


def write_composed_gitignore_block():
    """Regenerate the marker-owned block in .gitignore listing every path
    the installers wrote into the host (the install record in
    .rokct/cache/install_state.json). Next.js has no single generated root
    the way a Dart shell's lib/ is, so the block is per path. Paths git
    already tracks are left out - an ignore rule is a no-op on a tracked
    file and would only mislead - and reported so the collision is visible."""
    files = installed_files_from_state()
    tracked = tracked_paths()
    ignored, collisions = [], []
    for rel in sorted(files):
        if rel in tracked:
            collisions.append((rel, files[rel]))
        else:
            ignored.append("/" + gitignore_escape(rel))
    block = [
        COMPOSED_START,
        "# Composed output - written into the host by the SDK installers on every",
        "# compose (scripts/compose.sh) from the committed .rokct/cache/. Generated",
        "# from the install record; regenerated by `scripts/compose.sh refresh`.",
        "# Edit the SDK, not these files.",
        *ignored,
        COMPOSED_END,
    ]
    lines = []
    if os.path.exists(ROOT_GITIGNORE):
        with open(ROOT_GITIGNORE, "r", encoding="utf-8") as f:
            lines = f.read().split("\n")
    if COMPOSED_START in lines and COMPOSED_END in lines:
        start, end = lines.index(COMPOSED_START), lines.index(COMPOSED_END)
        lines[start : end + 1] = block
    else:
        while lines and lines[-1].strip() == "":
            lines.pop()
        lines += ["", *block]
    with open(ROOT_GITIGNORE, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines).rstrip("\n") + "\n")
    print(f"[+] .gitignore composed-output block: {len(ignored)} path(s).")
    for rel, owner in collisions:
        print(f"  [*] {rel} is tracked by git AND installed by {owner} - "
              f"the tree keeps the host copy; compose installs the SDK copy over it at build time.")


def reconcile_tracked_host_files():
    """Some destinations an SDK installs are also committed by this host,
    and the installers just overwrote them. Restore the host copy from git -
    a refresh commit must never carry an SDK copy of a host file - and
    record the HOST copy's hash in the install record.

    Which hash goes in the record matters. The installer skips a destination
    whose hash differs from its record ("modified by a developer"), so
    recording the SDK copy's hash - what the installer had just written -
    would make the next compose in this same working tree skip that path and
    leave the restored host copy standing, quietly composing something other
    than what a deploy composes. With the host hash recorded, a compose finds
    the file unmodified and installs the SDK copy over it, which is what the
    deploy does too: a fresh checkout carries no install record at all, so
    nothing is ever skipped there.

    In this shell the reconciled set is the stale host copies of SDK-owned
    landing components named in the zero-drift step of
    .github/workflows/build.yml, plus app/(chat)/opengraph-image.png and
    twitter-image.png, which are byte-identical to the agent_sdk copies and
    so never actually change."""
    files = installed_files_from_state()
    tracked = tracked_paths()
    state = load_json(STATE_FILE)
    restored = []
    for rel in sorted(files):
        if rel not in tracked:
            continue
        owner = files[rel]
        git("checkout", "--", rel)
        # Raw bytes, exactly as the installer's file_hash() reads them.
        state["packages"][owner]["files"][rel] = sha256_file(
            os.path.join(ROOT, *rel.split("/")), normalize_newlines=False
        )
        restored.append((rel, owner))
    if restored:
        # Same serialisation as the installer's save_state(): no trailing newline.
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=2)
        for rel, owner in restored:
            print(f"[*] {rel}: host copy restored (installed by {owner} at build time).")


def stage_cache():
    """`git add -f` the cache and the lock.

    .rokct/cache/ is listed in the root .gitignore ON PURPOSE: the fleet
    linter's auto-fix runs `prettier --write . --ignore-path .gitignore` and
    commits the result, and prettier reformatting a vendored template would
    change the cache content out from under .rokct/lock.json - the next
    offline compose (i.e. the next Vercel build) would then refuse to run.
    The ignore rule is the only shield that pass honours. Tracked files stay
    tracked regardless of it, so the cache is committed with -f and a
    refresh must stage it the same way or a new SDK file would be silently
    left behind. lock.json's content_sha256 catches that anyway - the
    offline compose fails loudly rather than composing a partial cache.

    install_state.json is excluded: it is the installers' own record of what
    they wrote into THIS working tree, rewritten by every compose. Vercel
    starts from a fresh checkout with no record, which is exactly right -
    nothing is ever skipped as \"modified by a developer\" - and leaving it
    uncommitted is also what keeps `git status` clean after a compose."""
    git("add", "-f", "--", CACHE_DIR, f":(exclude){os.path.relpath(STATE_FILE, ROOT)}", LOCK_FILE)
    print("[*] git add -f .rokct/cache .rokct/lock.json (both are .gitignore'd on purpose - see the root .gitignore).")


def discard_composer_json():
    """resolve_composer_config() materialises composer.json from the registry
    template named by .rokct/config/app_type, and that template is the frappe
    docker template (its `modules` array and `rcore_app` name included) which
    happens to also carry the `sdks` array this composer reads. build_lock()
    has already read what it needs from it, and an OFFLINE compose never
    rewrites it - it runs the cached installers directly - so the materialised
    text has no job left to do.

    This shell has never committed composer.json (`/composer.json` is in the
    root .gitignore, from the thin-shell contract in #94): the file is a
    refresh-time scratch artifact, so delete it rather than restoring a copy
    that does not exist. .rokct/lock.json is the record of what actually
    composed."""
    if os.path.exists(COMPOSER_JSON):
        if "composer.json" in tracked_paths():
            git("checkout", "--", "composer.json")
            print("[*] composer.json: shell copy restored (the registry template is recorded in .rokct/lock.json).")
        else:
            os.remove(COMPOSER_JSON)
            print("[*] composer.json: refresh scratch copy removed (it is gitignored; see .rokct/lock.json).")


def dependency_maps():
    pkg = load_json(PACKAGE_JSON)
    return (dict(pkg.get("dependencies") or {}), dict(pkg.get("devDependencies") or {}))


def refresh():
    print("[*] compose: REFRESH mode - re-fetching the composer and every SDK from upstream.")
    app_type = read_app_type()
    if not app_type:
        die(".rokct/config/app_type is missing - this shell names no registry template.")
    deps_before = dependency_maps()
    tmp_dir = os.path.join(ROKCT_DIR, "tmp")
    os.makedirs(tmp_dir, exist_ok=True)
    protocol_dir = os.path.join(tmp_dir, "The-Rokct-Protocol")
    try:
        protocol_ref = clone_protocol(protocol_dir)
        guard_sibling_checkouts(protocol_dir, app_type)
        composer_pins = vendor_composer(protocol_dir)
        wipe_cache()
        run_composer(protocol_dir)
    finally:
        shutil.rmtree(protocol_dir, ignore_errors=True)
    # Never commit nested git repos: an interrupted compose can leave the
    # composer's temp clones (.rokct/cache/<repo>_sdk/.git) behind.
    for entry in os.listdir(CACHE_DIR):
        if entry.endswith("_sdk") and os.path.isdir(os.path.join(CACHE_DIR, entry, ".git")):
            shutil.rmtree(os.path.join(CACHE_DIR, entry))
    reconcile_tracked_host_files()
    sdks = build_lock(protocol_ref, composer_pins, app_type)
    discard_composer_json()
    write_composed_gitignore_block()
    # Tell the shell wrapper whether package-lock.json needs regenerating:
    # only when the installers merged a dependency the host did not already
    # carry. Re-resolving an unchanged dependency set would churn the lockfile.
    if dependency_maps() != deps_before:
        open(os.path.join(tmp_dir, "deps-changed"), "w").close()
        print("[*] package.json dependencies changed - package-lock.json will be refreshed.")
    else:
        print("[*] package.json dependencies unchanged - package-lock.json left as committed.")
    stage_cache()
    print(f"[+] .rokct/lock.json: protocol {protocol_ref[:12]}, {len(sdks)} SDK(s):")
    for sdk in sdks:
        print(f"    {sdk['name']:<18} {sdk.get('version') or '?':<8} {(sdk.get('commit') or '?')[:12]}  {sdk['cache']}")


if MODE == "offline":
    offline()
else:
    refresh()
PY

if [ "$MODE" = "refresh" ]; then
  # When the installers merged a dependency the host did not already carry,
  # bring the lockfile along so the deploy's frozen install succeeds without a
  # resolution step at build time. This shell's package manager is pnpm (its
  # committed lockfile is pnpm-lock.yaml, which is also what .github/workflows
  # /build.yml passes to the shared pipeline), so refresh the pnpm lockfile
  # only - never resolve it with npm, which would write a package-lock.json
  # the deploy does not read.
  if [ -e .rokct/tmp/deps-changed ]; then
    rm -f .rokct/tmp/deps-changed
    echo "[*] pnpm install --lockfile-only ..."
    pnpm install --lockfile-only --ignore-scripts
  fi
  rmdir .rokct/tmp 2>/dev/null || true
  echo "[+] refresh complete. Review and commit: .rokct/cache .rokct/lock.json package.json pnpm-lock.yaml .gitignore"
fi
