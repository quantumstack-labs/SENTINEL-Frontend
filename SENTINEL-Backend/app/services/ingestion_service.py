import uuid
from datetime import datetime, timezone, timedelta
from app.db import queries
from app.integrations import llm_client, slack_client, gmail_client
from app.services import risk_engine
from app.config import settings


def _sanitize_extraction(item: dict) -> dict:
    """Validate and fix LLM output fields before DB insert."""
    # Confidence: must be a float 0.0–1.0
    conf = item.get("confidence", 0.85)
    try:
        conf = float(conf)
        if not (0.0 <= conf <= 1.0):
            conf = 0.85
    except (TypeError, ValueError):
        conf = 0.85
    item["confidence"] = conf

    # Due date: must be valid ISO 8601
    raw_date = item.get("due_date", "")
    if raw_date:
        try:
            datetime.fromisoformat(str(raw_date).replace("Z", "+00:00"))
        except (ValueError, TypeError):
            item["due_date"] = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    else:
        item["due_date"] = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

    # Owner email: normalize and provide fallback
    email = item.get("owner_email", "")
    item["owner_email"] = str(email).strip().lower() if email else "unknown@unknown.com"

    # Description: non-empty string
    item["description"] = str(item.get("description", "")).strip() or "Untitled commitment"

    return item

async def run_full_pipeline():
    print("\n" + "="*60)
    print("  SENTINEL PIPELINE — STARTING")
    print("="*60)

    workspaces = _get_active_workspaces()
    print(f"[Pipeline] Found {len(workspaces)} workspace(s) to process.")

    if not workspaces:
        print("[Pipeline] No workspaces found. Is the database seeded? Exiting.")
        return

    for workspace in workspaces:
        workspace_id = workspace["id"]
        workspace_name = workspace.get("name", workspace_id)
        print(f"\n[Pipeline] ── Processing workspace: '{workspace_name}' ({workspace_id})")
        await _run_for_workspace(workspace_id, workspace)

    print("\n" + "="*60)
    print("  SENTINEL PIPELINE — COMPLETE")
    print("="*60 + "\n")

def _get_active_workspaces() -> list[dict]:
    from app.db.client import get_supabase
    sb = get_supabase()
    result = sb.table("workspaces").select("id, name, risk_confidence_threshold").execute()
    return result.data or []

def _get_connected_integrations(workspace_id: str) -> dict:
    rows = queries.fetch_integrations(workspace_id)
    return {r["id"]: r for r in rows if r.get("status") == "connected"}

def _build_email_index(workspace_id: str) -> dict[str, str]:
    members = queries.fetch_team_members(workspace_id)
    index = {}
    for m in members:
        email = (m.get("email") or "").strip().lower()
        if email:
            index[email] = m["id"]
    print(f"  [Pipeline] Built email→user_id index: {len(index)} member(s) — {list(index.keys())}")
    return index

def _resolve_owner_id(owner_email: str | None, email_index: dict[str, str]) -> str | None:
    if not owner_email:
        return None
    normalized = owner_email.strip().lower()
    user_id = email_index.get(normalized)
    if user_id:
        print(f"  [Pipeline] ✓ Matched owner email '{normalized}' → user_id {user_id}")
    else:
        print(f"  [Pipeline] ✗ No DB user found for email '{normalized}' — owner_id will be None")
    return user_id

async def _run_for_workspace(workspace_id: str, workspace: dict):
    started_at = datetime.now(timezone.utc).isoformat()

    integrations = _get_connected_integrations(workspace_id)
    print(f"  [Pipeline] Connected integrations: {list(integrations.keys()) or 'None'}")

    if not integrations:
        print("  [Pipeline] No connected integrations — nothing to fetch.")
        return

    email_index = _build_email_index(workspace_id)
    messages: list = []

    slack_int = integrations.get("slack")
    if slack_int:
        print("  [Pipeline] Fetching Slack messages...")
        token = slack_int.get("slack_bot_token") or settings.SLACK_BOT_TOKEN
        channels = slack_int.get("channels") or []
        print(f"  [Pipeline] Slack bot token present: {bool(token)} | Channels configured: {channels}")
        slack_messages = await slack_client.fetch_recent_messages(token, channels)
        print(f"  [Pipeline] Slack returned {len(slack_messages)} message(s).")
        messages.extend(slack_messages)
    else:
        print("  [Pipeline] Slack not connected — skipping.")

    gmail_int = integrations.get("gmail")
    if gmail_int:
        print("  [Pipeline] Fetching Gmail messages...")
        gmail_token = gmail_int.get("gmail_access_token", "")
        gmail_messages = await gmail_client.fetch_recent_emails(gmail_token)
        print(f"  [Pipeline] Gmail returned {len(gmail_messages)} message(s).")
        messages.extend(gmail_messages)
    else:
        print("  [Pipeline] Gmail not connected — skipping.")

    print(f"\n  [Pipeline] Total messages to analyze: {len(messages)}")

    new_saved = 0
    new_skipped = 0

    if not messages:
        print("  [Pipeline] No messages collected — skipping LLM extraction.")
    else:
        print("  [Pipeline] Sending to LLM for commitment extraction...")
        extracted = await llm_client.extract_commitments(messages)
        threshold = 0.0
        print(f"  [Pipeline] Confidence threshold: {threshold:.0%} (override: saving all extractions) | Raw extractions: {len(extracted)}")

        for item in extracted:
            item = _sanitize_extraction(item)
            confidence = item.get("confidence", 0)
            description = item.get("description", "")

            if confidence < threshold:
                print(f"  [Pipeline] ↓ Skipping (confidence {confidence:.0%} < threshold): \"{description[:60]}\"")
                new_skipped += 1
                continue

            owner_email = item.get("owner_email", "")
            owner_id = _resolve_owner_id(owner_email, email_index)

            commitment_data = {
                "id": str(uuid.uuid4()),
                "description": description,
                "owner_id": owner_id,
                "source": item.get("source", "slack"),
                "source_channel": item.get("source_channel", "unknown"),
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "due_date": item.get("due_date", datetime.now(timezone.utc).isoformat()),
                "risk": "watch",
                "dependency_count": 0,
                "quote": item.get("quote", ""),
                "is_critical": False,
                "resolved": False,
            }

            print(f"  [Pipeline] ✓ Saving: \"{description[:60]}\" (owner_id={owner_id})")
            print("  [Pipeline]   Writing to Supabase...")
            queries.upsert_commitment(workspace_id, commitment_data)
            new_saved += 1

    print(f"\n  [Pipeline] Summary: {new_saved} saved, {new_skipped} skipped.")

    print("  [Pipeline] Recalculating execution score...")
    score_obj = risk_engine.calculate_execution_score(workspace_id)
    print(f"  [Pipeline] Execution score: {score_obj.current}")

    queries.save_pipeline_run(
        workspace_id,
        {
            "id": str(uuid.uuid4()),
            "status": "completed",
            "execution_score": score_obj.current,
            "started_at": started_at,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "error": None,
        },
    )

    if new_saved > 0:
        print("  [Pipeline] Inserting activity notification...")
        queries.insert_notification(
            workspace_id,
            {
                "id": str(uuid.uuid4()),
                "title": "New Commitments Detected",
                "description": f"Sentinel extracted {new_saved} new commitment(s) from your integrations.",
                "type": "signal",
                "unread": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )

    print(f"  [Pipeline] ✓ Workspace '{workspace.get('name')}' done.")