import ast, json, sys

def get_str(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    return None

def main(path, out_path):
    src = open(path).read()
    tree = ast.parse(src)
    commands = []
    class Visitor(ast.NodeVisitor):
        def visit_Call(self, node):
            func = node.func
            name = func.id if isinstance(func, ast.Name) else getattr(func, "attr", None)
            if name == "CommandDef":
                cmd_name = None
                desc = None
                category = None
                aliases = []
                if len(node.args) >= 1:
                    cmd_name = get_str(node.args[0])
                if len(node.args) >= 2:
                    desc = get_str(node.args[1])
                if len(node.args) >= 3:
                    category = get_str(node.args[2])
                for kw in node.keywords:
                    if kw.arg == "description" and desc is None:
                        desc = get_str(kw.value)
                    if kw.arg == "category" and category is None:
                        category = get_str(kw.value)
                    if kw.arg == "aliases" and isinstance(kw.value, (ast.Tuple, ast.List)):
                        aliases = [get_str(e) for e in kw.value.elts]
                if cmd_name:
                    commands.append({"name": cmd_name, "description": desc, "category": category, "aliases": aliases})
            self.generic_visit(node)
    Visitor().visit(tree)
    with open(out_path, "w") as f:
        json.dump(commands, f, ensure_ascii=False, indent=2)
    print(f"Found {len(commands)} commands")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
