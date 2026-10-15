import ast, json, sys

def resolve(node, module_consts):
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.Dict):
        result = {}
        for k, v in zip(node.keys, node.values):
            if k is None:
                result.update(resolve(v, module_consts))
                continue
            key = resolve(k, module_consts)
            result[key] = resolve(v, module_consts)
        return result
    if isinstance(node, ast.List):
        return [resolve(e, module_consts) for e in node.elts]
    if isinstance(node, ast.Tuple):
        return tuple(resolve(e, module_consts) for e in node.elts)
    if isinstance(node, ast.Set):
        return set(resolve(e, module_consts) for e in node.elts)
    if isinstance(node, ast.UnaryOp):
        val = resolve(node.operand, module_consts)
        if isinstance(node.op, ast.USub):
            return -val
        if isinstance(node.op, ast.UAdd):
            return val
        raise ValueError(f"unsupported unaryop {ast.dump(node)}")
    if isinstance(node, ast.BinOp):
        left = resolve(node.left, module_consts)
        right = resolve(node.right, module_consts)
        if isinstance(node.op, ast.Mult):
            return left * right
        if isinstance(node.op, ast.Add):
            return left + right
        if isinstance(node.op, ast.Sub):
            return left - right
        if isinstance(node.op, ast.Div):
            return left / right
        raise ValueError(f"unsupported binop {ast.dump(node)}")
    if isinstance(node, ast.Name):
        if node.id in module_consts:
            return module_consts[node.id]
        raise ValueError(f"UNRESOLVED_NAME:{node.id}")
    if isinstance(node, ast.Attribute):
        raise ValueError(f"UNRESOLVED_ATTR:{ast.dump(node)}")
    if isinstance(node, ast.Call):
        raise ValueError(f"UNRESOLVED_CALL:{ast.dump(node)}")
    raise ValueError(f"unsupported node {ast.dump(node)}")

def main(path, out_path):
    src = open(path).read()
    tree = ast.parse(src)
    module_consts = {}
    default_config_node = None
    errors = []
    for node in tree.body:
        if isinstance(node, ast.Assign):
            targets = [t.id for t in node.targets if isinstance(t, ast.Name)]
            if "DEFAULT_CONFIG" in targets:
                default_config_node = node.value
                continue
            for t in targets:
                try:
                    module_consts[t] = resolve(node.value, module_consts)
                except Exception as e:
                    errors.append((t, str(e)))
    if default_config_node is None:
        print("DEFAULT_CONFIG not found", file=sys.stderr)
        sys.exit(1)

    result = {}
    unresolved = []
    def resolve_dict(dict_node, prefix=""):
        for k, v in zip(dict_node.keys, dict_node.values):
            if k is None:
                # `**OTHER` 展開: Dict リテラルなら再帰、モジュール定数の dict なら平坦化して取り込む
                if isinstance(v, ast.Dict):
                    resolve_dict(v, prefix)
                    continue
                try:
                    spread = resolve(v, module_consts)
                except Exception as e:
                    unresolved.append((f"{prefix}.**" if prefix else "**", str(e)))
                    continue
                def flatten(d, p):
                    for sk, sv in d.items():
                        fk = f"{p}.{sk}" if p else str(sk)
                        if isinstance(sv, dict):
                            flatten(sv, fk)
                        else:
                            result[fk] = sv
                flatten(spread, prefix)
                continue
            key = resolve(k, module_consts)
            full_key = f"{prefix}.{key}" if prefix else str(key)
            if isinstance(v, ast.Dict):
                resolve_dict(v, full_key)
            else:
                try:
                    result[full_key] = resolve(v, module_consts)
                except Exception as e:
                    unresolved.append((full_key, str(e)))
    resolve_dict(default_config_node)

    # convert sets/tuples to lists for JSON
    def jsonify(v):
        if isinstance(v, (set, tuple)):
            return list(v)
        return v
    result = {k: jsonify(v) for k, v in result.items()}

    with open(out_path, "w") as f:
        json.dump(result, f, ensure_ascii=False, indent=2, sort_keys=True)

    print(f"Resolved {len(result)} keys")
    if unresolved:
        print(f"UNRESOLVED ({len(unresolved)}):")
        for k, e in unresolved:
            print(f"  {k}: {e}")
    if errors:
        print(f"Module-const errors ({len(errors)}):")
        for t, e in errors:
            print(f"  {t}: {e}")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
