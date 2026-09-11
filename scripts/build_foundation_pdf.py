from __future__ import annotations

import os
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image as RLImage,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
TMP = ROOT / "tmp" / "pdfs"
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)


def find_font(names: list[str]) -> str:
    roots = [
        Path("/usr/share/fonts/truetype/dejavu"),
        Path("/usr/share/fonts/truetype/liberation2"),
        Path("/usr/share/fonts/truetype/dejavu"),
    ]
    for root in roots:
        for name in names:
            candidate = root / name
            if candidate.exists():
                return str(candidate)
    return "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


FONT_REG = find_font(["DejaVuSans.ttf", "LiberationSans-Regular.ttf"])
FONT_BOLD = find_font(["DejaVuSans-Bold.ttf", "LiberationSans-Bold.ttf"])
FONT_ITALIC = find_font(["DejaVuSans-Oblique.ttf", "LiberationSans-Italic.ttf"])
pdfmetrics.registerFont(TTFont("NexoSans", FONT_REG))
pdfmetrics.registerFont(TTFont("NexoSans-Bold", FONT_BOLD))
pdfmetrics.registerFont(TTFont("NexoSans-Italic", FONT_ITALIC))


NAVY = HexColor("#172033")
BLUE = HexColor("#356AE6")
BLUE_DARK = HexColor("#2856C7")
TEAL = HexColor("#00A6A6")
INK = HexColor("#1D2A3A")
MUTED = HexColor("#536078")
BG = HexColor("#F7F9FC")
BORDER = HexColor("#E3E8F1")
WHITE = colors.white
GREEN = HexColor("#16845B")
AMBER = HexColor("#A96B05")
RED = HexColor("#C23B52")


def make_font(size: int, bold: bool = False):
    path = FONT_BOLD if bold else FONT_REG
    return ImageFont.truetype(path, size=size)


def draw_wrapped(draw, xy, text, font, fill, width, line_spacing=6):
    x, y = xy
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if draw.textlength(candidate, font=font) <= width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    for item in lines:
        draw.text((x, y), item, font=font, fill=fill)
        y += font.size + line_spacing
    return y


def icon(draw, xy, kind, fill=BLUE):
    x, y = xy
    if kind == "home":
        draw.polygon([(x, y + 8), (x + 10, y), (x + 20, y + 8), (x + 18, y + 8), (x + 18, y + 20), (x + 3, y + 20), (x + 3, y + 8)], fill=fill)
    elif kind == "chat":
        draw.rounded_rectangle((x, y, x + 21, y + 15), radius=5, fill=fill)
        draw.polygon([(x + 6, y + 14), (x + 5, y + 21), (x + 11, y + 15)], fill=fill)
    elif kind == "users":
        draw.ellipse((x + 3, y, x + 12, y + 9), fill=fill)
        draw.ellipse((x + 13, y + 3, x + 21, y + 11), fill=fill)
        draw.rounded_rectangle((x, y + 10, x + 14, y + 21), radius=4, fill=fill)
        draw.rounded_rectangle((x + 11, y + 12, x + 23, y + 21), radius=4, fill=fill)
    elif kind == "chart":
        draw.line((x, y + 20, x + 20, y + 20), fill=fill, width=2)
        draw.line((x + 3, y + 18, x + 3, y + 10), fill=fill, width=3)
        draw.line((x + 10, y + 18, x + 10, y + 5), fill=fill, width=3)
        draw.line((x + 17, y + 18, x + 17, y + 1), fill=fill, width=3)


def base_canvas(size=(1600, 900), bg="#F7F9FC"):
    image = Image.new("RGB", size, bg)
    draw = ImageDraw.Draw(image)
    return image, draw


def build_login_mockup(path: Path):
    image, draw = base_canvas()
    w, h = image.size
    draw.rounded_rectangle((50, 50, w - 50, h - 50), radius=30, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.rounded_rectangle((50, 50, 700, h - 50), radius=30, fill="#172033")
    draw.rectangle((680, 50, 710, h - 50), fill="#172033")
    draw.text((120, 120), "BipeSend", font=make_font(44, True), fill="#FFFFFF")
    draw.text((120, 186), "CRM, atendimento e automacao", font=make_font(24), fill="#B9C6DD")
    draw_wrapped(draw, (120, 320), "Um espaco de trabalho para transformar conversas em relacionamento e vendas, com seguranca por tenant.", make_font(30, True), "#FFFFFF", 460, 10)
    draw.rounded_rectangle((120, 635, 560, 690), radius=12, fill="#263A60")
    draw.text((150, 651), "Dados protegidos por design", font=make_font(20), fill="#DCE6FA")
    draw.text((860, 155), "Entrar no painel", font=make_font(38, True), fill="#172033")
    draw.text((860, 215), "Acesse o ambiente da sua empresa", font=make_font(22), fill="#536078")
    for label, y, value in [("E-mail profissional", 310, "voce@empresa.com"), ("Senha", 430, "Sua senha")]:
        draw.text((860, y - 35), label, font=make_font(20, True), fill="#172033")
        draw.rounded_rectangle((860, y, 1390, y + 64), radius=10, fill="#FFFFFF", outline="#CBD4E2", width=2)
        draw.text((885, y + 20), value, font=make_font(20), fill="#9AA7BA")
    draw.rounded_rectangle((860, 550, 1390, 620), radius=12, fill="#356AE6")
    draw.text((1070, 572), "Entrar", font=make_font(22, True), fill="#FFFFFF")
    draw.text((860, 670), "Esqueci minha senha", font=make_font(19, True), fill="#356AE6")
    draw.text((1170, 670), "Criar conta", font=make_font(19, True), fill="#356AE6")
    image.save(path)


def sidebar(draw, x=50, y=50, bottom=850, active="Inicio"):
    draw.rounded_rectangle((x, y, x + 255, bottom), radius=24, fill="#172033")
    draw.text((x + 28, y + 30), "BipeSend", font=make_font(30, True), fill="#FFFFFF")
    items = [("Inicio", "home"), ("Inbox", "chat"), ("Contatos", "users"), ("CRM", "chart"), ("Automacoes", "chart"), ("Catalogo", "users"), ("Integracoes", "chat")]
    for i, (label, kind) in enumerate(items):
        yy = y + 115 + i * 68
        if label == active:
            draw.rounded_rectangle((x + 16, yy - 10, x + 239, yy + 43), radius=12, fill="#2C4169")
        icon(draw, (x + 34, yy + 3), kind, fill="#9FB7E6" if label != active else "#FFFFFF")
        draw.text((x + 72, yy + 3), label, font=make_font(19, label == active), fill="#FFFFFF" if label == active else "#B9C6DD")
    draw.line((x + 24, bottom - 110, x + 230, bottom - 110), fill="#314567", width=2)
    draw.text((x + 32, bottom - 82), "Configuracoes", font=make_font(17), fill="#B9C6DD")


def build_dashboard_mockup(path: Path):
    image, draw = base_canvas()
    sidebar(draw, active="Inicio")
    draw.text((355, 82), "Bom dia, Marina", font=make_font(34, True), fill="#172033")
    draw.text((355, 132), "Aqui esta o resumo da sua operacao hoje.", font=make_font(20), fill="#536078")
    draw.rounded_rectangle((1250, 70, 1500, 124), radius=12, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.text((1280, 86), "7 - 13 set 2026", font=make_font(18, True), fill="#536078")
    cards = [("Conversas abertas", "248", "+12%", "#356AE6"), ("Tempo de resposta", "4m 32s", "-18%", "#00A6A6"), ("Oportunidades", "86", "+9%", "#16845B"), ("Vendas", "R$ 42.580", "+21%", "#A96B05")]
    for i, (label, value, trend, color) in enumerate(cards):
        x = 355 + i * 280
        draw.rounded_rectangle((x, 220, x + 250, 365), radius=16, fill="#FFFFFF", outline="#E3E8F1", width=2)
        draw.ellipse((x + 22, 246, x + 58, 282), fill="#EEF3FF")
        draw.text((x + 77, 245), label, font=make_font(16), fill="#536078")
        draw.text((x + 22, 295), value, font=make_font(30, True), fill="#172033")
        draw.text((x + 178, 312), trend, font=make_font(16, True), fill=color)
    draw.rounded_rectangle((355, 405, 935, 810), radius=16, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.text((385, 438), "Conversas por canal", font=make_font(22, True), fill="#172033")
    draw.text((385, 478), "Ultimos 7 dias", font=make_font(16), fill="#536078")
    base_x, base_y = 410, 730
    draw.line((base_x, base_y, 880, base_y), fill="#CBD4E2", width=2)
    draw.line((base_x, 530, base_x, base_y), fill="#CBD4E2", width=2)
    pts = [(440, 680), (510, 642), (580, 665), (650, 590), (720, 610), (790, 550), (850, 565)]
    draw.line(pts, fill="#356AE6", width=5)
    for px, py in pts:
        draw.ellipse((px - 6, py - 6, px + 6, py + 6), fill="#356AE6")
    draw.rounded_rectangle((970, 405, 1500, 810), radius=16, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.text((1000, 438), "Atividades recentes", font=make_font(22, True), fill="#172033")
    events = [("Novo contato qualificado", "Equipe comercial", "#356AE6"), ("Pedido atualizado", "Catalogo", "#16845B"), ("Conversa atribuida", "Suporte", "#00A6A6"), ("Documento indexado", "Conhecimento", "#A96B05")]
    for i, (title, team, color) in enumerate(events):
        yy = 515 + i * 72
        draw.ellipse((1000, yy, 1024, yy + 24), fill=color)
        draw.text((1045, yy - 2), title, font=make_font(17, True), fill="#172033")
        draw.text((1045, yy + 26), team, font=make_font(15), fill="#536078")
    image.save(path)


def build_inbox_mockup(path: Path):
    image, draw = base_canvas()
    sidebar(draw, active="Inbox")
    draw.text((355, 82), "Inbox", font=make_font(34, True), fill="#172033")
    draw.text((355, 132), "Atenda, distribua e acompanhe cada conversa.", font=make_font(20), fill="#536078")
    draw.rounded_rectangle((355, 205, 660, 840), radius=16, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.text((380, 235), "Conversas", font=make_font(22, True), fill="#172033")
    draw.rounded_rectangle((380, 280, 635, 330), radius=10, fill="#F7F9FC")
    draw.text((405, 295), "Buscar conversa", font=make_font(16), fill="#9AA7BA")
    chats = [("Ana Souza", "Quero saber sobre o plano...", "2", "#356AE6"), ("Carlos Lima", "Pode enviar o catalogo?", "", "#00A6A6"), ("Restaurante Bossa", "Pedido #1048 confirmado", "", "#16845B"), ("Joao Mendes", "Obrigado pelo retorno", "", "#A96B05")]
    for i, (name, preview, badge, color) in enumerate(chats):
        yy = 365 + i * 102
        draw.line((380, yy + 85, 635, yy + 85), fill="#EEF1F6", width=2)
        draw.ellipse((382, yy, 434, yy + 52), fill=color)
        draw.text((398, yy + 14), name[0], font=make_font(22, True), fill="#FFFFFF")
        draw.text((455, yy + 2), name, font=make_font(17, True), fill="#172033")
        draw.text((455, yy + 29), preview, font=make_font(14), fill="#536078")
        if badge:
            draw.ellipse((595, yy + 17, 619, yy + 41), fill="#356AE6")
            draw.text((603, yy + 21), badge, font=make_font(12, True), fill="#FFFFFF")
    draw.rounded_rectangle((685, 205, 1110, 840), radius=16, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.text((720, 235), "Ana Souza", font=make_font(22, True), fill="#172033")
    draw.text((720, 271), "WhatsApp | Em negociacao", font=make_font(15), fill="#536078")
    draw.line((715, 315, 1080, 315), fill="#E3E8F1", width=2)
    messages = [("Ola! Vi o anuncio e quero saber mais.", "cliente", 365), ("Claro. Posso te mostrar as opcoes e entender seu objetivo?", "agent", 475), ("Quero uma equipe pequena para comecar.", "cliente", 600)]
    for text, who, yy in messages:
        if who == "agent":
            x1, x2, fill = 790, 1065, "#EEF3FF"
        else:
            x1, x2, fill = 730, 1010, "#F7F9FC"
        draw.rounded_rectangle((x1, yy, x2, yy + 72), radius=14, fill=fill)
        draw_wrapped(draw, (x1 + 18, yy + 15), text, make_font(16), "#172033", x2 - x1 - 36, 5)
    draw.rounded_rectangle((715, 755, 1080, 810), radius=12, fill="#F7F9FC", outline="#E3E8F1", width=2)
    draw.text((735, 772), "Escreva uma mensagem...", font=make_font(16), fill="#9AA7BA")
    draw.rounded_rectangle((1135, 205, 1500, 840), radius=16, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.text((1170, 235), "Perfil do contato", font=make_font(20, True), fill="#172033")
    draw.ellipse((1170, 290, 1240, 360), fill="#356AE6")
    draw.text((1192, 311), "A", font=make_font(27, True), fill="#FFFFFF")
    draw.text((1260, 300), "Ana Souza", font=make_font(19, True), fill="#172033")
    draw.text((1260, 330), "ana@exemplo.com", font=make_font(14), fill="#536078")
    draw.line((1170, 400, 1460, 400), fill="#E3E8F1", width=2)
    for i, (k, v) in enumerate([("Etapa", "Qualificacao"), ("Responsavel", "Marina"), ("Tags", "Plano pequeno")]):
        yy = 440 + i * 80
        draw.text((1170, yy), k, font=make_font(14), fill="#536078")
        draw.text((1170, yy + 25), v, font=make_font(17, True), fill="#172033")
    image.save(path)


def build_architecture_mockup(path: Path):
    image, draw = base_canvas()
    draw.text((70, 55), "BipeSend - arquitetura de referencia", font=make_font(34, True), fill="#172033")
    draw.text((72, 108), "Superficies separadas, contratos compartilhados e isolamento por tenant.", font=make_font(20), fill="#536078")
    boxes = [
        ("www.bipesend.com.br", 85, 220, 380, 340, "#EAF0FF", "#356AE6"),
        ("app.bipesend.com.br", 85, 390, 380, 510, "#EAF0FF", "#356AE6"),
        ("admin.bipesend.com.br", 85, 560, 380, 680, "#EAF0FF", "#356AE6"),
        ("API + WebSocket", 610, 360, 930, 490, "#E8FAF7", "#00A6A6"),
        ("Worker + BullMQ", 610, 560, 930, 690, "#FFF5E4", "#A96B05"),
        ("PostgreSQL + RLS + pgvector", 1160, 260, 1515, 390, "#EAF8EF", "#16845B"),
        ("Redis", 1160, 445, 1515, 555, "#FFF0F2", "#C23B52"),
        ("Storage privado", 1160, 610, 1515, 720, "#F0ECFF", "#7156B8"),
    ]
    for label, x1, y1, x2, y2, fill, accent in boxes:
        draw.rounded_rectangle((x1, y1, x2, y2), radius=18, fill=fill, outline=accent, width=3)
        draw.text((x1 + 22, y1 + 30), label, font=make_font(23, True), fill="#172033")
        draw.text((x1 + 22, y1 + 78), "contexto autorizado", font=make_font(15), fill="#536078")
    arrows = [((380, 280), (610, 420)), ((380, 450), (610, 420)), ((380, 620), (610, 420)), ((930, 420), (1160, 325)), ((930, 625), (1160, 500)), ((930, 625), (1160, 665))]
    for (x1, y1), (x2, y2) in arrows:
        draw.line((x1, y1, x2, y2), fill="#9AA7BA", width=4)
        draw.polygon([(x2, y2), (x2 - 15, y2 - 8), (x2 - 15, y2 + 8)], fill="#9AA7BA")
    draw.rounded_rectangle((470, 760, 1160, 825), radius=14, fill="#172033")
    draw.text((525, 781), "tenant_id -> session -> policy -> query -> audit", font=make_font(21, True), fill="#FFFFFF")
    image.save(path)


def build_superadmin_mockup(path: Path):
    image, draw = base_canvas()
    draw.rounded_rectangle((45, 45, 1555, 855), radius=24, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.rounded_rectangle((45, 45, 315, 855), radius=24, fill="#172033")
    draw.rectangle((280, 45, 325, 855), fill="#172033")
    draw.text((82, 87), "BipeSend", font=make_font(30, True), fill="#FFFFFF")
    draw.text((82, 128), "Superadmin", font=make_font(17), fill="#B9C6DD")
    for i, label in enumerate(["Visao geral", "Tenants", "Planos", "Integracoes", "Regras e docs", "Auditoria"]):
        yy = 220 + i * 66
        if label == "Planos":
            draw.rounded_rectangle((65, yy - 12, 290, yy + 40), radius=12, fill="#2C4169")
        draw.text((92, yy), label, font=make_font(18, label == "Planos"), fill="#FFFFFF" if label == "Planos" else "#B9C6DD")
    draw.text((385, 88), "Planos e entitlements", font=make_font(32, True), fill="#172033")
    draw.text((385, 136), "Defina acesso e limites sem codificar regra por tela.", font=make_font(19), fill="#536078")
    draw.rounded_rectangle((1240, 78, 1485, 130), radius=12, fill="#356AE6")
    draw.text((1300, 94), "+ Novo plano", font=make_font(17, True), fill="#FFFFFF")
    plans = [("Nexo Start", "3 membros", "Rascunho", "#EEF3FF"), ("Nexo Growth", "10 membros", "Ativo", "#E8FAF7"), ("Nexo Scale", "30 membros", "Ativo", "#FFF5E4")]
    for i, (name, limit, status, fill) in enumerate(plans):
        x = 385 + i * 355
        draw.rounded_rectangle((x, 220, x + 320, 410), radius=16, fill=fill, outline="#E3E8F1", width=2)
        draw.text((x + 25, 250), name, font=make_font(22, True), fill="#172033")
        draw.text((x + 25, 300), limit, font=make_font(18), fill="#536078")
        draw.rounded_rectangle((x + 25, 350, x + 125, 383), radius=10, fill="#FFFFFF")
        draw.text((x + 45, 359), status, font=make_font(14, True), fill="#16845B" if status == "Ativo" else "#A96B05")
    draw.rounded_rectangle((385, 465, 1475, 775), radius=16, fill="#FFFFFF", outline="#E3E8F1", width=2)
    draw.text((420, 500), "Feature keys", font=make_font(21, True), fill="#172033")
    rows = [("team.members.max", "10", "hard"), ("ai.copilot.enabled", "true", "feature"), ("pages.published.max", "20", "hard"), ("messages.outbound.monthly", "25000", "metered")]
    for i, (key, value, mode) in enumerate(rows):
        yy = 555 + i * 52
        draw.line((420, yy + 35, 1435, yy + 35), fill="#EEF1F6", width=2)
        draw.text((420, yy), key, font=make_font(16), fill="#172033")
        draw.text((1050, yy), value, font=make_font(16, True), fill="#356AE6")
        draw.text((1260, yy), mode, font=make_font(16), fill="#536078")
    image.save(path)


def build_mockups():
    paths = {
        "login": TMP / "bipesend-login.png",
        "dashboard": TMP / "bipesend-dashboard.png",
        "inbox": TMP / "bipesend-inbox.png",
        "architecture": TMP / "bipesend-architecture.png",
        "superadmin": TMP / "bipesend-superadmin.png",
    }
    build_login_mockup(paths["login"])
    build_dashboard_mockup(paths["dashboard"])
    build_inbox_mockup(paths["inbox"])
    build_architecture_mockup(paths["architecture"])
    build_superadmin_mockup(paths["superadmin"])
    return paths


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverKicker", fontName="NexoSans-Bold", fontSize=11, leading=14, textColor=BLUE, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverTitle", fontName="NexoSans-Bold", fontSize=33, leading=39, textColor=NAVY, spaceAfter=18))
styles.add(ParagraphStyle(name="CoverSubtitle", fontName="NexoSans", fontSize=15, leading=23, textColor=MUTED, spaceAfter=18))
styles.add(ParagraphStyle(name="H1x", parent=styles["Heading1"], fontName="NexoSans-Bold", fontSize=21, leading=26, textColor=NAVY, spaceBefore=12, spaceAfter=9, keepWithNext=True))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="NexoSans-Bold", fontSize=14, leading=18, textColor=BLUE_DARK, spaceBefore=9, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="NexoSans", fontSize=9.3, leading=14, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontName="NexoSans", fontSize=8, leading=11, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontName="NexoSans", fontSize=9.3, leading=14, textColor=NAVY, backColor=HexColor("#EEF3FF"), borderColor=HexColor("#C9D8FF"), borderWidth=0.8, borderPadding=9, spaceBefore=6, spaceAfter=10))
styles.add(ParagraphStyle(name="CodeX", parent=styles["Code"], fontName="Courier", fontSize=7.8, leading=10, textColor=NAVY, backColor=HexColor("#F3F5F8"), borderColor=BORDER, borderWidth=0.5, borderPadding=6, spaceAfter=8))
styles.add(ParagraphStyle(name="TableHead", fontName="NexoSans-Bold", fontSize=7.6, leading=9, textColor=WHITE))
styles.add(ParagraphStyle(name="TableCell", fontName="NexoSans", fontSize=7.4, leading=9.5, textColor=INK))
styles.add(ParagraphStyle(name="Caption", fontName="NexoSans-Italic", fontSize=7.5, leading=10, textColor=MUTED, alignment=TA_CENTER, spaceBefore=4, spaceAfter=8))


def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])


def H1(text):
    p = Paragraph(text, styles["H1x"])
    p._toc_level = 0
    return p


def H2(text):
    p = Paragraph(text, styles["H2x"])
    p._toc_level = 1
    return p


def bullet(text):
    return P(f"- {text}")


def code(text):
    safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return P(safe.replace("\n", "<br/>"), "CodeX")


def table(data, widths, header=True, font_size=7.4):
    converted = []
    for ridx, row in enumerate(data):
        converted.append([P(str(cell), "TableHead" if header and ridx == 0 else "TableCell") for cell in row])
    t = Table(converted, colWidths=widths, repeatRows=1 if header else 0, hAlign="LEFT")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.35, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        commands.extend([("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE)])
        if len(data) > 1:
            commands.append(("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, BG]))
    t.setStyle(TableStyle(commands))
    return t


class NexoDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, **kwargs)
        frame = Frame(18 * mm, 18 * mm, 174 * mm, 254 * mm, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=self.draw_page)])

    def afterFlowable(self, flowable):
        level = getattr(flowable, "_toc_level", None)
        if level is not None:
            text = flowable.getPlainText()
            self.canv.bookmarkPage(f"toc-{self.page}-{level}-{len(text)}")
            self.canv.addOutlineEntry(text, f"toc-{self.page}-{level}-{len(text)}", level=level, closed=False)
            self.notify("TOCEntry", (level, text, self.page))

    @staticmethod
    def draw_page(canvas, doc):
        canvas.saveState()
        width, height = A4
        if doc.page > 1:
            canvas.setStrokeColor(BORDER)
            canvas.setLineWidth(0.5)
            canvas.line(18 * mm, height - 14 * mm, width - 18 * mm, height - 14 * mm)
            canvas.setFont("NexoSans", 7.5)
            canvas.setFillColor(MUTED)
            canvas.drawString(18 * mm, height - 11 * mm, "BipeSend - especificacao v0.2")
            canvas.drawRightString(width - 18 * mm, 11 * mm, f"{doc.page}")
        canvas.restoreState()


def figure(path: Path, width=170 * mm, caption=""):
    image = RLImage(str(path), width=width, height=width * 900 / 1600)
    result = [image]
    if caption:
        result.append(P(caption, "Caption"))
    return result


def build_pdf():
    images = build_mockups()
    pdf_path = OUT / "bipesend-arquitetura-e-roadmap-v0.2.pdf"
    doc = NexoDocTemplate(str(pdf_path), pagesize=A4, title="BipeSend - arquitetura e roadmap v0.2", author="BipeSend")
    story = []

    # Cover
    story.append(Spacer(1, 18 * mm))
    story.append(P("DOCUMENTO DE IDEALIZACAO E FUNDACAO", "CoverKicker"))
    story.append(P("BipeSend", "CoverTitle"))
    story.append(P("Plataforma multitenant de CRM, atendimento, automacao, IA, catalogo e paginas publicadas.", "CoverSubtitle"))
    story.append(Spacer(1, 12 * mm))
    story.append(P("Versao 0.2 - reestruturacao modular para iniciar o produto e orientar agentes de IA", "H2x"))
    story.append(Spacer(1, 5 * mm))
    story.append(P("Este documento transforma a visao inicial em uma base construivel. Ele separa decisoes firmes, hipoteses, riscos, regras de implementacao e um primeiro taskboard. Dominios, marca, precos e provedores ainda precisam de validacao comercial, juridica e operacional.", "Callout"))
    story.append(Spacer(1, 14 * mm))
    story.extend(figure(images["login"], 170 * mm, "Mockup 1 - primeira direcao visual para o login do painel do contratante."))
    story.append(PageBreak())

    # TOC
    story.append(H1("Sumario"))
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(name="TOC0", fontName="NexoSans-Bold", fontSize=10, leading=15, leftIndent=0, textColor=NAVY),
        ParagraphStyle(name="TOC1", fontName="NexoSans", fontSize=8.6, leading=13, leftIndent=15, textColor=MUTED),
    ]
    story.append(toc)
    story.append(PageBreak())

    # 1 vision
    story.append(H1("1. Visao do produto"))
    story.append(P("O BipeSend sera uma plataforma SaaS multitenant para empresas que precisam organizar conversas, contatos, funis, automacoes, catalogos e paginas publicadas em um mesmo ambiente. A proposta e conectar atendimento e venda sem transformar a IA em uma camada com acesso irrestrito."))
    story.append(H2("O que o produto precisa resolver"))
    for item in [
        "dar ao contratante um painel simples para equipe, setores, cargos, conversas e oportunidades",
        "centralizar canais de mensagem com um provider adapter que permita trocar a integracao no futuro",
        "permitir funis, tags, campos e automacoes configuraveis sem criar uma regra nova por cliente",
        "oferecer IA com contexto da empresa, mas com tenant isolation, ferramentas limitadas e aprovacao humana",
        "unificar catalogo, pedidos, paginas e tracking em planos com limites mensuraveis",
        "separar painel tenant, superpainel e landing publica por dominios e politicas diferentes.",
    ]:
        story.append(bullet(item))
    story.append(H2("Decisoes propostas para iniciar"))
    story.append(table([
        ["Tema", "Proposta v0.2", "Status"],
        ["Nome", "BipeSend", "nome escolhido; validar marca e dominios"],
        ["Frontend", "Next.js, React, TypeScript, Tailwind e UI acessivel", "decidido para MVP"],
        ["Backend", "NestJS com Fastify, REST v1 e WebSocket", "decidido para MVP"],
        ["Dados", "PostgreSQL, RLS, migracoes SQL/Drizzle e pgvector", "decidido para MVP"],
        ["Filas", "Redis + BullMQ com outbox no PostgreSQL", "decidido para MVP"],
        ["IA", "microsservico Python/FastAPI; Node como autoridade", "decidido para MVP"],
        ["WhatsApp", "adapter isolado; provider nao oficial apenas em ambiente controlado", "risco alto; validar antes de vender"],
    ], [34 * mm, 92 * mm, 44 * mm]))
    story.append(PageBreak())

    # 2 domains and architecture
    story.append(H1("2. Superficies, dominios e arquitetura"))
    story.append(P("A separacao por dominio facilita politicas de cookie, observabilidade, deploy, SEO e controle de acesso. O frontend pode compartilhar tokens e componentes, mas cada superficie deve ter seu contexto de autenticacao."))
    story.append(table([
        ["Superficie", "Dominio candidato", "Responsabilidade"],
        ["Dominio primario", "bipesend.com.br", "mercado brasileiro; registrar apos validacao"],
        ["Dominio secundario", "bipesend.com", "reserva/redirecionamento planejado"],
        ["Landing", "www.bipesend.com.br", "marketing, SEO, cadastro e checkout"],
        ["Painel tenant", "app.bipesend.com.br", "CRM, inbox, equipe, billing e configuracoes"],
        ["Superpainel", "admin.bipesend.com.br", "tenants, planos, regras, integracoes e suporte"],
        ["API", "api.bipesend.com.br", "REST, WebSocket, auth e contratos"],
        ["Webhooks", "hooks.bipesend.com.br", "callbacks de provedores com idempotencia"],
        ["Publicacao", "tenant-slug.bipesend.com.br", "landing/catalogo do contratante"],
    ], [32 * mm, 46 * mm, 92 * mm]))
    story.append(H2("Arquitetura de alto nivel"))
    story.extend(figure(images["architecture"], 170 * mm, "Mockup 2 - o tenant atravessa toda a cadeia: sessao, policy, query e auditoria."))
    story.append(P("O caminho de dados deve ser previsivel: browser -> API -> autenticacao -> TenantContext -> autorizacao -> caso de uso -> repositorio -> PostgreSQL. Workers recebem jobs tipados; a IA chama somente ferramentas registradas. Nenhuma tela deve acessar banco ou provider diretamente."))
    story.append(H2("Estrutura de pastas proposta"))
    story.append(code("""apps/
  tenant-web/       painel app.bipesend.com.br
  superadmin-web/   painel admin.bipesend.com.br
  marketing-web/    landing www.bipesend.com.br
  api/              NestJS/Fastify
  worker/           BullMQ, webhooks, automacoes e mensagens
  ai-worker/        jobs assincronos de ingestao e avaliacao
services/
  ai-service/       microsservico Python/FastAPI para RAG e LLM
packages/
  ui/ db/ auth/ contracts/ events/ security/ config
rules/              regras lidas por agentes de IA
docs/               taskboard, ADRs e arquitetura
infra/              Docker, proxy, migrations operacionais
scripts/            checks e geracao de artefatos"""))
    story.append(H2("Estrutura modular e ordem cronologica"))
    story.append(code("""apps/api/src/modules/
  00-shared/  01-identity/  02-tenancy/  03-authorization/
  04-team/    05-crm/       06-inbox/    07-messaging/
  08-automation/ 09-knowledge/ 10-catalog/ 11-pages/
  12-billing/ 13-integrations/ 14-platform/ 99-test-support/

Cada modulo: domain/ application/ infrastructure/ presentation/ tests/
Cada frontend: app/ features/ components/ lib/ styles/ tests/"""))
    story.append(P("A numeracao representa ordem de dependencia e construcao. Arquivos de codigo nao recebem numeros artificiais; usam nomes semanticos e unicos, como `create-tenant.use-case.ts` e `tenant-http.controller.ts`. Arquivos acima de 300 linhas exigem justificativa e acima de 500 devem ser divididos, salvo excecoes documentadas."))
    story.append(PageBreak())

    # 3 tenancy
    story.append(H1("3. Tenant, identidade e hierarquia"))
    story.append(P("Tenant nao e apenas um filtro no frontend. E um contexto de seguranca que deve ser propagado pela sessao, caso de uso, banco, fila, storage, cache, logs e IA."))
    story.append(H2("Modelo minimo"))
    story.append(table([
        ["Entidade", "Papel", "Regra"],
        ["tenants", "empresa contratante", "estado, slug, plano e configuracoes"],
        ["users", "identidade global", "nao guarda dados operacionais de tenant"],
        ["memberships", "vinculo user-tenant", "status, cargo e preferencia"],
        ["roles", "cargo configuravel", "nunca acima do criador/tenant_admin"],
        ["permissions", "capacidade canonica", "chaves estaveis, sem nomes livres"],
        ["audit_logs", "trilha de seguranca", "actor, tenant, recurso e resultado"],
    ], [32 * mm, 50 * mm, 88 * mm]))
    story.append(H2("Hierarquia proposta"))
    for item in [
        "platform_owner: equipe proprietaria, em superficie e autenticacao separadas.",
        "tenant_admin: pessoa que contratou; controla o tenant e nao pode ser removida por manager.",
        "manager: cargo configuravel, limitado pelas permissoes que possui.",
        "agent: opera inbox/CRM dentro do escopo atribuido.",
        "viewer: leitura limitada.",
    ]:
        story.append(bullet(item))
    story.append(P("O frontend nunca decide se alguem e admin. O backend calcula a autorizacao com RBAC + ABAC: permissao, tenant, setor, recurso, estado e acao. O superadmin pode ter acesso de suporte somente com motivo, prazo e auditoria."))
    story.append(H2("RLS e defesa em profundidade"))
    story.append(code("""BEGIN;
SELECT set_config('app.tenant_id', :tenant_id, true);
SELECT set_config('app.user_id', :user_id, true);
-- repositorio executa query tenant-owned;
-- PostgreSQL aplica policy RLS e FORCE ROW LEVEL SECURITY;
COMMIT;"""))
    story.append(P("RLS nao substitui autorizacao de negocio. Ele reduz o impacto de um bug de query, enquanto a camada de aplicacao decide se a pessoa pode ver, editar, atribuir ou exportar aquele recurso."))
    story.append(PageBreak())

    # 4 security
    story.append(H1("4. Seguranca e protecao de dados"))
    story.append(P("Seguranca sera tratada como requisito de produto. O primeiro threat model deve cobrir IDOR/cross-tenant, sequestro de conta, upload malicioso, XSS/CSRF/SSRF, webhook forjado, abuso de filas, prompt injection, exfiltracao e segredo exposto."))
    story.append(table([
        ["Area", "Controle minimo"],
        ["Senha e sessao", "Argon2id, cookie HttpOnly/Secure/SameSite, rotacao e invalidacao"],
        ["Segredos", "secret manager; envelope encryption AES-256-GCM; chave mestra fora do banco"],
        ["API", "schemas, limite, timeout, idempotencia, erros seguros e audit trail"],
        ["Webhooks", "assinatura, timestamp, raw body quando necessario, dedupe e retry"],
        ["Uploads", "quarentena, MIME allowlist, limite, scan, storage privado e URL assinada"],
        ["IA", "tools allowlist, read-only inicial, sem SQL/codigo/filesystem e com limites"],
        ["WhatsApp", "opt-in, supressao, rate limit, pausa em erro e provider isolado"],
        ["Operacao", "logs sem segredos, dependency scan, backups e restore drill"],
    ], [35 * mm, 135 * mm]))
    story.append(H2("Chaves e APIs no banco"))
    story.append(P("O usuario pode cadastrar uma integracao no painel, mas o browser envia o segredo somente para um endpoint server-side. O backend cifra o valor com uma chave de envelope versionada, grava apenas ciphertext/nonce/tag/key_version e devolve ao frontend somente estado e mascara. Workers descriptografam apenas no momento do uso e nunca registram o valor."))
    story.append(H2("Risco do WhatsApp nao oficial"))
    story.append(P("A integracao nao oficial pode sofrer instabilidade, logout, bloqueio ou incompatibilidade. O produto nao deve prometer anti-bloqueio. A arquitetura deve permitir desligar esse provider e conectar uma alternativa oficial sem reescrever CRM, inbox, automacoes ou billing." , "Callout"))
    story.append(PageBreak())

    # 5 stack
    story.append(H1("5. Stack e decisoes de implementacao"))
    story.append(table([
        ["Camada", "Escolha", "Por que"],
        ["UI", "Next.js + React + TypeScript", "SEO na landing, componentes compartilhados e boa experiencia responsiva"],
        ["Estilo", "Tailwind + tokens + componentes acessiveis", "consistencia sem CSS espalhado"],
        ["API", "NestJS + Fastify", "modulos, pipes, guards, WebSocket e contratos claros"],
        ["ORM/migrations", "Drizzle + SQL explicito para RLS", "controle fino de transacoes, indices e policies"],
        ["Banco", "PostgreSQL + pgvector", "estado, filtros tenant e embeddings no mesmo sistema"],
        ["Filas", "Redis + BullMQ", "jobs, retry, delay, concorrencia e observabilidade"],
        ["IA", "Python/FastAPI separado; Node orquestra negocio", "RAG/LLM isolado sem misturar autorizacao"],
        ["Local", "Docker Compose + Mailpit + MinIO + ngrok", "callbacks e testes sem credenciais reais"],
        ["CI", "GitHub Actions", "checks e protecao de branch"],
    ], [34 * mm, 58 * mm, 78 * mm]))
    story.append(H2("Redis/BullMQ ou somente PostgreSQL?"))
    story.append(P("Para o MVP, Redis + BullMQ e a escolha operacional para filas e agendamentos. PostgreSQL continua sendo a fonte de verdade, com outbox transacional. Se a operacao crescer ou Redis deixar de ser conveniente, o contrato de job permanece e o backend de fila pode ser trocado sem mover o estado do negocio."))
    story.append(H2("Node.js e Python para IA"))
    story.append(P("Node.js continua sendo o nucleo de identidade, tenant, regras de negocio, WebSockets, billing, webhooks, filas e envio. O Python/FastAPI roda como microsservico interno: recebe do Node apenas o historico autorizado, contexto assinado, politica e request id; consulta RAG e provedores LLM; devolve resposta, fontes, confianca e propostas de ferramenta. Ele nao grava no CRM, nao envia mensagem e nao executa codigo."))
    story.append(PageBreak())

    # 6 AI
    story.append(H1("6. IA, RAG e MCP com seguranca"))
    story.append(P("O tenant podera subir manuais, produtos, regras e textos. O sistema transforma esses documentos em conhecimento pesquisavel, mas deve tratar todo texto como dado nao confiavel. Uma instrucao maliciosa dentro de um PDF nao pode alterar as politicas do agente."))
    story.append(H2("Pipeline RAG"))
    story.append(code("""upload privado
  -> quarentena e antivirus
  -> extracao/normalizacao
  -> chunks com document_id, versao e tenant_id
  -> embeddings via provider autorizado
  -> pgvector + metadados
  -> retrieval filtrado por tenant/status/permissao
  -> prompt com fontes e politica
  -> resposta com incerteza e auditoria"""))
    story.append(H2("Guardrails obrigatorios"))
    for item in [
        "modelo nao recebe credenciais, SQL, shell, filesystem ou acesso direto ao banco",
        "ferramentas sao allowlist, versionadas, tipadas e limitadas por tenant e permissao",
        "envio de mensagem, desconto, alteracao de pedido ou exclusao exigem aprovacao quando a politica definir",
        "limites de tokens, custo, tempo e chamadas protegem plano e disponibilidade",
        "logs usam mascaramento e retencao definida; documentos despublicados nao entram no retrieval",
        "cada resposta pode carregar referencias internas para a empresa revisar a origem.",
    ]:
        story.append(bullet(item))
    story.append(H2("MCP interno"))
    story.append(P("MCP sera um gateway de ferramentas, nao um passe livre para plugins externos. No MVP, somente ferramentas read-only como consulta de catalogo, lookup de contato e resumo de conversa. O gateway valida OAuth/identidade quando aplicavel, schema, tenant, permissao, rate limit, origem e auditoria. Servidores MCP arbitrarios fornecidos por clientes ficam fora do MVP."))
    story.append(PageBreak())

    # 7 CRM/WhatsApp/catalog/pages
    story.append(H1("7. Modulos de negocio"))
    story.extend(figure(images["dashboard"], 170 * mm, "Mockup 3 - painel claro, compacto e orientado a metricas explicaveis."))
    story.append(H2("CRM e inbox"))
    story.append(P("O painel deve permitir lista, kanban e inbox sem duplicar a fonte de dados. Cards de funil e conversas apontam para entidades canonicas. Atribuicao pode ser por setor, cargo ou colaborador, mas cada acao respeita RBAC/ABAC e registra auditoria."))
    story.extend(figure(images["inbox"], 170 * mm, "Mockup 4 - inbox com lista, conversa e perfil completo do contato."))
    story.append(H2("Automacoes"))
    story.append(P("Automacoes sao grafos/DSL versionados com gatilho, condicao, acao, janela, timezone, limite e historico. O editor nao gera codigo executavel. Um workflow pode mover card, aplicar tag, criar tarefa, agendar mensagem ou pedir aprovacao; a execucao passa por fila e policy."))
    story.append(H2("Catalogo e paginas"))
    story.append(P("Catalogo deve ter categorias, produtos, opcoes, imagens, videos, disponibilidade e pedidos. O editor de paginas comeca com blocos tipados e temas, nao com HTML/JS livre. Cada pagina publicada tem slug, SEO, alt text, canonical, pixel allowlist e rollback."))
    story.append(PageBreak())

    # 8 plans gateways
    story.append(H1("8. Planos, billing e gateways"))
    story.extend(figure(images["superadmin"], 170 * mm, "Mockup 5 - superpainel para planos e feature keys configuraveis."))
    story.append(H2("Entitlements"))
    story.append(P("O plano e um conjunto de feature keys. A API calcula se a empresa pode usar uma funcionalidade e qual limite se aplica. O frontend nao deve possuir ifs de negocio baseados em nome de plano; ele consome entitlements tipados."))
    story.append(table([
        ["Plano de trabalho", "Perfil", "Limites ilustrativos"],
        ["Nexo Start", "pequena equipe", "3 membros, 1 numero, CRM basico"],
        ["Nexo Growth", "vendas em crescimento", "10 membros, 3 numeros, automacoes e copiloto"],
        ["Nexo Scale", "operacao multicanal", "30 membros, 10 numeros, RAG, catalogo e paginas"],
        ["Nexo Enterprise", "contrato customizado", "limites, integracoes e suporte negociados"],
    ], [38 * mm, 54 * mm, 78 * mm]))
    story.append(H2("Stripe Connect e Mercado Pago"))
    story.append(P("A integracao inicial deve ser sandbox-first. O superadmin cadastra credenciais de plataforma no backend; o tenant instala o gateway por OAuth. O callback valida state/PKCE quando aplicavel, usa redirect allowlist e salva tokens criptografados. Webhooks sao a fonte de verdade para estado de pagamento, com assinatura e idempotencia."))
    story.append(P("Upgrade pode liberar limites apos confirmacao do provedor. Downgrade deve valer no proximo ciclo por padrao e nunca apagar dados acima do novo limite; bloqueia novas criacoes e oferece ajuste/exportacao."))
    story.append(PageBreak())

    # 9 UX design
    story.append(H1("9. Direcao visual, UX, acessibilidade e SEO"))
    story.append(H2("Direcao visual"))
    story.append(P("Painel claro, moderno, minimalista e denso sem ser apertado. Sidebar de 240 px, topbar enxuta, cards com raio 10-12 px, sombras discretas e hierarquia tipografica moderada. A interface deve orientar uma proxima acao, nao exibir numeros sem contexto."))
    story.append(table([
        ["Token", "Valor proposto", "Uso"],
        ["brand.600", "#356AE6", "acao primaria"],
        ["ink.900", "#172033", "texto principal"],
        ["ink.600", "#536078", "texto secundario"],
        ["surface.50", "#F7F9FC", "fundo"],
        ["border.200", "#E3E8F1", "divisorias"],
        ["success.600", "#16845B", "sucesso"],
        ["danger.600", "#C23B52", "erro"],
    ], [38 * mm, 42 * mm, 90 * mm]))
    story.append(H2("Tipografia e responsividade"))
    story.append(P("Inter auto-hospedada para UI e Manrope opcional para marketing, com fallback system-ui. Corpo 14-16 px, escala 12/14/16/18/20/24/28/32/40, line-height 1.4-1.55. Breakpoints praticos: 360, 768, 1024 e 1440 px. Inbox e CRM devem funcionar em 360 px."))
    story.append(H2("Acessibilidade e SEO"))
    story.append(P("Alvo WCAG 2.2 AA: labels, foco visivel, teclado, contraste, dialogs corretos, reduced motion, live regions e alternativa ao drag-and-drop. Landing e sites publicados usam title, description, canonical, sitemap, Open Graph, schema quando aplicavel, headings semanticos, alt text e performance. Painel autenticado usa noindex."))
    story.append(PageBreak())

    # 10 login first
    story.append(H1("10. Primeiro desenvolvimento: login e painel do contratante"))
    story.append(P("O primeiro incremento deve ser pequeno, completo e testavel. A experiencia comeca na tela de login, mas o trabalho inclui o contrato de sessao, verificacao de e-mail, recuperacao, tenant context, autorizacao e o shell responsivo."))
    story.append(H2("Fluxo funcional"))
    story.append(code("""1. usuario abre app.bipesend.com.br
2. envia e-mail e senha
3. API valida credenciais e estado da conta
4. API cria sessao server-side e cookie seguro
5. app carrega tenant ativo e membership
6. layout mostra apenas rotas autorizadas
7. logout invalida sessao no servidor
8. esqueci senha usa token unico e expiracao curta"""))
    story.append(H2("Criterios de aceite do primeiro marco"))
    for item in [
        "registro nao cria tenant sem verificar e-mail",
        "senha nunca aparece em logs ou respostas",
        "sessao nao e armazenada em localStorage",
        "usuario suspenso nao entra e recebe resposta segura",
        "manager nao consegue elevar cargo, remover tenant_admin ou ler outro tenant",
        "RLS e teste de cross-tenant falham fechado",
        "recuperacao invalida token apos uso e limita reenvio",
        "telas funcionam por teclado e em 360 px",
        "CI roda lint, typecheck, testes e secret scan.",
    ]:
        story.append(bullet(item))
    story.append(H2("Nao fazer ainda"))
    story.append(P("Nao acoplar o login a WhatsApp, IA, Stripe, Mercado Pago ou editor de paginas. Essas integracoes dependem de identidade e tenant estaveis; acopla-las cedo aumenta risco e retrabalho." , "Callout"))
    story.append(PageBreak())

    # 11 taskboard
    story.append(H1("11. Roadmap e taskboard"))
    story.append(P("O taskboard completo esta em `docs/taskboard.md` e o mapa de pastas em `docs/module-map.md`. A construcao comeca por FND-007/FND-008, depois ambiente local e identidade; CRM, WhatsApp, IA, catalogo, paginas e billing entram depois da fundacao."))
    story.append(table([
        ["Fase", "Entrega", "Dependencia principal"],
        ["0", "regras, ADRs, Git e threat model", "decisao de produto"],
        ["1", "Docker, config, health, logs e CI", "fundacao local"],
        ["2", "login, tenant, RBAC e shell", "primeiro marco"],
        ["3", "equipe, setores e auditoria", "identity"],
        ["4", "CRM, inbox e tempo real", "team + contracts"],
        ["5", "filas, WhatsApp e automacoes", "inbox + provider adapter"],
        ["6", "RAG, copiloto e MCP interno", "documentos + policy"],
        ["7", "catalogo e pages builder", "CRM + entitlements"],
        ["8", "billing e gateways", "planos + webhooks"],
        ["9", "operacao, pentest e mobile", "sistema estabilizado"],
    ], [20 * mm, 90 * mm, 60 * mm]))
    story.append(H2("Sprint 1"))
    story.append(P("Comecar por FND-007/008, depois INF-001/002/003, AUTH-001/004, AUTH-002/003/005, AUTH-006/008/009 e finalizar com AUTH-010/011/012. O resultado e um skeleton modular e um painel de contratante com login seguro e tenant isolation testada."))
    story.append(PageBreak())

    # 12 AI commands
    story.append(H1("12. Como usar a base com ChatGPT, Gemini, Claude e outras IAs"))
    story.append(P("A pasta `rules/` e a fonte de verdade operacional do repositorio. O PDF ajuda humanos a entenderem o produto; o agente deve ler os arquivos Markdown, o taskboard e as decisoes antes de editar."))
    story.append(H2("Comando principal"))
    story.append(code("""!construibase

Leia rules/00_MASTER.md e todos os arquivos de regras na ordem.
Leia docs/taskboard.md e docs/decisions.md.
Leia docs/module-map.md.
Se nenhuma tarefa for informada, apenas valide a fundacao e indique o proximo item READY.
Inspecione o modulo solicitado.
Proponha arquivos, riscos e testes.
Implemente a menor mudanca segura.
Rode checks e atualize taskboard/decisoes."""))
    story.append(H2("Comandos auxiliares"))
    story.append(table([
        ["Comando", "Finalidade"],
        ["!planejar <modulo>", "plano sem editar codigo; entidades, permissoes, eventos e testes"],
        ["!auditar <modulo>", "procurar falhas de tenant, segredo, acessibilidade e contrato"],
        ["!migrar <mudanca>", "propor migration, RLS, indices, backfill e rollback"],
    ], [52 * mm, 118 * mm]))
    story.append(H2("Prompt de handoff recomendado"))
    story.append(code("""Use !construibase para implementar AUTH-010.
Objetivo: tela de login do tenant-web.
Nao implemente WhatsApp, IA ou pagamentos.
Respeite rules/04_SECURITY.md, 05_AUTH_RBAC.md,
12_UX_UI.md, 13_ACCESSIBILITY_SEO.md e 14_DESIGN_TOKENS.md.
Entregue testes de estados de erro, teclado e sessao."""))
    story.append(P("O superpainel pode exibir e versionar a documentacao, mas o codigo em Git e a revisao por pull request continuam sendo a fonte de verdade para mudancas tecnicas. A IA nao deve ser autorizada a transformar o painel de regras em um mecanismo de execucao irrestrita."))
    story.append(PageBreak())

    # 13 risk and references
    story.append(H1("13. Riscos, perguntas abertas e referencias"))
    story.append(H2("Riscos que precisam de decisao"))
    for item in [
        "validar marca e disponibilidade dos dominios BipeSend",
        "definir politica comercial, precos, impostos, limites e retencao",
        "avaliar juridica e operacionalmente o provider de WhatsApp nao oficial",
        "definir provedor de storage, secret manager, e-mail e observabilidade de producao",
        "definir politica de dados para provedores de IA e RAG",
        "definir se o editor de paginas sera somente interno ou produto vendavel no primeiro ano",
        "planejar SSO/MFA e requisitos empresariais depois do MVP.",
    ]:
        story.append(bullet(item))
    story.append(H2("Referencias tecnicas consultadas"))
    refs = [
        "PostgreSQL - Row Security Policies: https://www.postgresql.org/docs/17/ddl-rowsecurity.html",
        "BullMQ - filas e conexoes: https://docs.bullmq.io/",
        "Stripe Connect OAuth: https://docs.stripe.com/connect/oauth-standard-accounts",
        "Mercado Pago OAuth: https://www.mercadopago.com.br/developers/pt/docs/security/oauth/creation",
        "pgvector: https://github.com/pgvector/pgvector",
        "Model Context Protocol: https://modelcontextprotocol.io/specification",
        "Next.js: https://nextjs.org/docs",
        "NestJS: https://docs.nestjs.com/",
    ]
    for ref in refs:
        story.append(bullet(ref))
    story.append(P("As referencias acima servem para confirmar contratos e capacidades das ferramentas. Elas nao substituem revisao de seguranca, termos de uso, privacidade, requisitos legais ou testes no ambiente do projeto."))
    story.append(H2("Conclusao de fase"))
    story.append(P("A plataforma pode ser grande, mas a construcao segura comeca pequena: identidade, tenant, autorizacao, auditoria e um painel consistente. Quando essa base estiver verde, os demais modulos podem crescer por contratos e filas sem perder o controle de dados." , "Callout"))

    doc.multiBuild(story, maxPasses=3)
    return pdf_path, images


if __name__ == "__main__":
    pdf, image_paths = build_pdf()
    print(f"PDF: {pdf}")
    for key, value in image_paths.items():
        print(f"IMAGE_{key.upper()}: {value}")
