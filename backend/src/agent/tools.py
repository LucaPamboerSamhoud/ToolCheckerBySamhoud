import httpx
from bs4 import BeautifulSoup
from langchain_community.utilities import BingSearchAPIWrapper
from langchain_core.tools import tool

from ..config import settings

_bing = BingSearchAPIWrapper(
    bing_subscription_key=settings.bing_subscription_key,
    k=10,
)


@tool
def web_search(query: str) -> str:
    """Zoek op het internet naar informatie over een tool, privacy beleid, of compliance documentatie.

    Args:
        query: De zoekopdracht, bijv. 'Notion privacy policy GDPR'
    """
    results = _bing.results(query, num_results=10)
    if not results:
        return "Geen zoekresultaten gevonden."

    output = []
    for r in results:
        title = r.get("title", "Geen titel")
        link = r.get("link", "")
        snippet = r.get("snippet", "")
        output.append(f"**{title}**\nURL: {link}\n{snippet}")

    return "\n\n---\n\n".join(output)


@tool
async def fetch_webpage(url: str) -> str:
    """Haal de inhoud van een webpagina op en converteer naar leesbare tekst.

    Gebruik dit om privacy policies, security pagina's, sub-verwerkerlijsten,
    en andere compliance documentatie te lezen.

    Args:
        url: De volledige URL van de pagina om op te halen.
    """
    try:
        async with httpx.AsyncClient(
            follow_redirects=True, timeout=15.0
        ) as client:
            response = await client.get(
                url,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/131.0.0.0 Safari/537.36"
                    )
                },
            )
            response.raise_for_status()
    except httpx.HTTPError as e:
        return f"Kon de pagina niet ophalen: {e}"

    soup = BeautifulSoup(response.text, "html.parser")

    # Verwijder scripts, styles, nav, footer
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)

    # Beperk tot 12000 characters om context window te sparen
    if len(text) > 12000:
        text = text[:12000] + "\n\n[... tekst ingekort ...]"

    return f"Inhoud van {url}:\n\n{text}"


TOOLS = [web_search, fetch_webpage]
