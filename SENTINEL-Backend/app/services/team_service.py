import uuid
from app.db import queries
from app.models.schemas import TeamMemberOut

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


def _gradient(email: str) -> str:
    return _AVATAR_GRADIENTS[sum(ord(c) for c in email) % len(_AVATAR_GRADIENTS)]


def _initials(name: str) -> str:
    return "".join(p[0].upper() for p in name.split()[:2])


def get_members(workspace_id: str) -> list[TeamMemberOut]:
    rows = queries.fetch_team_members(workspace_id)
    result = []
    for row in rows:
        gradient = row.get("avatar_gradient") or _gradient(row.get("email", ""))
        result.append(
            TeamMemberOut(
                id=row["id"],
                name=row.get("name", ""),
                email=row.get("email", ""),
                initials=row.get("initials") or _initials(row.get("name", "")),
                avatar_gradient=gradient,
                role=row.get("role", "member"),
                status=row.get("status", "active"),
            )
        )
    return result


def invite_member(workspace_id: str, email: str, role: str) -> TeamMemberOut:
    name = email.split("@")[0].replace(".", " ").title()
    member_data = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "initials": _initials(name),
        "avatar_gradient": _gradient(email),
        "role": role,
        "status": "pending",
    }
    row = queries.insert_team_member(workspace_id, member_data)
    return TeamMemberOut(
        id=row.get("id", member_data["id"]),
        name=row.get("name", name),
        email=row.get("email", email),
        initials=row.get("initials", member_data["initials"]),
        avatar_gradient=row.get("avatar_gradient", member_data["avatar_gradient"]),
        role=row.get("role", role),
        status=row.get("status", "pending"),
    )
