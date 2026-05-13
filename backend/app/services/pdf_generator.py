import base64
import io
from datetime import date, datetime

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

TEAL = HexColor("#00d4aa")
NAVY = HexColor("#0a0f1e")
CRIMSON = HexColor("#e63946")
LIGHT_GREY = HexColor("#f0f0f0")
MID_GREY = HexColor("#888888")

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm

_HEADER = ParagraphStyle("header", fontSize=22, textColor=white, fontName="Helvetica-Bold", leading=26)
_DATE_RIGHT = ParagraphStyle("date_right", fontSize=9, textColor=white, fontName="Helvetica", alignment=TA_RIGHT)
_SECTION = ParagraphStyle("section", fontSize=11, textColor=TEAL, fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=4)
_BODY = ParagraphStyle("body", fontSize=9, textColor=NAVY, fontName="Helvetica", leading=14)
_SMALL = ParagraphStyle("small", fontSize=8, textColor=MID_GREY, fontName="Helvetica", leading=12)
_ANN = ParagraphStyle("ann", fontSize=9, textColor=NAVY, fontName="Helvetica", leading=13, leftIndent=8)


def _header_block(title: str) -> list:
    today = date.today().strftime("%d %B %Y")
    header_data = [[
        Paragraph("EpiLens", _HEADER),
        Paragraph(today, _DATE_RIGHT),
    ]]
    table = Table(header_data, colWidths=[PAGE_W - MARGIN * 2 - 4 * cm, 4 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (0, -1), 16),
        ("RIGHTPADDING", (-1, 0), (-1, -1), 16),
    ]))
    return [table, Spacer(1, 0.4 * cm)]


def _meta_block(analysis) -> list:
    countries = ", ".join(analysis.countries) if analysis.countries else "All countries"
    period = (
        f"{analysis.year_start} – {analysis.year_end}"
        if analysis.year_start and analysis.year_end
        else "All years"
    )
    items = [
        Paragraph(analysis.title, ParagraphStyle("title", fontSize=16, textColor=NAVY, fontName="Helvetica-Bold", spaceAfter=6)),
        Paragraph(f"Indicator: {analysis.indicator_code}", _BODY),
        Paragraph(f"Countries: {countries}", _BODY),
        Paragraph(f"Period: {period}", _BODY),
    ]
    if analysis.description:
        items.append(Spacer(1, 0.2 * cm))
        items.append(Paragraph(analysis.description, _SMALL))
    items.append(HRFlowable(width="100%", thickness=1, color=TEAL, spaceAfter=10))
    return items


def _chart_block(chart_b64: str) -> list:
    raw = base64.b64decode(chart_b64)
    img_buf = io.BytesIO(raw)
    max_w = PAGE_W - MARGIN * 2
    img = Image(img_buf, width=max_w, height=max_w * 0.5)
    return [
        Paragraph("Chart", _SECTION),
        img,
        Spacer(1, 0.4 * cm),
    ]


def _stats_block(config: dict) -> list:
    if not config:
        return []

    label_map = {
        "slope": "Trend slope",
        "intercept": "Intercept",
        "r_squared": "R²",
        "p_value": "p-value",
        "trend_direction": "Direction",
        "pearson_r": "Pearson r",
        "pearson_p": "Pearson p",
        "spearman_r": "Spearman r",
        "spearman_p": "Spearman p",
        "n": "Matched pairs",
    }

    rows = []
    for key, label in label_map.items():
        if key in config:
            val = config[key]
            rows.append([
                Paragraph(label, ParagraphStyle("tbl_label", fontSize=9, fontName="Helvetica-Bold", textColor=NAVY)),
                Paragraph(str(val), ParagraphStyle("tbl_val", fontSize=9, fontName="Helvetica", textColor=NAVY)),
            ])

    for key, val in config.items():
        if key not in label_map:
            rows.append([
                Paragraph(key, ParagraphStyle("tbl_label", fontSize=9, fontName="Helvetica-Bold", textColor=NAVY)),
                Paragraph(str(val), ParagraphStyle("tbl_val", fontSize=9, fontName="Helvetica", textColor=NAVY)),
            ])

    if not rows:
        return []

    col_w = (PAGE_W - MARGIN * 2) / 2
    tbl = Table(rows, colWidths=[col_w * 0.45, col_w * 0.55])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREY),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [white, LIGHT_GREY]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, MID_GREY),
    ]))

    return [Paragraph("Statistical Summary", _SECTION), tbl, Spacer(1, 0.4 * cm)]


def _annotations_block(annotations: list) -> list:
    if not annotations:
        return []

    items = [Paragraph("Annotations", _SECTION)]
    for ann in annotations:
        created = ""
        if hasattr(ann, "created_at") and ann.created_at:
            created = f" · {ann.created_at.strftime('%Y-%m-%d')}"
        items.append(Paragraph(
            f"<b>{ann.country_code} ({ann.year})</b>{created}: {ann.note}",
            _ANN,
        ))
        items.append(Spacer(1, 0.15 * cm))

    items.append(Spacer(1, 0.2 * cm))
    return items


def _attribution_block() -> list:
    fetched = datetime.utcnow().strftime("%d %B %Y")
    return [
        HRFlowable(width="100%", thickness=1, color=LIGHT_GREY, spaceBefore=8),
        Spacer(1, 0.2 * cm),
        Paragraph(
            f"Data source: WHO Global Health Observatory (GHO) — "
            f"<link href='https://www.who.int/data/gho'>who.int/data/gho</link>. "
            f"Retrieved {fetched}. Generated by EpiLens.",
            _SMALL,
        ),
    ]


def generate_pdf(analysis, annotations: list, chart_b64: str) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
    )

    story = []
    story.extend(_header_block(analysis.title))
    story.extend(_meta_block(analysis))
    story.extend(_chart_block(chart_b64))
    story.extend(_stats_block(analysis.config or {}))
    story.extend(_annotations_block(annotations))
    story.extend(_attribution_block())

    doc.build(story)
    return buf.getvalue()
