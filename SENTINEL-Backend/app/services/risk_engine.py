from datetime import datetime, timezone, timedelta
from math import cos, pi, sin
from app.db import queries
from app.models.schemas import (
    CommitmentOut,
    CommitmentOwnerOut,
    ExecutionScoreOut,
    GraphNodeOut,
    GraphEdgeOut,
    GraphOut,
)

_AVATAR_GRADIENTS = [
    "from-red-400 to-red-600",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-violet-600",
    "from-pink-400 to-rose-500",
    "from-cyan-400 to-sky-500",
    "from-lime-400 to-green-500",
]

def _avatar_gradient(user_id: str | None) -> str:
    safe = user_id if user_id else "unknown"
    index = sum(ord(c) for c in safe) % len(_AVATAR_GRADIENTS)
    return _AVATAR_GRADIENTS[index]

def _classify_risk(due_date_str: str, dependency_count: int) -> str:
    try:
        due = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
    except Exception:
        return "on-track"
    now = datetime.now(timezone.utc)
    hours_left = (due - now).total_seconds() / 3600
    if hours_left <= 24:
        return "at-risk"
    if hours_left <= 72 or dependency_count >= 2:
        return "watch"
    return "on-track"

def _risk_score(risk: str) -> int:
    if risk == "at-risk":
        return 80 + (hash(risk) % 15)
    if risk == "watch":
        return 45 + (hash(risk) % 25)
    return 10 + (hash(risk) % 20)

def build_commitments(rows: list[dict]) -> list[CommitmentOut]:
    result = []
    for row in rows:
        user = row.get("users") or {}
        if not isinstance(user, dict):
            user = {}
        
        user_id = user.get("id") or row.get("owner_id") or "unknown"
        name = user.get("name") or "Unknown User"
        
        if user.get("initials"):
            initials = user["initials"]
        elif name != "Unknown User":
            initials = "".join(p[0].upper() for p in name.split()[:2])
        else:
            initials = "UU"

        gradient = user.get("avatar_gradient") or _avatar_gradient(user_id)
        risk = _classify_risk(row.get("due_date", ""), row.get("dependency_count", 0))
        
        owner = CommitmentOwnerOut(
            name=name,
            initials=initials,
            avatar_gradient=gradient,
        )
        
        result.append(
            CommitmentOut(
                id=row["id"],
                owner=owner,
                description=row.get("description", ""),
                source=row.get("source", "slack"),
                source_channel=row.get("source_channel", ""),
                detected_at=row.get("detected_at", ""),
                due_date=row.get("due_date", ""),
                risk=risk,
                dependency_count=row.get("dependency_count", 0),
                quote=row.get("quote", ""),
                is_critical=row.get("is_critical", False),
            )
        )
    return result

def calculate_execution_score(workspace_id: str) -> ExecutionScoreOut:
    rows = queries.fetch_commitments(workspace_id, resolved=False)
    previous = queries.fetch_previous_execution_score(workspace_id)

    score = 100
    for row in rows:
        risk = _classify_risk(row.get("due_date", ""), row.get("dependency_count", 0))
        if risk == "at-risk":
            score -= 15
        elif risk == "watch":
            score -= 5
    current = max(0, min(100, score))

    if current >= 80:
        status = "stable"
    elif current >= 60:
        status = "watch"
    else:
        status = "at-risk"

    delta = current - previous
    trend = "up" if delta > 0 else "down" if delta < 0 else "flat"

    return ExecutionScoreOut(
        current=current,
        previous=previous,
        status=status,
        trend=trend,
        delta=delta,
    )

def _radial_position(index: int, total: int, cx: float = 450, cy: float = 300, r: float = 220):
    if total <= 1:
        return cx, cy
    angle = (2 * pi * index / total) - (pi / 2)
    return round(cx + r * cos(angle), 1), round(cy + r * sin(angle), 1)

def build_graph(workspace_id: str) -> GraphOut:
    user_rows = queries.fetch_graph_nodes(workspace_id)
    commitment_rows = queries.fetch_commitments(workspace_id, resolved=False)
    edge_rows = queries.fetch_graph_edges(workspace_id)

    user_commitment_map: dict[str, list[dict]] = {}
    for c in commitment_rows:
        owner_id = c.get("owner_id", "unknown")
        user_commitment_map.setdefault(owner_id, []).append(c)

    nodes: list[GraphNodeOut] = []
    total = len(user_rows)
    
    node_id_map = {}

    for i, user in enumerate(user_rows):
        uid = user["id"]
        frontend_id = f"n-{uid[:8]}"
        node_id_map[uid] = frontend_id
        
        commitments = user_commitment_map.get(uid, [])
        risks = [_classify_risk(c.get("due_date", ""), c.get("dependency_count", 0)) for c in commitments]

        if "at-risk" in risks:
            node_status = "at-risk"
        elif "watch" in risks:
            node_status = "watch"
        else:
            node_status = "on-track"

        x, y = _radial_position(i, total)
        if user.get("graph_x") is not None: x = float(user["graph_x"])
        if user.get("graph_y") is not None: y = float(user["graph_y"])

        highest_risk = None
        if commitments:
            at_risk_items = [c for c in commitments if _classify_risk(c.get("due_date", ""), c.get("dependency_count", 0)) == "at-risk"]
            candidate = at_risk_items[0] if at_risk_items else commitments[0]
            highest_risk = candidate.get("description")

        name = user.get("name", "Unknown")
        initials = user.get("initials") or "".join(p[0].upper() for p in name.split()[:2])

        nodes.append(
            GraphNodeOut(
                id=frontend_id,
                initials=initials,
                name=name,
                status=node_status,
                risk_score=_risk_score(node_status),
                x=x,
                y=y,
                commitment_count=len(commitments),
                highest_risk_item=highest_risk,
            )
        )

    edges: list[GraphEdgeOut] = []
    for row in edge_rows:
        f_node = node_id_map.get(row.get("from_node_id"))
        t_node = node_id_map.get(row.get("to_node_id"))
        
        if f_node and t_node:
            edges.append(
                GraphEdgeOut(
                    id=row["id"],
                    from_node_id=f_node,
                    to_node_id=t_node,
                    type=row.get("type", "normal"),
                    label=row.get("label"),
                    commitment_id=row.get("commitment_id"),
                )
            )

    return GraphOut(nodes=nodes, edges=edges)