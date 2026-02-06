from enum import Enum

from pydantic import BaseModel, EmailStr


class TrafficLight(str, Enum):
    """Stoplicht classificatie."""

    GREEN = "green"
    ORANGE = "orange"
    RED = "red"


class Source(BaseModel):
    """Een bron die de agent heeft geraadpleegd."""

    url: str
    title: str
    quote: str | None = None


class CheckResult(BaseModel):
    """Resultaat van een individuele check."""

    name: str
    description: str
    status: TrafficLight
    finding: str
    sources: list[Source] = []


class SubProcessor(BaseModel):
    """Een sub-verwerker van de tool."""

    name: str
    purpose: str
    data_location: str
    status: TrafficLight
    source: Source | None = None


class CategoryResult(BaseModel):
    """Resultaat van een categorie checks."""

    name: str
    status: TrafficLight
    summary: str
    checks: list[CheckResult] = []


class ComplianceResult(BaseModel):
    """Volledig compliance resultaat voor een tool."""

    tool_name: str
    tool_url: str | None = None
    overall_status: TrafficLight
    summary: str
    categories: list[CategoryResult] = []
    sub_processors: list[SubProcessor] = []
    sources_consulted: list[Source] = []
    disclaimer: str = (
        "Dit is een initiële indicatie op basis van publiek beschikbare informatie. "
        "Dit rapport vormt geen juridisch advies. Raadpleeg een Functionaris "
        "Gegevensbescherming (FG) voor een definitieve beoordeling."
    )


class CheckRequest(BaseModel):
    """Verzoek om een tool te checken."""

    tool_name: str


class LeadRequest(BaseModel):
    """Lead contactgegevens."""

    name: str
    email: EmailStr
    company: str
    function: str
    tool_name: str


class ProgressUpdate(BaseModel):
    """Voortgangsupdate voor de frontend."""

    step: str
    message: str
    progress: float  # 0.0 - 1.0
