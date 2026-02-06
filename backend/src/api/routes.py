import json
import logging

from ddgs import DDGS
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from ..agent.graph import run_compliance_check
from ..email_service.service import send_lead_email
from ..models import (
    CheckRequest,
    ComplianceResult,
    LeadRequest,
    ProgressUpdate,
)
from ..report.generator import generate_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# In-memory opslag van recente resultaten (simpel, geen database)
_recent_results: dict[str, ComplianceResult] = {}


@router.get("/search-tool")
async def search_tool(q: str = Query(..., min_length=1, max_length=100)):
    """Zoek naar een tool om te bevestigen welke de gebruiker bedoelt."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(f"{q} software official site", max_results=5))
    except Exception as e:
        logger.error(f"Tool search failed: {e}")
        return []

    return [
        {
            "name": r.get("title", ""),
            "url": r.get("href", ""),
            "description": r.get("body", ""),
        }
        for r in results
        if r.get("href")
    ]


@router.post("/check")
async def check_tool(request: CheckRequest):
    """Start een compliance check met SSE streaming voor voortgang."""

    async def event_generator():
        result = None
        async for update in run_compliance_check(request.tool_name):
            if isinstance(update, ProgressUpdate):
                yield {
                    "event": "progress",
                    "data": update.model_dump_json(),
                }
            elif isinstance(update, ComplianceResult):
                result = update
                # Sla resultaat op voor rapport generatie
                _recent_results[request.tool_name.lower()] = result
                yield {
                    "event": "result",
                    "data": result.model_dump_json(),
                }

        if result is None:
            yield {
                "event": "error",
                "data": json.dumps({"error": "Geen resultaat ontvangen"}),
            }

    return EventSourceResponse(event_generator())


@router.post("/report")
async def generate_report_endpoint(request: CheckRequest):
    """Genereer een Word rapport voor een eerder uitgevoerde check."""
    result = _recent_results.get(request.tool_name.lower())
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Geen check resultaat gevonden voor deze tool. Voer eerst een check uit.",
        )

    buffer = generate_report(result)

    filename = f"compliance-rapport-{result.tool_name.lower().replace(' ', '-')}.docx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/lead")
async def submit_lead(request: LeadRequest):
    """Verwerk een lead en verstuur email notificatie."""
    success = await send_lead_email(request)

    if not success:
        logger.warning(f"Lead email kon niet verstuurd worden voor {request.name}")
        # We geven toch een 200 terug — de lead mag het rapport downloaden
        # ook als de email faalt

    return {"status": "ok", "email_sent": success}
