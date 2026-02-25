from datetime import datetime, timezone, timedelta
import asyncio
import httpx

_email_cache: dict[str, str] = {}
_channel_cache: dict[str, str] = {}

# Slack API errors that mean the token is permanently dead
_FATAL_TOKEN_ERRORS = {"token_revoked", "invalid_auth", "account_inactive", "token_expired"}


async def _resolve_email(client: httpx.AsyncClient, bot_token: str, slack_user_id: str) -> str:
    if slack_user_id in _email_cache:
        return _email_cache[slack_user_id]

    for attempt in range(3):
        try:
            response = await client.get(
                "https://slack.com/api/users.info",
                headers={"Authorization": f"Bearer {bot_token}"},
                params={"user": slack_user_id},
                timeout=10.0,
            )
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 5))
                print(f"  [Slack] Rate limited resolving user. Retrying in {retry_after}s (attempt {attempt+1}/3)")
                await asyncio.sleep(retry_after)
                continue

            data = response.json()
            if data.get("ok"):
                email = data.get("user", {}).get("profile", {}).get("email", "")
                if email:
                    _email_cache[slack_user_id] = email
                    return email
            else:
                print(f"  [Slack] Could not resolve user: {data.get('error')}")
            break  # Non-429 response, stop retrying
        except Exception as exc:
            print(f"  [Slack] users.info error: {exc}")
            break

    _email_cache[slack_user_id] = ""
    return ""


async def _resolve_channel_name(client: httpx.AsyncClient, bot_token: str, channel_id: str) -> str:
    if channel_id in _channel_cache:
        return _channel_cache[channel_id]
    
    try:
        response = await client.get(
            "https://slack.com/api/conversations.info",
            headers={"Authorization": f"Bearer {bot_token}"},
            params={"channel": channel_id},
            timeout=10.0,
        )
        data = response.json()
        if data.get("ok"):
            name = data.get("channel", {}).get("name", channel_id)
            _channel_cache[channel_id] = name
            return name
    except Exception:
        pass
    
    _channel_cache[channel_id] = channel_id
    return channel_id


async def fetch_recent_messages(
    bot_token: str,
    channels: list[str],
    since_hours: int = 24,
    workspace_id: str | None = None,
) -> list[dict]:
    if not bot_token:
        print("  [Slack] ERROR: No bot token provided — skipping Slack fetch.")
        return []

    oldest = (datetime.now(timezone.utc) - timedelta(hours=since_hours)).timestamp()
    messages: list[dict] = []

    print(f"  [Slack] Fetching messages from {len(channels)} channel(s) since {since_hours}h ago...")

    if not channels:
        print("  [Slack] WARNING: No channels configured for this integration.")
        return []

    async with httpx.AsyncClient() as client:
        for channel_id in channels:
            print(f"  [Slack] → Requesting history for channel: {channel_id}")
            channel_name = await _resolve_channel_name(client, bot_token, channel_id)
            
            try:
                response = await client.get(
                    "https://slack.com/api/conversations.history",
                    headers={"Authorization": f"Bearer {bot_token}"},
                    params={"channel": channel_id, "oldest": oldest, "limit": 200},
                    timeout=15.0,
                )
                data = response.json()
                if data.get("ok"):
                    raw = data.get("messages", [])
                    human = [m for m in raw if m.get("text", "").strip() and not m.get("bot_id") and m.get("user")]
                    print(f"  [Slack] [OK] Channel '{channel_name}': {len(raw)} total, {len(human)} human messages.")
                    for msg in human:
                        slack_user_id = msg.get("user", "")
                        author_email = await _resolve_email(client, bot_token, slack_user_id) if slack_user_id else ""
                        messages.append({
                            "text": msg["text"].strip(),
                            "author_email": author_email,
                            "channel": channel_name,
                        })
                else:
                    error = data.get("error", "unknown_error")
                    print(f"  [Slack] [FAIL] Channel '{channel_id}' error: {error}")

                    # --- VULN-06 FIX: auto-disconnect on fatal token errors ---
                    if error in _FATAL_TOKEN_ERRORS:
                        print(f"  [Slack] Fatal token error '{error}' — marking integration as disconnected.")
                        if workspace_id:
                            from app.db import queries
                            queries.update_integration_status(workspace_id, "slack", "disconnected", {
                                "slack_bot_token": None,
                                "connected_account": None,
                            })
                        return []  # No point continuing with other channels

                    if error == "not_in_channel":
                        print("  [Slack]   → Invite the bot: /invite @YourBotName")
                    elif error == "channel_not_found":
                        print("  [Slack]   → Use channel ID (e.g. C01234567), not the name.")
            except httpx.TimeoutException:
                print(f"  [Slack] [FAIL] Channel '{channel_id}' timed out after 15s.")
            except Exception as exc:
                print(f"  [Slack] [FAIL] Channel '{channel_id}' unexpected error: {type(exc).__name__}: {exc}")

    print(f"  [Slack] Done. Total messages collected: {len(messages)}")
    return messages

