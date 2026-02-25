"""
Token encryption helper — VULN-12 Fix.

Provides transparent AES-128 (Fernet) encryption/decryption for sensitive
OAuth tokens stored in the integrations table.

Requires SENTINEL_TOKEN_ENCRYPTION_KEY in .env, generated with:
    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

If the key is missing, the module falls back to a no-op (plaintext) mode with a
warning — so existing deployments don't hard-break, but the logs will tell you
to set the key.
"""
import os
import logging

logger = logging.getLogger("sentinel.crypto")

_fernet = None
_ENCRYPTION_ENABLED = False

try:
    from cryptography.fernet import Fernet, InvalidToken
    _key = os.environ.get("SENTINEL_TOKEN_ENCRYPTION_KEY", "").encode()
    if _key:
        _fernet = Fernet(_key)
        _ENCRYPTION_ENABLED = True
        logger.info("[Crypto] Token encryption ENABLED (Fernet/AES-128).")
    else:
        logger.warning(
            "[Crypto] SENTINEL_TOKEN_ENCRYPTION_KEY not set — tokens stored in PLAINTEXT. "
            "Generate one with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
except ImportError:
    logger.warning(
        "[Crypto] 'cryptography' package not installed — tokens stored in PLAINTEXT. "
        "Run: pip install cryptography"
    )


def encrypt_token(value: str | None) -> str | None:
    """Encrypt a token before writing to the DB. Returns None if value is None."""
    if not value or not _fernet:
        return value
    try:
        return _fernet.encrypt(value.encode()).decode()
    except Exception as exc:
        logger.error(f"[Crypto] Encryption failed: {exc}")
        return value  # best-effort: return plaintext rather than crash


def decrypt_token(value: str | None) -> str | None:
    """Decrypt a token read from the DB. Returns None if value is None."""
    if not value or not _fernet:
        return value
    try:
        return _fernet.decrypt(value.encode()).decode()
    except Exception:
        # Token may have been stored before encryption was enabled — return as-is
        return value
