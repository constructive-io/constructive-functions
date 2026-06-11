#!/usr/bin/env python3
"""
Copy slicer packages from constructive-db to constructive-functions/pgpm/,
stripping grants/RLS/policies while keeping all structural DDL, procedures,
triggers, and compute logic.

This replaces ALL existing pgpm packages (except constructive-infra-seed and
constructive-infra-services) with fresh slicer output.

Also splits constructive-compute-stubs into:
  - constructive-infra (platform_namespaces, platform_namespace_events)
  - constructive-users (users, role_types)
  - services handled by @pgpm/services from extensions/
"""

import os
import re
import shutil
from pathlib import Path

SLICER_DIR = Path("/home/ubuntu/repos/constructive-db/application/constructive-modules/packages")
TARGET_DIR = Path("/home/ubuntu/repos/constructive-functions/pgpm")

# Packages to copy directly from slicer (name mapping: slicer_name -> target_name)
DIRECT_PACKAGES = {
    "constructive-compute": "constructive-compute",
    "constructive-platform-function-graph": "constructive-platform-function-graph",
    "constructive-objects": "constructive-objects",
    "constructive-store": "constructive-store",
    "constructive-storage": "constructive-storage",
}

# Packages to keep untouched in target
KEEP_PACKAGES = {"constructive-infra-seed", "constructive-infra-services"}

# Directories to strip (grants, RLS policies, default privileges)
STRIP_DIRS = {"grants", "policies", "default_function_privs", "default_table_privs", "default_seq_privs", "default_type_privs"}

# Files to strip based on path patterns
STRIP_PATH_PATTERNS = [
    r"/grants/",
    r"/policies/",
    r"/default_function_privs/",
]


def strip_rls_from_sql(content: str) -> str:
    """Remove ALTER TABLE ... ENABLE/DISABLE ROW LEVEL SECURITY statements from SQL."""
    lines = content.split('\n')
    filtered = []
    skip_next_rls = False
    for i, line in enumerate(lines):
        if re.match(r'\s*ALTER\s+TABLE\s+.*(?:ENABLE|DISABLE)\s+ROW\s+LEVEL\s+SECURITY', line, re.IGNORECASE):
            continue
        # Handle multi-line: ALTER TABLE ...\n  ENABLE/DISABLE ROW LEVEL SECURITY
        if re.match(r'\s*(?:ENABLE|DISABLE)\s+ROW\s+LEVEL\s+SECURITY', line, re.IGNORECASE):
            # Remove the preceding ALTER TABLE line too if it's incomplete
            if filtered and re.match(r'\s*ALTER\s+TABLE\s+', filtered[-1], re.IGNORECASE) and not filtered[-1].rstrip().endswith(';'):
                filtered.pop()
            continue
        filtered.append(line)
    return '\n'.join(filtered)


def is_rls_only_file(content: str) -> bool:
    """Check if a SQL file contains ONLY RLS enable/disable (no other meaningful SQL)."""
    # Strip comments and whitespace
    meaningful = []
    for line in content.split('\n'):
        stripped = line.strip()
        if not stripped or stripped.startswith('--'):
            continue
        meaningful.append(stripped)
    # Check if all meaningful lines are just RLS or transaction markers
    for line in meaningful:
        if line in ('BEGIN;', 'COMMIT;', 'ROLLBACK;'):
            continue
        if re.match(r'ALTER\s+TABLE\s+.*(?:ENABLE|DISABLE)\s+ROW\s+LEVEL\s+SECURITY', line, re.IGNORECASE):
            continue
        if re.match(r'(?:ENABLE|DISABLE)\s+ROW\s+LEVEL\s+SECURITY', line, re.IGNORECASE):
            continue
        return False
    return len(meaningful) > 0


def strip_grants_from_plan(plan_content: str, rls_only_entries: set = None) -> str:
    """Remove grant/policy/default_*_privs entries and RLS-only alterations from pgpm.plan."""
    if rls_only_entries is None:
        rls_only_entries = set()
    lines = plan_content.split('\n')
    filtered = []
    strip_patterns = ['/grants/', '/policies/', '/default_function_privs/', '/default_table_privs/', '/default_seq_privs/', '/default_type_privs/']
    for line in lines:
        # Skip lines that reference grants, policies, or default privileges
        if any(pat.lstrip('/') in line for pat in strip_patterns):
            continue
        # Skip RLS-only alteration entries
        entry_name = line.split(' ')[0] if line and not line.startswith('%') else ''
        if entry_name in rls_only_entries:
            continue
        filtered.append(line)
    return '\n'.join(filtered)


def should_strip_path(path: str) -> bool:
    """Check if a file path should be stripped."""
    parts = Path(path).parts
    for part in parts:
        if part in STRIP_DIRS:
            return True
    return False


def copy_package_stripped(src_dir: Path, dst_dir: Path):
    """Copy a slicer package, stripping grants/RLS."""
    if dst_dir.exists():
        shutil.rmtree(dst_dir)
    
    # First pass: identify RLS-only files to skip entirely
    rls_only_entries = set()
    for root, dirs, files in os.walk(src_dir / "deploy"):
        for f in files:
            if f.endswith(".sql"):
                src_file = Path(root) / f
                content = src_file.read_text()
                if is_rls_only_file(content):
                    rel = src_file.relative_to(src_dir / "deploy")
                    entry = str(rel).replace(".sql", "").replace("\\", "/")
                    rls_only_entries.add(entry)
    
    for root, dirs, files in os.walk(src_dir):
        rel_root = Path(root).relative_to(src_dir)
        
        # Skip stripped directories entirely
        dirs[:] = [d for d in dirs if d not in STRIP_DIRS]
        
        for f in files:
            src_file = Path(root) / f
            rel_path = rel_root / f
            dst_file = dst_dir / rel_path
            
            # Skip files in stripped paths
            if should_strip_path(str(rel_path)):
                continue
            
            # Skip RLS-only SQL files (check all deploy/revert/verify)
            if f.endswith(".sql"):
                rel_str = str(rel_path).replace("\\", "/")
                skip = False
                for prefix in ("deploy/", "revert/", "verify/"):
                    if rel_str.startswith(prefix):
                        entry = rel_str[len(prefix):].replace(".sql", "")
                        if entry in rls_only_entries:
                            skip = True
                            break
                if skip:
                    continue
            
            dst_file.parent.mkdir(parents=True, exist_ok=True)
            
            if f == "pgpm.plan":
                # Strip plan entries for grants/policies/RLS-only
                content = src_file.read_text()
                content = strip_grants_from_plan(content, rls_only_entries)
                dst_file.write_text(content)
            elif f.endswith(".sql"):
                # Strip RLS enable/disable statements from SQL files
                content = src_file.read_text()
                content = strip_rls_from_sql(content)
                dst_file.write_text(content)
            else:
                shutil.copy2(src_file, dst_file)


def extract_schema_from_stubs(stubs_dir: Path, schema_name: str, pkg_name: str, dst_dir: Path, control_requires: str, comment: str):
    """Extract a single schema from constructive-compute-stubs into its own package."""
    if dst_dir.exists():
        shutil.rmtree(dst_dir)
    dst_dir.mkdir(parents=True)
    
    # Copy deploy/revert/verify for the specific schema
    for subdir in ["deploy", "revert", "verify"]:
        src_schema_dir = stubs_dir / subdir / "schemas" / schema_name
        if src_schema_dir.exists():
            dst_schema_dir = dst_dir / subdir / "schemas" / schema_name
            for root, dirs, files in os.walk(src_schema_dir):
                rel_root = Path(root).relative_to(src_schema_dir)
                
                # Skip stripped directories
                dirs[:] = [d for d in dirs if d not in STRIP_DIRS]
                
                for f in files:
                    src_file = Path(root) / f
                    rel_path = rel_root / f
                    
                    if should_strip_path(str(rel_path)):
                        continue
                    
                    dst_file = dst_schema_dir / rel_path
                    dst_file.parent.mkdir(parents=True, exist_ok=True)
                    
                    if f.endswith(".sql"):
                        content = src_file.read_text()
                        content = strip_rls_from_sql(content)
                        dst_file.write_text(content)
                    else:
                        shutil.copy2(src_file, dst_file)
    
    # Generate pgpm.plan from deploy files
    plan_entries = []
    deploy_dir = dst_dir / "deploy"
    if deploy_dir.exists():
        for root, dirs, files in os.walk(deploy_dir):
            for f in files:
                if f.endswith(".sql"):
                    rel = Path(root).relative_to(deploy_dir) / f
                    entry = str(rel).replace(".sql", "").replace("\\", "/")
                    plan_entries.append(entry)
    
    # Sort: schema first, then tables, then columns/constraints/etc
    def sort_key(entry):
        parts = entry.split("/")
        if len(parts) <= 2:  # schema-level
            return (0, entry)
        if "tables" in parts and "table" in parts[-1]:
            return (1, entry)
        return (2, entry)
    
    plan_entries.sort(key=sort_key)
    
    # Build pgpm.plan with dependencies
    plan_lines = [
        f"%syntax-version=1.0.0",
        f"%project={pkg_name}",
        f"%uri={pkg_name}",
        "",
    ]
    
    schema_entry = f"schemas/{schema_name}/schema"
    for entry in plan_entries:
        if entry == schema_entry:
            plan_lines.append(f"{entry} 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # create schema")
        elif "/tables/" in entry and entry.endswith("/table"):
            deps = f"[{schema_entry}]"
            plan_lines.append(f"{entry} {deps} 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # create table")
        elif "/columns/" in entry:
            # Column depends on its table
            table_path = "/".join(entry.split("/")[:5]) + "/table"
            deps = f"[{table_path}]"
            plan_lines.append(f"{entry} {deps} 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # add column")
        elif "/constraints/" in entry:
            table_path = "/".join(entry.split("/")[:5]) + "/table"
            deps = f"[{table_path}]"
            plan_lines.append(f"{entry} {deps} 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # add constraint")
        elif "/alterations/" in entry:
            parent_path = "/".join(entry.split("/")[:-2])
            # Find the base entry
            if "/columns/" in entry:
                parent_path += "/column"
            elif "/tables/" in entry:
                parent_path += "/table"
            deps = f"[{parent_path}]"
            plan_lines.append(f"{entry} {deps} 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # alteration")
        elif "/triggers/" in entry:
            table_path = "/".join(entry.split("/")[:5]) + "/table"
            deps = f"[{table_path}]"
            plan_lines.append(f"{entry} {deps} 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # add trigger")
        elif "/trigger_fns/" in entry:
            plan_lines.append(f"{entry} [{schema_entry}] 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # add trigger function")
        else:
            plan_lines.append(f"{entry} [{schema_entry}] 2017-08-11T08:11:51Z Constructive <developers@constructive.io> # add")
    
    (dst_dir / "pgpm.plan").write_text("\n".join(plan_lines) + "\n")
    
    # Write .control file
    control = f"""# {pkg_name} extension
comment = '{comment}'
default_version = '0.0.1'
relocatable = false
requires = '{control_requires}'
"""
    (dst_dir / f"{pkg_name}.control").write_text(control)
    
    # Write Makefile
    makefile = f"""EXTENSION = {pkg_name}
DATA = sql/{pkg_name}--0.0.1.sql

PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)
"""
    (dst_dir / "Makefile").write_text(makefile)
    
    # Write package.json
    import json
    pkg_json = {
        "name": f"@constructive-io/{pkg_name}",
        "version": "0.0.1",
        "description": comment,
        "author": "Constructive <developers@constructive.io>",
        "keywords": ["postgresql", "pgpm", pkg_name],
        "publishConfig": {"access": "public"},
        "scripts": {
            "bundle": "pgpm package",
            "test": "jest",
            "test:watch": "jest --watch"
        },
        "devDependencies": {
            "pgpm": "^4.26.1"
        },
        "repository": {
            "type": "git",
            "url": "https://github.com/constructive-io/constructive-functions"
        }
    }
    (dst_dir / "package.json").write_text(json.dumps(pkg_json, indent=2) + "\n")


def fix_control_requires(pkg_dir: Path, old_dep: str, new_deps: list):
    """Replace a dependency in a .control file."""
    control_files = list(pkg_dir.glob("*.control"))
    if not control_files:
        return
    control = control_files[0]
    content = control.read_text()
    for old in [old_dep]:
        # Replace the old dep with new deps joined by comma
        new_str = ",".join(new_deps) if new_deps else ""
        if new_str:
            content = content.replace(f",{old}", f",{new_str}")
            content = content.replace(f"{old},", f"{new_str},")
            content = content.replace(old, new_str)
        else:
            content = content.replace(f",{old}", "")
            content = content.replace(f"{old},", "")
            content = content.replace(old, "")
    control.write_text(content)


def main():
    print("=== Copying slicer packages to constructive-functions ===\n")
    
    # Step 1: Remove existing packages (except KEEP_PACKAGES)
    print("Step 1: Removing old packages...")
    for item in TARGET_DIR.iterdir():
        if item.is_dir() and item.name not in KEEP_PACKAGES:
            print(f"  Removing {item.name}/")
            shutil.rmtree(item)
    
    # Step 2: Copy direct packages (stripped)
    print("\nStep 2: Copying slicer packages (stripped)...")
    for slicer_name, target_name in DIRECT_PACKAGES.items():
        src = SLICER_DIR / slicer_name
        dst = TARGET_DIR / target_name
        print(f"  {slicer_name} -> {target_name}/")
        copy_package_stripped(src, dst)
    
    # Step 3: Extract constructive-infra from stubs
    print("\nStep 3: Extracting constructive-infra from stubs...")
    stubs_dir = SLICER_DIR / "constructive-compute-stubs"
    extract_schema_from_stubs(
        stubs_dir,
        "constructive_infra_public",
        "constructive-infra",
        TARGET_DIR / "constructive-infra",
        "plpgsql,pgpm-inflection,pgpm-stamps",
        "Platform infrastructure stubs — namespaces and namespace events"
    )
    
    # Also extract constructive_infra_private if it exists
    infra_priv = stubs_dir / "deploy" / "schemas" / "constructive_infra_private"
    if infra_priv.exists():
        dst_priv = TARGET_DIR / "constructive-infra" / "deploy" / "schemas" / "constructive_infra_private"
        for root, dirs, files in os.walk(infra_priv):
            dirs[:] = [d for d in dirs if d not in STRIP_DIRS]
            for f in files:
                src_file = Path(root) / f
                rel_path = Path(root).relative_to(infra_priv) / f
                if should_strip_path(str(rel_path)):
                    continue
                dst_file = dst_priv / rel_path
                dst_file.parent.mkdir(parents=True, exist_ok=True)
                if f.endswith(".sql"):
                    content = src_file.read_text()
                    content = strip_rls_from_sql(content)
                    dst_file.write_text(content)
                else:
                    shutil.copy2(src_file, dst_file)
    
    # Step 4: Extract constructive-users from stubs
    print("Step 4: Extracting constructive-users from stubs...")
    extract_schema_from_stubs(
        stubs_dir,
        "constructive_users_public",
        "constructive-users",
        TARGET_DIR / "constructive-users",
        "plpgsql,pgpm-types",
        "User identity stubs — users table and role_types"
    )
    
    # Step 5: Fix .control dependencies
    # The slicer packages reference 'constructive-compute-stubs' which we've split
    # Replace with the actual packages that provide those schemas
    print("\nStep 5: Fixing .control dependencies...")
    
    # constructive-compute requires constructive-compute-stubs -> needs services,users,infra
    fix_control_requires(
        TARGET_DIR / "constructive-compute",
        "constructive-compute-stubs",
        ["services", "constructive-users", "constructive-infra"]
    )
    
    # constructive-platform-function-graph requires constructive-compute-stubs -> doesn't actually need stubs
    fix_control_requires(
        TARGET_DIR / "constructive-platform-function-graph",
        "constructive-compute-stubs",
        []
    )
    
    # constructive-store requires constructive-compute-stubs -> needs infra for FK
    fix_control_requires(
        TARGET_DIR / "constructive-store",
        "constructive-compute-stubs",
        ["constructive-infra"]
    )
    
    print("\nDone! Packages in pgpm/:")
    for item in sorted(TARGET_DIR.iterdir()):
        if item.is_dir():
            tables = list(item.glob("deploy/schemas/*/tables/*/table.sql"))
            print(f"  {item.name}: {len(tables)} tables")


if __name__ == "__main__":
    main()
