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
    """Zoek naar een tool en gebruik LLM om de officiële naam te extraheren."""
    from langchain_openai import AzureChatOpenAI

    from ..config import settings

    # Stap 1: DuckDuckGo zoekresultaten ophalen
    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(f"{q} software official website", max_results=8))
    except Exception as e:
        logger.error(f"Tool search failed: {e}")
        return [{"name": q.strip(), "url": ""}]

    if not raw_results:
        return [{"name": q.strip(), "url": ""}]

    # Stap 2: Stuur resultaten naar LLM voor naam-extractie
    search_summary = "\n".join(
        f"- Title: {r.get('title', '')} | URL: {r.get('href', '')}"
        for r in raw_results
        if r.get("title") and r.get("href")
    )

    prompt = f"""De gebruiker heeft gezocht op: "{q}"
Dit kan een typo bevatten. Bepaal welke software tool(s) de gebruiker bedoelt.

Zoekresultaten:
{search_summary}

Antwoord ALLEEN met een JSON array. Geen uitleg, geen markdown.
[{{"name": "Toolnaam", "url": "https://website.com"}}]

BELANGRIJK:
- "name" = ALLEEN de korte productnaam. Voorbeelden: "Slack", "Notion", "Zoom", "ChatGPT", "Microsoft Teams", "Google Drive"
- NOOIT titels of beschrijvingen als naam gebruiken (FOUT: "Download Center for Zoom", "Notion Desktop App for Mac & Windows", "Introducing ChatGPT")
- "url" = de homepage van het product (NIET /download, /signin, /pricing)
- Alleen echte, unieke softwareproducten (geen blogposts, reviews, of variaties van dezelfde tool)
- Corrigeer typo's in de zoekopdracht (bijv. "salck" → "Slack")
- 1 tot 3 resultaten"""

    try:
        llm = AzureChatOpenAI(
            azure_deployment=settings.azure_openai_deployment,
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_api_key,
            api_version=settings.azure_openai_api_version,
            temperature=0,
        )
        response = await llm.ainvoke(prompt)
        content = response.content.strip()

        # Parse JSON uit response (kan in markdown code block zitten)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        tools = json.loads(content.strip())
        if isinstance(tools, list) and tools:
            return tools[:3]
    except Exception as e:
        logger.error(f"LLM name extraction failed for '{q}': {e}")

    # Fallback: geef de query zelf terug
    return [{"name": q.strip(), "url": ""}]


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
