import json
from collections.abc import AsyncGenerator

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import AzureChatOpenAI
from langgraph.prebuilt import create_react_agent

from ..config import settings
from ..models import ComplianceResult, ProgressUpdate
from .prompts import SYSTEM_PROMPT
from .tools import TOOLS

_llm = AzureChatOpenAI(
    azure_deployment=settings.azure_openai_deployment,
    azure_endpoint=settings.azure_openai_endpoint,
    api_key=settings.azure_openai_api_key,
    api_version=settings.azure_openai_api_version,
    temperature=0.1,
)

_agent = create_react_agent(
    model=_llm,
    tools=TOOLS,
)


async def run_compliance_check(
    tool_name: str,
) -> AsyncGenerator[ProgressUpdate | ComplianceResult, None]:
    """Voer een compliance check uit voor een tool.

    Yields ProgressUpdate objecten tijdens het proces en een ComplianceResult
    als eindresultaat.
    """
    yield ProgressUpdate(
        step="start",
        message=f"Compliance check gestart voor {tool_name}...",
        progress=0.05,
    )

    user_message = (
        f"Voer een volledige AVG/GDPR compliance check uit voor de tool: "
        f"{tool_name}. Zoek de officiële website, lees de privacy policy, "
        f"security pagina's, sub-verwerkerlijst, en alle relevante compliance "
        f"documentatie. Geef een eerlijke beoordeling."
    )

    progress_messages = [
        (0.1, "Zoeken naar officiële website..."),
        (0.2, "Privacy policy ophalen..."),
        (0.3, "Security documentatie analyseren..."),
        (0.5, "Sub-verwerkers identificeren..."),
        (0.6, "Sub-verwerkers doorzoeken..."),
        (0.7, "Datarechten beoordelen..."),
        (0.8, "Beveiligingscertificaten checken..."),
        (0.9, "Eindoordeel bepalen..."),
    ]
    progress_idx = 0

    input_messages = {
        "messages": [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_message),
        ]
    }

    final_content = ""

    async for event in _agent.astream_events(input_messages, version="v2"):
        kind = event.get("event", "")

        # Stuur voortgangsupdates bij tool calls
        if kind == "on_tool_start" and progress_idx < len(progress_messages):
            progress, message = progress_messages[progress_idx]
            yield ProgressUpdate(
                step=f"tool_{progress_idx}",
                message=message,
                progress=progress,
            )
            progress_idx += 1

        # Vang het laatste AI bericht op
        if kind == "on_chat_model_end":
            output = event.get("data", {}).get("output")
            if output and hasattr(output, "content"):
                final_content = output.content

    yield ProgressUpdate(
        step="parsing",
        message="Resultaten verwerken...",
        progress=0.95,
    )

    # Parse het JSON resultaat
    result = _parse_result(final_content, tool_name)

    yield ProgressUpdate(
        step="done",
        message="Check voltooid!",
        progress=1.0,
    )

    yield result


def _parse_result(content: str, tool_name: str) -> ComplianceResult:
    """Parse de agent output naar een ComplianceResult."""
    try:
        # Zoek JSON in de content (kan markdown code block bevatten)
        json_str = content
        if "```json" in content:
            json_str = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            json_str = content.split("```")[1].split("```")[0]

        data = json.loads(json_str.strip())
        return ComplianceResult(**data)
    except (json.JSONDecodeError, KeyError, IndexError, ValueError):
        # Fallback als parsing mislukt
        return ComplianceResult(
            tool_name=tool_name,
            overall_status="orange",
            summary=(
                "De analyse kon niet volledig worden afgerond. "
                "Raadpleeg een FG voor een handmatige beoordeling."
            ),
            categories=[],
            sub_processors=[],
            sources_consulted=[],
        )
