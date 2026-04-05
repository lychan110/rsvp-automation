import re
from typing import Dict
from urllib.parse import quote_plus


def generate_rsvp_link(base_url: str, tokens: Dict[str, str]) -> str:
    result = base_url

    # Handle explicit placeholder tokens like FIRSTNAME+LASTNAME and EMAIL
    for key, value in tokens.items():
        result = result.replace(key, quote_plus(value or ""))

    # Handle {{FieldName}} style placeholders if present
    def replacement(match):
        key = match.group(1)
        return quote_plus(tokens.get(key, ""))

    result = re.sub(r"\{\{([^}]+)\}\}", replacement, result)
    return result


def build_tokens(invitee: Dict[str, str], mapping: Dict[str, str]) -> Dict[str, str]:
    return {token: invitee.get(field, "") for token, field in mapping.items()}
