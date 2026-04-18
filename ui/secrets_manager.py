import os
from pathlib import Path
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken


class SecretsManager:
    """Manage a local encryption key for protecting sensitive app files."""

    SECRET_ENV = "AUTOMATE_INVITE_EMAILS_SECRET_KEY"
    SECRET_FILE = Path(__file__).parent.parent / "user_data" / "keys" / ".secret_key"

    def __init__(self, key: Optional[bytes] = None):
        self.key = key or self._load_key()
        self.cipher = Fernet(self.key)

    def _load_key(self) -> bytes:
        env_key = self._load_env_key()
        if env_key:
            return env_key

        file_key = self._load_file_key()
        if file_key:
            return file_key

        return self._generate_and_store_key()

    def _load_env_key(self) -> Optional[bytes]:
        raw_key = os.environ.get(self.SECRET_ENV)
        if not raw_key:
            return None
        try:
            if isinstance(raw_key, str):
                raw_key = raw_key.encode("utf-8")
            Fernet(raw_key)  # validate
            return raw_key
        except Exception:
            return None

    def _load_file_key(self) -> Optional[bytes]:
        if not self.SECRET_FILE.exists():
            return None
        try:
            raw_key = self.SECRET_FILE.read_text(encoding="utf-8").strip().encode("utf-8")
            Fernet(raw_key)
            return raw_key
        except Exception:
            return None

    def _generate_and_store_key(self) -> bytes:
        key = Fernet.generate_key()
        self.SECRET_FILE.write_text(key.decode("utf-8"), encoding="utf-8")
        try:
            self.SECRET_FILE.chmod(0o600)
        except Exception:
            pass
        return key

    def encrypt(self, data: bytes) -> bytes:
        return self.cipher.encrypt(data)

    def decrypt(self, token: bytes) -> bytes:
        try:
            return self.cipher.decrypt(token)
        except InvalidToken as e:
            raise ValueError("Invalid secret key or corrupted data") from e
