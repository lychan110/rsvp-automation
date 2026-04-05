import csv
import json
from pathlib import Path
from typing import Dict, Iterable, List


def normalize_header(header: str) -> str:
    return header.strip().replace(" ", "_").replace("-", "_")


def load_invitees_from_csv(path: str) -> List[Dict[str, str]]:
    path_obj = Path(path)
    with path_obj.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        rows = []
        for row in reader:
            normalized = {normalize_header(k): (v or "").strip() for k, v in row.items()}
            rows.append(normalized)
        return rows


def save_invitees_to_csv(path: str, rows: Iterable[Dict[str, str]], fieldnames: List[str]) -> None:
    path_obj = Path(path)
    with path_obj.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def load_json(path: str) -> Dict:
    path_obj = Path(path)
    with path_obj.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def save_json(path: str, data: Dict) -> None:
    path_obj = Path(path)
    with path_obj.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
