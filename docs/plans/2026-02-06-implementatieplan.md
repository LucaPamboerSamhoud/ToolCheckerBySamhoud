# ToolChecker — Implementatieplan

## Fase 1: Backend Basis
1. Python project opzetten (venv, requirements.txt, projectstructuur)
2. FastAPI app met basis endpoints
3. LangGraph agent met Bing Web Search tools
4. Compliance check logica (alle categorieën)
5. SSE streaming endpoint voor voortgangsupdates
6. **Testen:** Agent testen met bekende tools (Notion, ChatGPT, Fireflies)

## Fase 2: Word Rapport
7. Word template in &samhoud huisstijl
8. python-docx rapport generatie met bevindingen, quotes, bronnen
9. Rapport endpoint
10. **Testen:** Rapporten genereren en controleren op volledigheid en leesbaarheid

## Fase 3: Lead Generatie
11. Email service via Azure Communication Services
12. Lead endpoint dat email stuurt naar data.team@samhoud.com
13. **Testen:** Lead flow testen (formulier → email)

## Fase 4: Frontend
14. React project opzetten (TypeScript, Tailwind, Radix UI)
15. Home pagina met invoerveld
16. Laadscherm met voortgangsupdates (SSE)
17. Resultaatpagina met stoplicht en categorieën
18. Contactformulier (CTA-blok)
19. Word-download achter formulier
20. &samhoud huisstijl toepassen
21. **Testen:** Volledige flow testen in de browser

## Fase 5: Integratie & Verificatie
22. Frontend + backend koppelen
23. End-to-end test met meerdere tools
24. Edge cases testen (onbekende tools, tools zonder privacy page)
25. Alle functionaliteit doorlopen en fixen totdat alles werkt
26. Eerste push naar GitHub

## Testplan
Bij elke fase wordt de functionaliteit getest voordat we doorgaan. Bij de finale verificatie worden minimaal 3 tools gecheckt:
- Een bekende tool met goede compliance (bijv. Microsoft 365)
- Een tool met twijfelachtige compliance (bijv. een US-only SaaS)
- Een obscure/onbekende tool (om te testen hoe de agent omgaat met weinig informatie)
