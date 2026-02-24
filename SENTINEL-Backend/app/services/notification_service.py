from datetime import datetime, timezone, timedelta
from app.db import queries
from app.models.schemas import NotificationOut


def _humanize(created_at_str: str) -> str:
    try:
        dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
        diff = datetime.now(timezone.utc) - dt
        s = int(diff.total_seconds())
        if s < 60:
            return f"{s}s ago"
        m = s // 60
        if m < 60:
            return f"{m}m ago"
        h = m // 60
        if h < 24:
            return f"{h}h ago"
        return f"{h // 24}d ago"
    except Exception:
        return "just now"


def get_notifications(workspace_id: str, user_id: str | None = None) -> list[NotificationOut]:
    rows = queries.fetch_notifications(workspace_id, user_id)
    result = []
    for row in rows:
        result.append(
            NotificationOut(
                id=row["id"],
                title=row.get("title", ""),
                description=row.get("description", ""),
                time=_humanize(row.get("created_at", "")),
                type=row.get("type", "info"),
                unread=row.get("unread", False),
            )
        )
    return result


def mark_all_read(workspace_id: str, user_id: str | None = None) -> dict:
    count = queries.mark_all_notifications_read(workspace_id, user_id)
    return {"updated": count}
