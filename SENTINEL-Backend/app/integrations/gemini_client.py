import asyncio
import json
from google import genai
from google.genai import types
from pydantic import BaseModel
from app.config import settings


class ExtractedCommitment(BaseModel):
    quote: str
    description: str
    owner_name: str
    due_date: str
    confidence: float
    source: str


async def extract_commitments(messages: list[str]) -> list[dict]:
    if not messages:
        print("  [Gemini] No messages to process — skipping.")
        return []

    print(f"  [Gemini] Sending {len(messages)} messages to Gemini for commitment extraction...")

    prompt = f"""You are Sentinel, an AI that extracts execution commitments from team communications.
Analyze the following messages and extract any commitments (promises to deliver something by a specific time).
Ignore sarcasm and casual language. Only extract high-confidence commitments.
For due_date, use ISO 8601 format (e.g. 2026-03-01T00:00:00Z). If no date is mentioned, estimate based on context or use 7 days from now.
For source, use one of: slack, email, meeting.

Messages:
{json.dumps(messages, indent=2)}
"""

    def _call_gemini() -> str:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=list[ExtractedCommitment],
                temperature=0.1,
            ),
        )
        return response.text or ""

    raw_text = await asyncio.get_event_loop().run_in_executor(None, _call_gemini)

    if not raw_text:
        print("  [Gemini] [FAIL] Empty response from Gemini.")
        return []

    try:
        results = json.loads(raw_text)
        print(f"  [Gemini] [OK] Extracted {len(results)} commitment(s).")
        for i, c in enumerate(results):
            print(f"    [{i+1}] \"{c.get('description', '')}\" | owner={c.get('owner_name')} | confidence={c.get('confidence')} | due={c.get('due_date')}")
        return results
    except json.JSONDecodeError as exc:
        print(f"  [Gemini] [FAIL] Failed to parse JSON response: {exc}")
        print(f"  [Gemini]   Raw response was: {raw_text[:500]}")
        return []