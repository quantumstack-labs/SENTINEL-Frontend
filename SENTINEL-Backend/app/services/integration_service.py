from app.db import queries
from app.models.schemas import IntegrationOut
from app.config import settings


def get_integrations(workspace_id: str) -> list[IntegrationOut]:
    rows = queries.fetch_integrations(workspace_id)
    result = []
    for row in rows:
        result.append(
            IntegrationOut(
                id=row["id"],
                name=row.get("name", ""),
                icon=row.get("icon", row["id"]),
                status=row.get("status", "disconnected"),
                connected_account=row.get("connected_account"),
                channels=row.get("channels"),
                last_synced=row.get("last_synced_at"),
                description=row.get("description", ""),
            )
        )
    return result


def _discover_slack_channels(token: str) -> list[str]:
    try:
        from slack_sdk import WebClient
        from slack_sdk.errors import SlackApiError

        client = WebClient(token=token)
        print("[Slack Connect] Calling conversations_list to discover channels...")

        channel_ids: list[str] = []
        cursor = None

        while True:
            kwargs = {"types": "public_channel,private_channel", "limit": 200}
            if cursor:
                kwargs["cursor"] = cursor

            response = client.conversations_list(**kwargs)

            for ch in response.get("channels", []):
                if ch.get("is_member"):
                    channel_ids.append(ch["id"])
                    print(f"  [Slack Connect] ✓ Bot is a member of: #{ch.get('name')} ({ch['id']})")

            next_cursor = response.get("response_metadata", {}).get("next_cursor", "")
            if not next_cursor:
                break
            cursor = next_cursor

        if not channel_ids:
            print("[Slack Connect] ⚠ Bot is not a member of any channels.")
            print("  → In Slack, go to any channel and type: /invite @YourBotName")
            print("  → Then reconnect from the Integrations page.")

        print(f"[Slack Connect] Discovered {len(channel_ids)} channel(s): {channel_ids}")
        return channel_ids

    except Exception as exc:
        print(f"[Slack Connect] ✗ Channel discovery failed: {type(exc).__name__}: {exc}")
        return []


def connect_integration(integration_id: str, workspace_id: str, credentials: dict) -> IntegrationOut:
    extra: dict = {
        "connected_account": credentials.get("account_name", ""),
    }

    if integration_id == "slack":
        token = credentials.get("token") or settings.SLACK_BOT_TOKEN
        if token:
            extra["slack_bot_token"] = token
            channel_ids = _discover_slack_channels(token)
            extra["channels"] = channel_ids
        else:
            print("[Slack Connect] ✗ No SLACK_BOT_TOKEN found in credentials or .env — cannot auto-discover channels.")

    row = queries.update_integration_status(workspace_id, integration_id, "connected", extra)
    return IntegrationOut(
        id=row.get("id", integration_id),
        name=row.get("name", ""),
        icon=row.get("icon", integration_id),
        status="connected",
        connected_account=row.get("connected_account"),
        channels=row.get("channels"),
        last_synced=row.get("last_synced_at"),
        description=row.get("description", ""),
    )


def disconnect_integration(integration_id: str, workspace_id: str) -> dict:
    queries.update_integration_status(
        workspace_id,
        integration_id,
        "disconnected",
        {"connected_account": None, "slack_bot_token": None, "channels": None},
    )
    return {"disconnected": True}


def _get_slack_token(workspace_id: str) -> str:
    """Load the saved Slack bot token for this workspace from the DB."""
    rows = queries.fetch_integrations(workspace_id)
    slack_row = next((r for r in rows if r.get("id") == "slack"), None)
    if not slack_row or slack_row.get("status") != "connected":
        raise ValueError("Slack is not connected for this workspace")
    token = slack_row.get("slack_bot_token") or settings.SLACK_BOT_TOKEN
    if not token:
        raise ValueError("No Slack bot token found — please reconnect Slack")
    return token


def fetch_slack_channels(workspace_id: str) -> list[dict]:
    """Fetch all channels the bot can see from the workspace's Slack."""
    token = _get_slack_token(workspace_id)

    try:
        from slack_sdk import WebClient
        client = WebClient(token=token)

        channels: list[dict] = []
        cursor = None

        while True:
            kwargs = {"types": "public_channel,private_channel", "limit": 200}
            if cursor:
                kwargs["cursor"] = cursor

            response = client.conversations_list(**kwargs)

            for ch in response.get("channels", []):
                channels.append({
                    "id": ch["id"],
                    "name": ch.get("name", "unnamed"),
                    "is_private": ch.get("is_private", False),
                    "is_member": ch.get("is_member", False),
                    "num_members": ch.get("num_members", 0),
                })

            next_cursor = response.get("response_metadata", {}).get("next_cursor", "")
            if not next_cursor:
                break
            cursor = next_cursor

        print(f"[Slack Channels] Found {len(channels)} channel(s) for workspace {workspace_id}")
        return channels

    except ValueError:
        raise
    except Exception as exc:
        print(f"[Slack Channels] ✗ Failed to fetch: {type(exc).__name__}: {exc}")
        raise ValueError(f"Failed to fetch Slack channels: {exc}")


def save_slack_channels(workspace_id: str, channel_ids: list[str]) -> dict:
    """Save admin's selected channel IDs to the integrations table."""
    queries.update_integration_status(
        workspace_id,
        "slack",
        "connected",
        {"channels": channel_ids},
    )
    print(f"[Slack Channels] ✓ Saved {len(channel_ids)} channel(s) for workspace {workspace_id}: {channel_ids}")
    return {"saved": True, "channel_count": len(channel_ids)}

