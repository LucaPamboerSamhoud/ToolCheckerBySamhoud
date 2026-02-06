import io
from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm, Inches, Pt, RGBColor

from ..models import ComplianceResult, TrafficLight

# &samhoud kleuren
SAMHOUD_BLUE = RGBColor(0x0C, 0x2A, 0xAD)
SAMHOUD_LIGHT_BLUE = RGBColor(0x42, 0x72, 0xAB)
SAMHOUD_ORANGE = RGBColor(0xFF, 0xA3, 0x14)
COLOR_GREEN = RGBColor(0x2E, 0x7D, 0x32)
COLOR_ORANGE = RGBColor(0xF5, 0x7C, 0x00)
COLOR_RED = RGBColor(0xC6, 0x28, 0x28)
COLOR_GRAY = RGBColor(0x66, 0x66, 0x66)

STATUS_COLORS = {
    TrafficLight.GREEN: COLOR_GREEN,
    TrafficLight.ORANGE: COLOR_ORANGE,
    TrafficLight.RED: COLOR_RED,
}

STATUS_LABELS = {
    TrafficLight.GREEN: "GROEN — Veilig te gebruiken",
    TrafficLight.ORANGE: "ORANJE — Nader onderzoek nodig",
    TrafficLight.RED: "ROOD — Niet gebruiken zonder waarborgen",
}

STATUS_EMOJI = {
    TrafficLight.GREEN: "V",
    TrafficLight.ORANGE: "!",
    TrafficLight.RED: "X",
}


def generate_report(result: ComplianceResult) -> io.BytesIO:
    """Genereer een Word rapport voor een compliance check resultaat."""
    doc = Document()
    _set_default_font(doc)

    # Titel
    _add_title(doc, result)

    # Managementsamenvatting
    _add_summary(doc, result)

    # Categorieën met checks
    for category in result.categories:
        _add_category(doc, category)

    # Sub-verwerkers
    if result.sub_processors:
        _add_sub_processors(doc, result)

    # Geraadpleegde bronnen
    _add_sources(doc, result)

    # Disclaimer
    _add_disclaimer(doc, result)

    # Sla op in bytes buffer
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer


def _set_default_font(doc: Document) -> None:
    """Stel het standaard font in."""
    style = doc.styles["Normal"]
    font = style.font
    font.name = "Calibri"
    font.size = Pt(10)
    font.color.rgb = RGBColor(0x33, 0x33, 0x33)


def _add_title(doc: Document, result: ComplianceResult) -> None:
    """Voeg de titel en meta-informatie toe."""
    # Hoofdtitel
    title = doc.add_heading(level=0)
    run = title.add_run(f"Compliance Rapport: {result.tool_name}")
    run.font.color.rgb = SAMHOUD_BLUE
    run.font.size = Pt(24)

    # Subtitel
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = subtitle.add_run("AVG/GDPR Compliance Check")
    run.font.color.rgb = SAMHOUD_LIGHT_BLUE
    run.font.size = Pt(14)

    # Meta informatie
    meta = doc.add_paragraph()
    meta_run = meta.add_run(
        f"Gegenereerd op: {datetime.now().strftime('%d-%m-%Y %H:%M')}\n"
        f"Door: ToolChecker by &samhoud"
    )
    meta_run.font.color.rgb = COLOR_GRAY
    meta_run.font.size = Pt(9)

    doc.add_paragraph()  # Witruimte


def _add_summary(doc: Document, result: ComplianceResult) -> None:
    """Voeg de managementsamenvatting toe."""
    heading = doc.add_heading("Managementsamenvatting", level=1)
    for run in heading.runs:
        run.font.color.rgb = SAMHOUD_BLUE

    # Stoplicht indicator
    status_para = doc.add_paragraph()
    status_label = STATUS_LABELS.get(result.overall_status, "Onbekend")
    status_color = STATUS_COLORS.get(result.overall_status, COLOR_GRAY)

    indicator = status_para.add_run(f"  {STATUS_EMOJI[result.overall_status]}  ")
    indicator.font.size = Pt(16)
    indicator.bold = True
    indicator.font.color.rgb = status_color

    label = status_para.add_run(status_label)
    label.font.size = Pt(14)
    label.bold = True
    label.font.color.rgb = status_color

    # Samenvatting
    doc.add_paragraph(result.summary)

    # Mini-overzicht categorieën
    if result.categories:
        table = doc.add_table(rows=1, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.LEFT
        hdr = table.rows[0].cells
        _set_cell_text(hdr[0], "Categorie", bold=True)
        _set_cell_text(hdr[1], "Status", bold=True)

        for cat in result.categories:
            row = table.add_row().cells
            _set_cell_text(row[0], cat.name)
            color = STATUS_COLORS.get(cat.status, COLOR_GRAY)
            _set_cell_text(
                row[1], STATUS_LABELS.get(cat.status, "Onbekend"), color=color
            )

    doc.add_paragraph()


def _add_category(doc: Document, category) -> None:
    """Voeg een categorie sectie toe met alle checks."""
    heading = doc.add_heading(category.name, level=2)
    for run in heading.runs:
        run.font.color.rgb = SAMHOUD_LIGHT_BLUE

    # Categorie samenvatting
    summary_para = doc.add_paragraph()
    status_color = STATUS_COLORS.get(category.status, COLOR_GRAY)
    run = summary_para.add_run(f"Status: ")
    run.bold = True
    status_run = summary_para.add_run(
        STATUS_LABELS.get(category.status, "Onbekend")
    )
    status_run.font.color.rgb = status_color
    status_run.bold = True

    doc.add_paragraph(category.summary)

    # Individuele checks
    for check in category.checks:
        _add_check(doc, check)


def _add_check(doc: Document, check) -> None:
    """Voeg een individuele check toe."""
    # Check naam met status indicator
    para = doc.add_paragraph()
    status_color = STATUS_COLORS.get(check.status, COLOR_GRAY)

    indicator = para.add_run(f"[{STATUS_EMOJI[check.status]}] ")
    indicator.font.color.rgb = status_color
    indicator.bold = True

    name_run = para.add_run(check.name)
    name_run.bold = True

    # Bevinding
    doc.add_paragraph(check.finding)

    # Bronnen met quotes
    if check.sources:
        for source in check.sources:
            source_para = doc.add_paragraph()
            source_para.paragraph_format.left_indent = Cm(1)

            if source.quote:
                quote_run = source_para.add_run(f'"{source.quote}"')
                quote_run.italic = True
                quote_run.font.size = Pt(9)
                quote_run.font.color.rgb = COLOR_GRAY
                source_para.add_run("\n")

            link_run = source_para.add_run(f"Bron: {source.url}")
            link_run.font.size = Pt(8)
            link_run.font.color.rgb = SAMHOUD_LIGHT_BLUE


def _add_sub_processors(doc: Document, result: ComplianceResult) -> None:
    """Voeg het sub-verwerkers overzicht toe."""
    heading = doc.add_heading("Sub-verwerkers", level=2)
    for run in heading.runs:
        run.font.color.rgb = SAMHOUD_LIGHT_BLUE

    doc.add_paragraph(
        "Onderstaande tabel toont de sub-verwerkers die door deze tool worden "
        "gebruikt en waar zij data verwerken. De zwakste schakel in deze keten "
        "bepaalt mede het overall stoplicht."
    )

    table = doc.add_table(rows=1, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    hdr = table.rows[0].cells
    _set_cell_text(hdr[0], "Sub-verwerker", bold=True)
    _set_cell_text(hdr[1], "Doel", bold=True)
    _set_cell_text(hdr[2], "Datalocatie", bold=True)
    _set_cell_text(hdr[3], "Status", bold=True)

    for sp in result.sub_processors:
        row = table.add_row().cells
        _set_cell_text(row[0], sp.name)
        _set_cell_text(row[1], sp.purpose)
        _set_cell_text(row[2], sp.data_location)
        color = STATUS_COLORS.get(sp.status, COLOR_GRAY)
        _set_cell_text(row[3], sp.status.value.upper(), color=color)

    doc.add_paragraph()


def _add_sources(doc: Document, result: ComplianceResult) -> None:
    """Voeg de lijst met geraadpleegde bronnen toe."""
    heading = doc.add_heading("Geraadpleegde bronnen", level=2)
    for run in heading.runs:
        run.font.color.rgb = SAMHOUD_LIGHT_BLUE

    for source in result.sources_consulted:
        para = doc.add_paragraph(style="List Bullet")
        title_run = para.add_run(source.title)
        title_run.bold = True
        para.add_run(f"\n{source.url}")


def _add_disclaimer(doc: Document, result: ComplianceResult) -> None:
    """Voeg de disclaimer toe."""
    doc.add_paragraph()
    heading = doc.add_heading("Disclaimer", level=2)
    for run in heading.runs:
        run.font.color.rgb = COLOR_GRAY

    disclaimer_para = doc.add_paragraph()
    run = disclaimer_para.add_run(result.disclaimer)
    run.font.color.rgb = COLOR_GRAY
    run.font.size = Pt(9)
    run.italic = True


def _set_cell_text(
    cell, text: str, bold: bool = False, color: RGBColor | None = None
) -> None:
    """Helper om tekst in een tabelcel te zetten."""
    cell.text = ""
    para = cell.paragraphs[0]
    run = para.add_run(text)
    run.font.size = Pt(9)
    run.bold = bold
    if color:
        run.font.color.rgb = color
