import argparse
import json
from pathlib import Path
from typing import Dict, List

from automate_invite_emails.data_loader import load_invitees_from_csv, save_invitees_to_csv, load_json
from automate_invite_emails.link_generator import build_tokens, generate_rsvp_link
from automate_invite_emails.response_sync import load_responses_csv, sync_response_status
from automate_invite_emails.template_renderer import render_template_file


def load_config(path: str) -> Dict:
    config_path = Path(path)
    if config_path.suffix.lower() == ".json":
        return load_json(str(config_path))
    raise ValueError("Only JSON config files are supported for now.")


def generate_links(args: argparse.Namespace) -> None:
    config = load_config(args.config)
    rows = load_invitees_from_csv(args.input)
    token_mapping = config.get("form_tokens", {
        "FIRSTNAME+LASTNAME": "FirstName",
        "EMAIL": "Email",
    })
    output_rows: List[Dict[str, str]] = []

    for row in rows:
        tokens = build_tokens(row, token_mapping)
        row["RSVP_Link"] = generate_rsvp_link(config["form_prefill_url"], tokens)
        row["InviteSent"] = row.get("InviteSent", "FALSE")
        output_rows.append(row)

    fieldnames = list(output_rows[0].keys()) if output_rows else []
    save_invitees_to_csv(args.output, output_rows, fieldnames)
    print(f"Generated {len(output_rows)} RSVP links and saved to {args.output}")


def preview_email(args: argparse.Namespace) -> None:
    rows = load_invitees_from_csv(args.input)
    if not rows:
        raise ValueError("No invitees found for preview.")
    sample = rows[0]
    sample["RSVP_Link"] = args.rsvp_link or sample.get("RSVP_Link", "https://example.com/rsvp")
    output = render_template_file(args.template, sample)
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
        print(f"Preview written to {args.output}")
    else:
        print(output)


def sync_responses(args: argparse.Namespace) -> None:
    master_rows = load_invitees_from_csv(args.master)
    responses = load_responses_csv(args.responses)
    updated_rows = sync_response_status(master_rows, responses,
                                        email_field=args.email_field,
                                        status_field=args.status_field,
                                        timestamp_field=args.timestamp_field)
    fieldnames = list(updated_rows[0].keys()) if updated_rows else []
    save_invitees_to_csv(args.output, updated_rows, fieldnames)
    print(f"Synced {len(updated_rows)} master rows with {len(responses)} responses and saved to {args.output}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Automated RSVP invite workflow commands"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    gen = subparsers.add_parser("generate-links", help="Generate personalized RSVP links for invitees")
    gen.add_argument("--config", required=True, help="Path to event config JSON")
    gen.add_argument("--input", required=True, help="Path to invitee CSV input")
    gen.add_argument("--output", required=True, help="Path to write CSV output")
    gen.set_defaults(func=generate_links)

    preview = subparsers.add_parser("preview-email", help="Render a sample email using one invitee record")
    preview.add_argument("--input", required=True, help="Path to invitee CSV input")
    preview.add_argument("--template", required=True, help="Path to HTML template file")
    preview.add_argument("--rsvp-link", help="Override RSVP link for preview")
    preview.add_argument("--output", help="Optional path to save preview output")
    preview.set_defaults(func=preview_email)

    sync = subparsers.add_parser("sync-responses", help="Sync RSVP responses back to the master invite list")
    sync.add_argument("--master", required=True, help="Path to master invitee CSV")
    sync.add_argument("--responses", required=True, help="Path to response CSV export")
    sync.add_argument("--output", required=True, help="Path to write updated master CSV")
    sync.add_argument("--email-field", default="Email", help="Email field name in both master and response files")
    sync.add_argument("--status-field", default="RSVP_Status", help="Master status field name")
    sync.add_argument("--timestamp-field", default="RSVP_Timestamp", help="Master timestamp field name")
    sync.set_defaults(func=sync_responses)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)
