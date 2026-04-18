"""Configuration management for the Streamlit app."""

import json
from pathlib import Path
from typing import Dict, List, Optional

from secrets_manager import SecretsManager


class ConfigManager:
    """Manages loading, saving, and validating event configurations."""
    
    def __init__(self):
        self.config_dir = Path(__file__).parent.parent / "user_data" / "configs"
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.secrets_manager = SecretsManager()
    
    def list_saved_configs(self) -> List[str]:
        """List all saved event configuration files."""
        names = []
        for path in sorted(self.config_dir.glob("*.json.enc")):
            names.append(path.name[:-9])
        for path in sorted(self.config_dir.glob("*.json")):
            if path.name.endswith(".json") and not path.name.endswith(".json.enc"):
                stem = path.stem
                if stem not in names and stem != "default":
                    names.append(stem)
        return names
    
    def load_config(self, config_name: str) -> Dict:
        """Load a configuration by name."""
        enc_path = self.config_dir / f"{config_name}.json.enc"
        plain_path = self.config_dir / f"{config_name}.json"

        if enc_path.exists():
            with open(enc_path, "rb") as f:
                decrypted = self.secrets_manager.decrypt(f.read())
            return self.normalize_config(json.loads(decrypted.decode("utf-8")))

        if plain_path.exists():
            with open(plain_path, "r", encoding="utf-8") as f:
                return self.normalize_config(json.load(f))

        raise FileNotFoundError(f"Config not found: {config_name}")
    
    def save_config(self, config_name: str, config: Dict) -> None:
        """Save a configuration by name."""
        normalized = self.normalize_config(config)
        config_path = self.config_dir / f"{config_name}.json.enc"
        with open(config_path, "wb") as f:
            f.write(self.secrets_manager.encrypt(json.dumps(normalized, indent=2, ensure_ascii=False).encode("utf-8")))
        plain_path = self.config_dir / f"{config_name}.json"
        if plain_path.exists():
            plain_path.unlink()
    
    def validate_config_schema(self, config: Dict) -> tuple[bool, List[str]]:
        """Validate a configuration shape against the expected schema."""
        errors: List[str] = []
        if not isinstance(config, dict):
            return False, ["Configuration must be a JSON object."]

        expected_keys = [
            "event_name",
            "event_description",
            "form_url",
            "email_subject",
            "email_intro",
            "email_outro",
            "master_columns",
            "form_columns",
            "gs_invitees_sheet_id",
            "gs_invitees_sheet_name",
            "gs_responses_sheet_id",
            "gs_responses_sheet_name",
            "column_mappings",
            "form_mappings",
        ]
        for key in expected_keys:
            if key not in config:
                errors.append(f"Missing required key: {key}")

        if not isinstance(config.get("master_columns"), list):
            errors.append("master_columns must be a list")
        else:
            for idx, col in enumerate(config.get("master_columns", [])):
                if not isinstance(col, dict):
                    errors.append(f"master_columns[{idx}] must be an object")
                    continue
                if "name" not in col or not isinstance(col["name"], str):
                    errors.append(f"master_columns[{idx}] must have a string 'name'")
                if "type" not in col or not isinstance(col["type"], str):
                    errors.append(f"master_columns[{idx}] must have a string 'type'")

        if not isinstance(config.get("form_columns"), list):
            errors.append("form_columns must be a list")
        else:
            for idx, col in enumerate(config.get("form_columns", [])):
                if not isinstance(col, dict):
                    errors.append(f"form_columns[{idx}] must be an object")
                    continue
                if "name" not in col or not isinstance(col["name"], str):
                    errors.append(f"form_columns[{idx}] must have a string 'name'")
                if "type" not in col or not isinstance(col["type"], str):
                    errors.append(f"form_columns[{idx}] must have a string 'type'")

        if not isinstance(config.get("column_mappings"), dict):
            errors.append("column_mappings must be an object")
        if not isinstance(config.get("form_mappings"), dict):
            errors.append("form_mappings must be an object")

        if not isinstance(config.get("gs_invitees_sheet_id"), str):
            errors.append("gs_invitees_sheet_id must be a string")
        if not isinstance(config.get("gs_invitees_sheet_name"), str):
            errors.append("gs_invitees_sheet_name must be a string")
        if not isinstance(config.get("gs_responses_sheet_id"), str):
            errors.append("gs_responses_sheet_id must be a string")
        if not isinstance(config.get("gs_responses_sheet_name"), str):
            errors.append("gs_responses_sheet_name must be a string")

        return len(errors) == 0, errors

    def normalize_config(self, config: Dict) -> Dict:
        """Merge a loaded config with default values to preserve missing keys."""
        default = self.get_default_config()
        merged = {**default, **config}
        merged["column_mappings"] = {**default["column_mappings"], **config.get("column_mappings", {})}
        merged["form_mappings"] = {**default["form_mappings"], **config.get("form_mappings", {})}

        def normalize_column_list(column_list, default_list):
            if not isinstance(column_list, list):
                return default_list
            normalized = []
            for item in column_list:
                if not isinstance(item, dict):
                    continue
                name = item.get("name", "")
                type_value = item.get("type", "string")
                if not isinstance(name, str):
                    continue
                if not isinstance(type_value, str):
                    type_value = "string"
                normalized.append({"name": name, "type": type_value})
            return normalized if normalized else default_list

        merged["master_columns"] = normalize_column_list(config.get("master_columns", default["master_columns"]), default["master_columns"])
        merged["form_columns"] = normalize_column_list(config.get("form_columns", default["form_columns"]), default["form_columns"])

        for nested_key in ["gs_invitees_sheet_id", "gs_invitees_sheet_name", "gs_responses_sheet_id", "gs_responses_sheet_name"]:
            if not isinstance(merged.get(nested_key), str):
                merged[nested_key] = default[nested_key]

        if not isinstance(merged.get("column_mappings"), dict):
            merged["column_mappings"] = default["column_mappings"]
        if not isinstance(merged.get("form_mappings"), dict):
            merged["form_mappings"] = default["form_mappings"]

        return merged
    
    def delete_config(self, config_name: str) -> None:
        """Delete a saved configuration."""
        enc_path = self.config_dir / f"{config_name}.json.enc"
        plain_path = self.config_dir / f"{config_name}.json"
        if enc_path.exists():
            enc_path.unlink()
        if plain_path.exists():
            plain_path.unlink()
    
    def get_default_config(self) -> Dict:
        """Get the default configuration template."""
        return {
            "event_name": "",
            "event_description": "",
            "form_url": "",
            "email_subject": "",
            "email_intro": "",
            "email_outro": "",
            "master_columns": [
                {"name": "FirstName", "type": "string"},
                {"name": "LastName", "type": "string"},
                {"name": "Email", "type": "email"},
            ],
            "form_columns": [
                {"name": "Email", "type": "email"},
                {"name": "Status", "type": "string"},
                {"name": "Timestamp", "type": "string"},
            ],
            "gs_invitees_sheet_id": "",
            "gs_invitees_sheet_name": "Invitees",
            "gs_responses_sheet_id": "",
            "gs_responses_sheet_name": "Form Responses",
            "column_mappings": {
                "first_name": "FirstName",
                "last_name": "LastName",
                "email": "Email",
                "rsvp_link": "RSVP_Link",
                "invite_sent": "InviteSent",
                "rsvp_status": "RSVP_Status",
                "rsvp_timestamp": "Response_Timestamp",
            },
            "form_mappings": {
                "response_email": "Email",
                "response_status": "Status",
                "response_timestamp": "Timestamp",
            },
        }
    
    def get_preset_templates(self) -> Dict[str, Dict]:
        """Get preset event templates."""
        return {
            "Wedding": {
                "event_name": "Wedding Celebration",
                "event_description": "Join us for our wedding ceremony and reception",
                "email_subject": "You're Invited to Our Wedding!",
                "email_intro": "Dear {{FirstName}},\n\nWe would be honored to have you celebrate our special day!",
                "email_outro": "With love and gratitude\n\nBest wishes,\nThe Couple",
                "master_columns": [
                    {"name": "FirstName", "type": "string"},
                    {"name": "LastName", "type": "string"},
                    {"name": "Email", "type": "email"},
                    {"name": "PlusOnes", "type": "number"},
                    {"name": "Dietary", "type": "string"},
                ],
                "form_columns": [
                    {"name": "Email", "type": "email"},
                    {"name": "Attending", "type": "string"},
                    {"name": "PlusOnes", "type": "number"},
                    {"name": "DietaryRestrictions", "type": "string"},
                ],
            },
            "Conference": {
                "event_name": "Conference 2026",
                "event_description": "Annual technology conference and networking",
                "email_subject": "Conference Registration Confirmation",
                "email_intro": "Hi {{FirstName}},\n\nThank you for registering for our Conference!",
                "email_outro": "See you at the conference!\n\nBest regards,\nThe Team",
                "master_columns": [
                    {"name": "FirstName", "type": "string"},
                    {"name": "LastName", "type": "string"},
                    {"name": "Email", "type": "email"},
                    {"name": "Company", "type": "string"},
                    {"name": "TicketType", "type": "string"},
                ],
                "form_columns": [
                    {"name": "Email", "type": "email"},
                    {"name": "Attending", "type": "string"},
                    {"name": "TicketType", "type": "string"},
                ],
            },
            "Corporate Event": {
                "event_name": "Corporate Event",
                "event_description": "Company-wide gathering and celebration",
                "email_subject": "You're Invited to Our Corporate Event",
                "email_intro": "Hi {{FirstName}},\n\nYou're invited to join us for a special corporate event!",
                "email_outro": "Looking forward to seeing you there!",
                "master_columns": [
                    {"name": "FirstName", "type": "string"},
                    {"name": "LastName", "type": "string"},
                    {"name": "Email", "type": "email"},
                    {"name": "Department", "type": "string"},
                ],
                "form_columns": [
                    {"name": "Email", "type": "email"},
                    {"name": "WillAttend", "type": "string"},
                    {"name": "DietaryNeeds", "type": "string"},
                ],
            },
        }
    
    def validate_config(self, config: Dict) -> tuple[bool, List[str]]:
        """Validate a configuration. Returns (is_valid, list_of_errors)."""
        errors = []
        
        if not config.get("event_name"):
            errors.append("Event name is required")
        if not config.get("form_url"):
            errors.append("Form URL is required")
        if not config.get("master_columns") or len(config["master_columns"]) == 0:
            errors.append("At least one master column is required")
        if not config.get("form_columns") or len(config["form_columns"]) == 0:
            errors.append("At least one form column is required")
        
        # Check that email column exists in both
        master_names = [col.get("name") for col in config.get("master_columns", [])]
        if "Email" not in master_names:
            errors.append("Master sheet must have an 'Email' column")
        
        form_names = [col.get("name") for col in config.get("form_columns", [])]
        if "Email" not in form_names:
            errors.append("Form responses must have an 'Email' column")
        
        return (len(errors) == 0, errors)
