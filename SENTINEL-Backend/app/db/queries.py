from app.db.client import get_supabase


def fetch_commitments(workspace_id: str, resolved: bool = False) -> list[dict]:
    sb = get_supabase()
    query = (
        sb.table("commitments")
        .select("*, users:owner_id(id, name, email, initials, avatar_gradient, role, status)")
        .eq("workspace_id", workspace_id)
        .eq("resolved", resolved)
        .order("due_date", desc=False)
    )
    result = query.execute()
    return result.data or []


def fetch_team_members(workspace_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("users")
        .select("*")
        .eq("workspace_id", workspace_id)
        .execute()
    )
    return result.data or []


def fetch_graph_nodes(workspace_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("users")
        .select("id, name, initials, avatar_gradient, graph_x, graph_y")
        .eq("workspace_id", workspace_id)
        .execute()
    )
    return result.data or []


def fetch_graph_edges(workspace_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("graph_edges")
        .select("*")
        .eq("workspace_id", workspace_id)
        .execute()
    )
    return result.data or []


def fetch_integrations(workspace_id: str) -> list[dict]:
    sb = get_supabase()
    result = (
        sb.table("integrations")
        .select("*")
        .eq("workspace_id", workspace_id)
        .execute()
    )
    return result.data or []


def fetch_notifications(workspace_id: str, user_id: str | None = None) -> list[dict]:
    sb = get_supabase()
    query = (
        sb.table("notifications")
        .select("*")
        .eq("workspace_id", workspace_id)
        .order("created_at", desc=True)
        .limit(30)
    )
    if user_id:
        query = query.eq("user_id", user_id)
    result = query.execute()
    return result.data or []


def fetch_workspace_settings(workspace_id: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table("workspaces")
        .select("*")
        .eq("id", workspace_id)
        .single()
        .execute()
    )
    return result.data


def fetch_user_by_email(email: str) -> dict | None:
    sb = get_supabase()
    result = (
        sb.table("users")
        .select("*")
        .ilike("email", email)
        .maybe_single()
        .execute()
    )
    return result.data


def fetch_previous_execution_score(workspace_id: str) -> int:
    sb = get_supabase()
    result = (
        sb.table("pipeline_runs")
        .select("execution_score")
        .eq("workspace_id", workspace_id)
        .eq("status", "completed")
        .order("completed_at", desc=True)
        .limit(2)
        .execute()
    )
    rows = result.data or []
    if len(rows) >= 2:
        return rows[1].get("execution_score", 100)
    return 100


def upsert_commitment(workspace_id: str, data: dict) -> dict:
    sb = get_supabase()
    data["workspace_id"] = workspace_id
    result = (
        sb.table("commitments")
        .upsert(data, on_conflict="workspace_id,quote")
        .execute()
    )
    return result.data[0] if result.data else {}


def mark_commitment_resolved(commitment_id: str) -> None:
    sb = get_supabase()
    sb.table("commitments").update({"resolved": True}).eq("id", commitment_id).execute()


def update_workspace_settings(workspace_id: str, data: dict) -> dict:
    sb = get_supabase()
    result = (
        sb.table("workspaces")
        .update(data)
        .eq("id", workspace_id)
        .execute()
    )
    return result.data[0] if result.data else {}


def insert_notification(workspace_id: str, data: dict) -> dict:
    sb = get_supabase()
    data["workspace_id"] = workspace_id
    result = sb.table("notifications").insert(data).execute()
    return result.data[0] if result.data else {}


def mark_all_notifications_read(workspace_id: str, user_id: str | None = None) -> int:
    sb = get_supabase()
    query = sb.table("notifications").update({"unread": False}).eq("workspace_id", workspace_id)
    if user_id:
        query = query.eq("user_id", user_id)
    result = query.execute()
    return len(result.data or [])


def update_integration_status(
    workspace_id: str,
    integration_id: str,
    status: str,
    extra: dict | None = None,
) -> dict:
    sb = get_supabase()
    payload = {"status": status}
    if extra:
        payload.update(extra)
    result = (
        sb.table("integrations")
        .update(payload)
        .eq("workspace_id", workspace_id)
        .eq("id", integration_id)
        .execute()
    )
    return result.data[0] if result.data else {}


def insert_team_member(workspace_id: str, data: dict) -> dict:
    sb = get_supabase()
    data["workspace_id"] = workspace_id
    result = sb.table("users").insert(data).execute()
    return result.data[0] if result.data else {}


def save_pipeline_run(workspace_id: str, data: dict) -> None:
    sb = get_supabase()
    data["workspace_id"] = workspace_id
    sb.table("pipeline_runs").insert(data).execute()
