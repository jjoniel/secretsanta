import os
from typing import Dict
from email.mime.text import MIMEText
import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def get_gmail_service():
    """Build and return an authorized Gmail API service."""
    creds = None
    token_file = os.getenv("GMAIL_TOKEN_FILE", "token.json")
    credentials_file = os.getenv("GMAIL_CREDENTIALS_FILE", "credentials.json")

    # Check both current directory and parent directory (for token.json in root)
    token_paths = [
        token_file,
        os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), token_file
        ),
        os.path.join(os.path.dirname(os.path.dirname(__file__)), token_file),
    ]

    token_path = None
    for path in token_paths:
        if os.path.exists(path):
            token_path = path
            break

    if token_path:
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Check multiple locations for credentials file
            cred_paths = [
                credentials_file,
                os.path.join(
                    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                    credentials_file,
                ),
                os.path.join(
                    os.path.dirname(os.path.dirname(__file__)), credentials_file
                ),
            ]
            cred_path = None
            for path in cred_paths:
                if os.path.exists(path):
                    cred_path = path
                    break

            if not cred_path:
                raise FileNotFoundError(
                    f"Gmail credentials file not found. Checked: {', '.join(cred_paths)}. "
                    "Please set up Gmail API credentials."
                )

            flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save token to the first available location
        save_path = token_paths[0] if token_path else token_file
        with open(save_path, "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def get_sender_email_from_gmail():
    """Get the authenticated user's email address from Gmail API"""
    try:
        service = get_gmail_service()
        profile = service.users().getProfile(userId="me").execute()
        return profile.get("emailAddress")
    except Exception as e:
        raise ValueError(f"Failed to get sender email from Gmail API: {e}")


def create_message(sender: str, to: str, subject: str, message_text: str) -> Dict:
    """Create a Gmail API raw message from basic fields."""
    mime_message = MIMEText(message_text)
    mime_message["to"] = to
    mime_message["from"] = sender
    mime_message["subject"] = subject

    raw = base64.urlsafe_b64encode(mime_message.as_bytes()).decode()
    return {"raw": raw}


def send_assignments_via_email(assignments: Dict[str, str], sender_email: str = None):
    """
    Send Secret Santa assignments via Gmail API.

    Args:
        assignments: Dict mapping giver_email -> receiver_name
        sender_email: Email address to send from (defaults to authenticated Gmail account)
    """
    # Get sender email from Gmail API if not provided
    if sender_email is None:
        try:
            sender_email = get_sender_email_from_gmail()
        except Exception as e:
            raise ValueError(
                f"Could not determine sender email from Gmail API. Ensure Gmail API is properly configured. Error: {e}"
            )

    service = get_gmail_service()

    for recipient_email, receiver_name in assignments.items():
        body = (
            "Hi!\n\n"
            f"You are the Secret Santa for: {receiver_name}\n\n"
            "Please keep it a secret! 🎄🎅\n"
        )

        message = create_message(
            sender=sender_email,
            to=recipient_email,
            subject="Your Secret Santa Assignment 🎁",
            message_text=body,
        )

        try:
            service.users().messages().send(userId="me", body=message).execute()
        except Exception as e:
            # Log error but continue with other emails
            print(f"Failed to send email to {recipient_email}: {e}")
            raise


def send_test_email(test_email: str, sender_email: str = None):
    """Send a test email to verify Gmail API setup"""
    # Get sender email from Gmail API if not provided
    if sender_email is None:
        try:
            sender_email = get_sender_email_from_gmail()
        except Exception as e:
            raise ValueError(
                f"Could not determine sender email from Gmail API. Ensure Gmail API is properly configured. Error: {e}"
            )

    service = get_gmail_service()

    body = (
        "This is a test email to confirm your Gmail API settings are working.\n\n"
        "If you received this, you're ready to send Secret Santa assignments! 🎅🎄"
    )

    message = create_message(
        sender=sender_email,
        to=test_email,
        subject="Secret Santa Email Test ✔️",
        message_text=body,
    )

    service.users().messages().send(userId="me", body=message).execute()
