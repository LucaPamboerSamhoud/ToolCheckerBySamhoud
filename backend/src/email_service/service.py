import logging

from azure.communication.email import EmailClient

from ..config import settings
from ..models import LeadRequest

logger = logging.getLogger(__name__)


async def send_lead_email(lead: LeadRequest) -> bool:
    """Verstuur een lead notificatie email naar data.team@samhoud.com."""
    if not settings.azure_communication_connection_string:
        logger.warning("Azure Communication Services niet geconfigureerd, email wordt overgeslagen.")
        return False

    try:
        client = EmailClient.from_connection_string(
            settings.azure_communication_connection_string
        )

        message = {
            "senderAddress": settings.azure_communication_sender,
            "recipients": {
                "to": [
                    {"address": settings.lead_email_recipient}
                ]
            },
            "content": {
                "subject": f"Nieuwe lead via ToolChecker: {lead.name} ({lead.company})",
                "html": _build_email_html(lead),
            },
        }

        poller = client.begin_send(message)
        poller.result()
        logger.info(f"Lead email verstuurd voor {lead.name} ({lead.company})")
        return True
    except Exception:
        logger.exception("Fout bij versturen lead email")
        return False


def _build_email_html(lead: LeadRequest) -> str:
    """Bouw de HTML content voor de lead email."""
    return f"""\
<html>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px;">
    <h2 style="color: #0c2aad;">Nieuwe lead via ToolChecker</h2>
    <p>Er is een nieuw compliance rapport gedownload via ToolChecker.</p>
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold; width: 120px;">Naam</td>
            <td style="padding: 10px;">{lead.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Email</td>
            <td style="padding: 10px;"><a href="mailto:{lead.email}">{lead.email}</a></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Bedrijf</td>
            <td style="padding: 10px;">{lead.company}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Functie</td>
            <td style="padding: 10px;">{lead.function}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Gecheckte tool</td>
            <td style="padding: 10px;">{lead.tool_name}</td>
        </tr>
    </table>
    <p style="color: #666; font-size: 12px;">
        Dit bericht is automatisch verstuurd door ToolChecker by &amp;samhoud.
    </p>
</body>
</html>"""
