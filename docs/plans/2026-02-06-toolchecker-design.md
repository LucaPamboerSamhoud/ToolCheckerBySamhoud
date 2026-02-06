# ToolChecker by &samhoud — Ontwerp

## Overzicht

Een publieke webapp waar je een toolnaam invoert en binnen 30-60 seconden een compliance-indicatie krijgt (stoplicht) met de mogelijkheid om een uitgebreid Word-rapport te downloaden.

**Doelgroep:** Klanten van &samhoud — niet-technische medewerkers die willen weten of ze een tool veilig kunnen inzetten.

**Doel:** Initiële AVG/GDPR compliance check voor tools, zodat organisaties snel kunnen inschatten of een tool verantwoord te gebruiken is. Daarnaast fungeert de tool als lead generator voor &samhoud.

## Architectuur

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   React      │────▶│   FastAPI    │────▶│  Azure OpenAI    │
│   Frontend   │◀────│   Backend    │◀────│  (GPT-4o)        │
│              │     │              │     └──────────────────┘
│   Tailwind   │     │   LangGraph  │────▶┌──────────────────┐
│   Radix UI   │     │   Agent      │◀────│  Bing Web Search │
└─────────────┘     └─────────────┘     └──────────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │  Word Export      │
                    │  (python-docx)   │
                    └──────────────────┘
```

- **Frontend:** React + TypeScript + Tailwind + Radix UI
- **Backend:** FastAPI met een LangGraph agent
- **LLM:** Azure OpenAI (GPT-4o)
- **Web Search:** Bing Web Search API (via Azure)
- **Export:** python-docx voor Word-rapportgeneratie
- **Email:** Azure Communication Services (lead notificaties naar data.team@samhoud.com)
- **Hosting:** Azure App Service (backend) + Azure Static Web Apps (frontend)

## Compliance Checks

### Categorie 1: Dataopslag & Verwerking
- Waar wordt data opgeslagen? (EU/VS/anders)
- Waar wordt data verwerkt? (EU/VS/anders)
- Welke sub-verwerkers worden gebruikt?
- **Per sub-verwerker: waar verwerkt die data?** (de hele keten telt)
- Is er een verwerkersovereenkomst (DPA) beschikbaar?
- Is de organisatie EU-US Data Privacy Framework gecertificeerd?

### Categorie 2: Datarechten (AVG)
- Wat is de retentietijd van data?
- Kan data verwijderd worden op verzoek (recht op vergetelheid)?
- Is data-export mogelijk (recht op dataportabiliteit)?
- Is er een inzagerecht-procedure?
- Wordt data gebruikt voor het trainen van modellen?

### Categorie 3: Beveiliging
- Is er een security/trust page beschikbaar?
- Heeft de tool relevante certificeringen (SOC 2, ISO 27001)?
- Is er end-to-end encryptie of encryptie at rest?
- Is er een incident response / breach notification procedure?

### AI Act (nice-to-have, later)
- Risicoclassificatie (minimaal/beperkt/hoog/onaanvaardbaar)
- Transparantieverplichtingen
- Sector-specifieke risico's

## Stoplicht-logica

- **Groen:** Data in EU, DPA beschikbaar, datarechten worden ondersteund, relevante certificeringen aanwezig
- **Oranje:** Data deels buiten EU maar met adequate waarborgen (SCCs, DPF), sommige datarechten onduidelijk, OF informatie niet gevonden
- **Rood:** Data in VS zonder waarborgen, geen DPA, geen mogelijkheid tot verwijdering, of data wordt gebruikt voor modeltraining

### Kernprincipes
- **Eerlijkheid eerst:** Als iets niet gevonden wordt, zeg dat expliciet. Nooit aannames doen. Onduidelijkheid = oranje.
- **Zwakste schakel:** Het overall stoplicht wordt bepaald door de slechtste score in de hele verwerkingsketen (tool + sub-verwerkers).
- **Bronvermelding:** Elke bevinding moet een bron-URL hebben, of expliciet vermelden dat er geen bron is.
- **Geen false positives:** Liever te streng dan te soepel.

## Gebruikerservaring

### Scherm 1: Home
- Titel en korte uitleg wat de tool doet
- Eén invoerveld: "Welke tool wil je checken?"
- Knop: "Check compliance"
- &samhoud huisstijl

### Scherm 2: Laden (30-60 sec)
- Animatie met voortgangsindicatie
- Updates van wat de agent doet (bijv. "Privacy policy ophalen...", "Sub-verwerkers analyseren...")

### Scherm 3: Resultaat
- **Groot stoplicht** bovenaan (groen/oranje/rood)
- **Eén-zin conclusie**
- **Compact overzicht per categorie** met mini-stoplichten
- **Per categorie 2-3 regels** met belangrijkste bevindingen
- Bij onduidelijke punten: *"Hier kon geen informatie over gevonden worden"*
- **CTA-blok:** "Wil je weten hoe je de nieuwste technologie verantwoord inzet? Neem contact op." Met velden: naam, email, bedrijf, functie
- **Download-knop:** "Download volledig rapport (Word)" — pas na invullen formulier

### Word-rapport (3-5 pagina's)
- &samhoud huisstijl (logo, kleuren, fonts)
- Managementsamenvatting met stoplicht
- Per check: bevinding, onderbouwing, directe quotes uit documentatie, bron-URL
- Overzicht van alle sub-verwerkers en hun locaties
- Lijst met alle geraadpleegde bronnen
- Disclaimer: "Dit is een initiële indicatie, geen juridisch advies"

## LangGraph Agent Flow

1. **Zoek de tool** — Bing Web Search voor de officiële website
2. **Crawl standaard pagina's** — `/privacy`, `/security`, `/trust`, `/gdpr`, `/subprocessors`, `/dpa`, `/legal/privacy`
3. **Analyseer met GPT-4o** — Extraheer per check de relevante informatie
4. **Zoek sub-verwerkers door** — Per sub-verwerker: check waar die data verwerkt
5. **Bepaal stoplicht** — Per categorie en overall
6. **Genereer rapport** — Gestructureerde output met bevindingen, quotes en bronnen

## API Endpoints

- `POST /api/check` — Start compliance check (SSE streaming voor voortgang)
- `POST /api/report` — Genereer Word-rapport
- `POST /api/lead` — Verstuur lead-email naar data.team@samhoud.com

## Lead Generatie

- Resultaatpagina toont altijd een CTA-blok onderaan
- Word-rapport downloaden vereist invullen van contactformulier (naam, email, bedrijf, functie)
- Bij elke lead wordt een email verstuurd naar data.team@samhoud.com
- Geen database nodig — alleen email notificatie

## Projectstructuur

```
toolchecker/
├── frontend/              # React + TypeScript
│   ├── src/
│   │   ├── components/    # UI componenten
│   │   ├── pages/         # Home, Resultaat
│   │   └── api/           # API client
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── agent/         # LangGraph agent + tools
│   │   ├── checks/        # Check definities per categorie
│   │   ├── report/        # Word-rapport generatie
│   │   ├── email/         # Lead email service
│   │   └── api/           # FastAPI endpoints
│   ├── templates/         # Word template
│   ├── requirements.txt
│   └── .env
├── docs/
│   └── plans/
└── README.md
```

## Kosten & Beperkingen

- Geen authenticatie — publiek toegankelijk
- Geen rate limiting in MVP — later toevoegen indien nodig
- Azure OpenAI + Bing Search kosten per check
