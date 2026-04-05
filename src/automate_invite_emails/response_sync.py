import csv
from pathlib import Path
from typing import Dict, Iterable, List


def load_responses_csv(path: str) -> List[Dict[str, str]]:
    path_obj = Path(path)
    with path_obj.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        return [{k.strip(): (v or "").strip() for k, v in row.items()} for row in reader]


def sync_response_status(master_rows: List[Dict[str, str]], responses: List[Dict[str, str]],
                         email_field: str = "Email", status_field: str = "RSVP_Status",
                         timestamp_field: str = "RSVP_Timestamp") -> List[Dict[str, str]]:
    email_map = {}
    for row in responses:
        email = row.get(email_field, "").strip().lower()
        if not email:
            continue
        email_map[email] = {
            "status": row.get(status_field, row.get("RSVP", "")).strip(),
            "timestamp": row.get(timestamp_field, row.get("Timestamp", "")).strip(),
        }

    updated = []
    for row in master_rows:
        email = row.get(email_field, "").strip().lower()
        if email in email_map:
            row[status_field] = email_map[email]["status"]
            row[timestamp_field] = email_map[email]["timestamp"]
        updated.append(row)

    return updated
