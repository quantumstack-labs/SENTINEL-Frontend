import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.db import queries
from app.integrations import llm_client
from app.config import settings

async def fetch_recent_emails(token: str) -> list[dict]:
    creds = Credentials(token)
    service = build('gmail', 'v1', credentials=creds)
    results = service.users().messages().list(userId='me', maxResults=10, q="label:INBOX").execute()
    messages = results.get('messages', [])
    email_data = []
    for msg in messages:
        m = service.users().messages().get(userId='me', id=msg['id']).execute()
        payload = m.get('payload', {})
        parts = payload.get('parts', [])
        body = ""
        if not parts:
            body = payload.get('body', {}).get('data', '')
        else:
            for part in parts:
                if part.get('mimeType') == 'text/plain':
                    body = part.get('body', {}).get('data', '')
                    break
        if body:
            decoded_body = base64.urlsafe_b64decode(body).decode('utf-8')
            email_data.append({
                "id": msg['id'],
                "snippet": m.get('snippet', ''),
                "body": decoded_body,
                "source": "gmail"
            })
    return email_data

async def scan_emails_for_commitments(workspace_id: str):
    rows = queries.fetch_integrations(workspace_id)
    gmail_int = next((r for r in rows if r["id"] == "gmail"), None)
    if not gmail_int or gmail_int.get("status") != "connected":
        return
    token = gmail_int.get("gmail_access_token")
    if not token:
        return
    emails = await fetch_recent_emails(token)
    if not emails:
        return
    extracted = await llm_client.extract_commitments(emails)
    for item in extracted:
        queries.upsert_commitment(workspace_id, item)
