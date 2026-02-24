from datetime import datetime, timezone
from app.db import queries
from app.models.schemas import NudgeOut, ResolveOut
from app.services import risk_engine

def create_commitment(workspace_id: str, data: dict):
    owner_email = data.get("owner_email")
    normalized_email = owner_email.strip().lower() if owner_email else None
    user = queries.fetch_user_by_email(normalized_email) if normalized_email else None
    
    db_payload = {
        "description": data.get("description"),
        "quote": data.get("quote"),
        "owner_id": user["id"] if user else None,
        "owner_name": data.get("owner_name") or "Unknown",
        "due_date": data.get("due_date"),
        "confidence": data.get("confidence", 0.85),
        "source": data.get("source", "github"),
        "source_channel": data.get("source_channel"),
        "external_ref": data.get("external_ref"),
        "resolved": False
    }
    
    return queries.upsert_commitment(workspace_id, db_payload)

def get_commitments(workspace_id: str):
    rows = queries.fetch_commitments(workspace_id, resolved=False)
    return risk_engine.build_commitments(rows)


def send_nudge(commitment_id: str, workspace_id: str) -> NudgeOut:
    rows = queries.fetch_commitments(workspace_id)
    target = next((r for r in rows if r["id"] == commitment_id), None)
    owner_name = "the owner"
    if target:
        user = target.get("users") or {}
        owner_name = user.get("name", owner_name)
    queries.insert_notification(
        workspace_id,
        {
            "title": "Nudge Sent",
            "description": f"A nudge was sent to {owner_name} regarding commitment {commitment_id}.",
            "type": "info",
            "unread": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    return NudgeOut(message=f"Nudge sent to {owner_name}")


def resolve_alert(commitment_id: str, workspace_id: str) -> ResolveOut:
    queries.mark_commitment_resolved(commitment_id)
    return ResolveOut(resolved=True)
