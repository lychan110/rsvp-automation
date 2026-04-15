"""Configuration management for the Streamlit app."""

import json
from pathlib import Path
from typing import Dict, List, Optional


class ConfigManager:
    """Manages loading, saving, and validating event configurations."""
    
    def __init__(self):
        self.config_dir = Path(__file__).parent.parent / "config"
        self.config_dir.mkdir(exist_ok=True)
    
    def list_saved_configs(self) -> List[str]:
        """List all saved event configuration files."""
        json_files = sorted(self.config_dir.glob("*.json"))
        return [f.stem for f in json_files if f.stem != "default"]
    
    def load_config(self, config_name: str) -> Dict:
        """Load a configuration by name."""
        config_path = self.config_dir / f"{config_name}.json"
        if not config_path.exists():
            raise FileNotFoundError(f"Config not found: {config_name}")
        
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def save_config(self, config_name: str, config: Dict) -> None:
        """Save a configuration by name."""
        config_path = self.config_dir / f"{config_name}.json"
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    
    def delete_config(self, config_name: str) -> None:
        """Delete a saved configuration."""
        config_path = self.config_dir / f"{config_name}.json"
        if config_path.exists():
            config_path.unlink()
    
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
