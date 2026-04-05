import re
from pathlib import Path
from typing import Dict


def render_template_string(template: str, context: Dict[str, str]) -> str:
    def replace(match):
        key = match.group(1).strip()
        return context.get(key, "")

    rendered = re.sub(r"\{\{\s*([^}]+?)\s*\}\}", replace, template)
    return rendered


def render_template_file(path: str, context: Dict[str, str]) -> str:
    template_path = Path(path)
    template_text = template_path.read_text(encoding="utf-8")
    return render_template_string(template_text, context)
