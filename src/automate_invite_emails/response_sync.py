import csv
from pathlib import Path
from typing import Dict, Iterable, List


def load_responses_csv(path: str) -> List[Dict[str, str]]:
    path_obj = Path(path)
    with path_obj.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        return [{k.strip(): (v or "").strip() for k, v in row.items()} for row in reader]


def sync_response_status(master_rows: List[Dict[str, str]], responses: List[Dict[str, str]],
                         master_email_field: str = "Email",
                         response_email_field: str = "Email",
                         response_status_field: str = "Status",
                         response_timestamp_field: str = "Timestamp",
                         output_status_field: str = "RSVP_Status",
                         output_timestamp_field: str = "RSVP_Timestamp") -> List[Dict[str, str]]:
    email_map = {}
    for row in responses:
        response_email = row.get(response_email_field, "").strip().lower()
        if not response_email:
            continue
        email_map[response_email] = {
            "status": row.get(response_status_field, "").strip(),
            "timestamp": row.get(response_timestamp_field, "").strip(),
        }

    updated = []
    for row in master_rows:
        master_email = row.get(master_email_field, "").strip().lower()
        if master_email in email_map:
            row[output_status_field] = email_map[master_email]["status"]
            row[output_timestamp_field] = email_map[master_email]["timestamp"]
        updated.append(row)

    return updated
