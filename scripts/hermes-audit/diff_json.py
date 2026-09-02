"""2 つのフラット JSON（extract_defaults.py の出力）または CommandDef 配列（extract_commands.py の出力）を比較する。

使い方:
  python3 diff_json.py defaults old.json new.json > diff-defaults.txt
  python3 diff_json.py commands old.json new.json > diff-commands.txt
"""
import json
import sys


def diff_defaults(old, new):
    old_keys, new_keys = set(old), set(new)
    added = sorted(new_keys - old_keys)
    removed = sorted(old_keys - new_keys)
    changed = sorted(k for k in old_keys & new_keys if old[k] != new[k])
    print(f"ADDED: {len(added)} / REMOVED: {len(removed)} / CHANGED: {len(changed)}")
    print(f"_config_version: {old.get('_config_version')} -> {new.get('_config_version')}\n")
    print("=== CHANGED ===")
    for k in changed:
        print(f"{k}: {json.dumps(old[k], ensure_ascii=False)} -> {json.dumps(new[k], ensure_ascii=False)}")
    print("\n=== REMOVED ===")
    for k in removed:
        print(f"{k} = {json.dumps(old[k], ensure_ascii=False)}")
    print("\n=== ADDED ===")
    for k in added:
        print(f"{k} = {json.dumps(new[k], ensure_ascii=False)}")


def diff_commands(old, new):
    old_map = {c["name"]: c for c in old}
    new_map = {c["name"]: c for c in new}
    added = sorted(set(new_map) - set(old_map))
    removed = sorted(set(old_map) - set(new_map))
    changed = sorted(n for n in set(old_map) & set(new_map) if old_map[n] != new_map[n])
    print(f"OLD: {len(old)} / NEW: {len(new)} / ADDED: {len(added)} / REMOVED: {len(removed)} / CHANGED: {len(changed)}\n")
    print("=== ADDED ===")
    for n in added:
        c = new_map[n]
        print(f"{n} [{c.get('category')}] aliases={c.get('aliases')}: {c.get('description')}")
    print("\n=== REMOVED ===")
    for n in removed:
        print(f"{n}: {old_map[n].get('description')}")
    print("\n=== CHANGED ===")
    for n in changed:
        print(f"{n}:\n  old: {old_map[n]}\n  new: {new_map[n]}")


if __name__ == "__main__":
    mode, old_path, new_path = sys.argv[1:4]
    old = json.load(open(old_path))
    new = json.load(open(new_path))
    (diff_defaults if mode == "defaults" else diff_commands)(old, new)
