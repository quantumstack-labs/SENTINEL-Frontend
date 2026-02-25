import asyncio
import json
import time
from groq import Groq
from app.config import settings

PRIORITY_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
]

SYSTEM_PROMPT = """You are Sentinel, an AI that extracts execution commitments from team communications.

Each message is prefixed with the sender's email and channel in the format [author: email@domain.com] [channel: engineering]. 

Return a JSON object exactly matching this schema:
{
  "commitments": [
    {
      "quote": "exact phrase from the message containing the commitment",
      "description": "clean one-sentence summary of what was committed to",
      "owner_name": "full name or best guess from context, NEVER leave empty",
      "owner_email": "email from the [author:] prefix, NEVER leave empty — use 'unknown@unknown.com' if missing",
      "due_date": "ISO 8601 datetime e.g. 2026-03-01T00:00:00Z — NEVER leave empty, default to 7 days from today if not stated",
      "confidence": 0.85,
      "source": "slack",
      "source_channel": "channel name from the [channel:] prefix (e.g. 'engineering'). Use 'unknown' if missing."
    }
  ]
}

STRICT field rules — violating these will break the pipeline:
- `confidence` MUST be a float between 0.0 and 1.0. NEVER output null, empty string, or omit it. Use 0.85 for clear commitments, 0.6 for ambiguous ones.
- `due_date` MUST be a valid ISO 8601 string. NEVER leave it empty. If no date is mentioned, use today + 7 days.
- `owner_email` MUST be a string. NEVER leave it empty. Use the [author:] prefix email. If missing, use 'unknown@unknown.com'.
- `owner_name` MUST be a string. NEVER leave it empty. Use 'Unknown' if you cannot determine it.
- `source_channel` MUST be a string without the '#' symbol. 
- Only extract genuine, specific delivery commitments. Ignore casual chat, sarcasm, and vague statements.
- Return { "commitments": [] } if nothing qualifies.
- Return ONLY valid JSON, no commentary, no markdown fences."""


def _select_model(client: Groq) -> str:
    try:
        active_ids = {m.id for m in client.models.list().data}
        print(f"  [LLM] Active Groq models: {sorted(active_ids)}")
        for model in PRIORITY_MODELS:
            if model in active_ids:
                print(f"  [LLM] Selected model: {model}")
                return model
        fallback = next(iter(active_ids))
        print(f"  [LLM] No priority model found — falling back to: {fallback}")
        return fallback
    except Exception as exc:
        print(f"  [LLM] Could not fetch model list ({exc}) — defaulting to {PRIORITY_MODELS[0]}")
        return PRIORITY_MODELS[0]


# Common prompt injection phrases to sanitize from user-supplied content
_INJECTION_PATTERNS = [
    "ignore previous", "ignore all", "disregard", "new instructions",
    "system prompt", "you are now", "delete all", "drop table",
    "forget everything", "act as",
]


def _sanitize_text(text: str) -> str:
    """Redact messages that appear to contain prompt injection attempts."""
    lower = text.lower()
    for pattern in _INJECTION_PATTERNS:
        if pattern in lower:
            return "[MESSAGE REDACTED: policy violation detected]"
    return text


def _format_messages(messages: list) -> str:
    lines = []
    for m in messages:
        if isinstance(m, dict):
            email = m.get("author_email", "unknown@unknown.com")
            channel = m.get("channel", "unknown")
            text = _sanitize_text(m.get("text", ""))
            prefix = f"[author: {email}] [channel: {channel}] "
            lines.append(f"{prefix}{text}")
        else:
            lines.append(_sanitize_text(str(m)))
    return "\n---\n".join(lines)


async def extract_commitments(messages: list) -> list[dict]:
    if not messages:
        print("  [LLM] No messages to process — skipping.")
        return []

    print(f"  [LLM] Sending {len(messages)} message(s) to Groq for extraction...")
    user_content = "Extract all commitments from these messages:\n\n" + _format_messages(messages)

    def _call_groq() -> str:
        client = Groq(api_key=settings.GROQ_API_KEY)
        model = _select_model(client)
        last_exc = None
        for attempt in range(3):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_content},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1,
                    max_tokens=4096,
                    timeout=30.0,
                )
                return response.choices[0].message.content or ""
            except Exception as exc:
                last_exc = exc
                wait = 2 ** attempt
                print(f"  [LLM] Groq error (attempt {attempt+1}/3): {exc}. Retrying in {wait}s...")
                time.sleep(wait)
        print(f"  [LLM] [FAIL] All Groq retries exhausted: {last_exc}")
        return ""

    try:
        raw_text = await asyncio.get_event_loop().run_in_executor(None, _call_groq)
    except Exception as exc:
        print(f"  [LLM] [FAIL] Executor error: {exc}")
        return []

    if not raw_text:
        print("  [LLM] [FAIL] Empty response from Groq.")
        return []

    try:
        parsed = json.loads(raw_text)
        results = parsed.get("commitments", [])
        if not isinstance(results, list):
            print(f"  [LLM] [FAIL] 'commitments' field is not a list: {type(results)}")
            return []
        print(f"  [LLM] [OK] Extracted {len(results)} commitment(s).")
        for i, c in enumerate(results):
            # Redact email from logs to prevent PII exposure during screen-shares
            print(f"    [{i+1}] \"{c.get('description', '')}\" | owner=[redacted] | channel={c.get('source_channel')} | confidence={c.get('confidence')} | due={c.get('due_date')}")
        return results
    except json.JSONDecodeError as exc:
        print(f"  [LLM] [FAIL] Failed to parse JSON: {exc}")
        print(f"  [LLM]   Raw response: {raw_text[:500]}")
        return []