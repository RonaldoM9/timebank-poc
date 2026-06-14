#!/usr/bin/env python3
"""Refresh Google OAuth token and upload to Drive."""
import json, sys
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

TOKEN_PATH = "/root/.hermes/google_token.json"
FILE_PATH = "/root/projects/timebank-poc/TimeHeroes - MBA Pitch Deck.pptx"
FOLDER_ID = "1WUgeME62NoZNGAOvco2TqUtX2cJDzo9n"

with open(TOKEN_PATH) as f:
    token_data = json.load(f)

print("Token loaded")
print("  Has refresh:", bool(token_data.get("refresh_token")))
print("  Scopes:", token_data.get("scopes", []))

creds = Credentials.from_authorized_user_info(token_data)

if creds.expired and creds.refresh_token:
    print("Refreshing expired token...")
    try:
        creds.refresh(Request())
        print("Token refreshed!")
        token_data["token"] = creds.token
        if creds.expiry:
            token_data["expiry"] = creds.expiry.isoformat()
        with open(TOKEN_PATH, "w") as f:
            json.dump(token_data, f, indent=2)
    except Exception as e:
        print("Refresh failed:", e)
        sys.exit(1)

print("Uploading to Drive...")
service = build("drive", "v3", credentials=creds)
media = MediaFileUpload(FILE_PATH, mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation")
result = service.files().create(
    body={"name": "TimeHeroes - MBA Pitch Deck.pptx", "parents": [FOLDER_ID]},
    media_body=media,
    fields="id,name,webViewLink"
).execute()

print("Uploaded!")
print("ID:", result.get("id"))
print("Link:", result.get("webViewLink"))
