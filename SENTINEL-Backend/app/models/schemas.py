from __future__ import annotations
from datetime import datetime
from typing import Any, Generic, Literal, Optional, TypeVar
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


T = TypeVar("T")


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class Meta(BaseModel):
    timestamp: str
    version: str = "1.0"


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    meta: Meta


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    meta: Meta


class CommitmentOwnerOut(CamelModel):
    name: str
    initials: str
    avatar_gradient: str


class CommitmentOut(CamelModel):
    id: str
    owner: CommitmentOwnerOut
    description: str
    source: Literal["slack", "email", "meeting", "github"]
    source_channel: str
    detected_at: str
    due_date: str
    risk: Literal["at-risk", "watch", "on-track"]
    dependency_count: int
    quote: str
    is_critical: bool


class ExecutionScoreOut(CamelModel):
    current: int
    previous: int
    status: Literal["stable", "watch", "at-risk"]
    trend: Literal["up", "down", "flat"]
    delta: int


class GraphNodeOut(CamelModel):
    id: str
    initials: str
    name: str
    status: Literal["at-risk", "watch", "on-track"]
    risk_score: int
    x: float
    y: float
    commitment_count: int
    highest_risk_item: Optional[str] = None


class GraphEdgeOut(CamelModel):
    id: str
    from_node_id: str
    to_node_id: str
    type: Literal["normal", "blocked"]
    label: Optional[str] = None
    commitment_id: Optional[str] = None


class GraphOut(BaseModel):
    nodes: list[GraphNodeOut]
    edges: list[GraphEdgeOut]


class IntegrationOut(CamelModel):
    id: str
    name: str
    icon: str
    status: Literal["connected", "disconnected", "enterprise"]
    connected_account: Optional[str] = None
    channels: Optional[list[str]] = None
    last_synced: Optional[str] = None
    description: str


class TeamMemberOut(CamelModel):
    id: str
    name: str
    email: str
    initials: str
    avatar_gradient: str
    role: Literal["admin", "member", "observer"]
    status: Literal["active", "pending"]


class NotificationOut(CamelModel):
    id: str
    title: str
    description: str
    time: str
    type: Literal["signal", "risk", "info"]
    unread: bool


class NotificationSettingsIn(CamelModel):
    critical_risks: bool = True
    daily_brief: bool = True
    new_dependencies: bool = False


class WorkspaceSettingsOut(CamelModel):
    workspace_name: str
    timezone: str
    risk_confidence_threshold: int
    include_draft_prs: bool
    notifications: NotificationSettingsIn


class WorkspaceSettingsIn(CamelModel):
    workspace_name: Optional[str] = None
    timezone: Optional[str] = None
    risk_confidence_threshold: Optional[int] = None
    include_draft_prs: Optional[bool] = None
    notifications: Optional[NotificationSettingsIn] = None


class InviteMemberIn(CamelModel):
    email: str
    role: Literal["admin", "member", "observer"] = "member"


class LoginIn(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    refresh_token: str


class NudgeOut(CamelModel):
    message: str


class ResolveOut(BaseModel):
    resolved: bool


class PipelineStatusOut(BaseModel):
    status: str
