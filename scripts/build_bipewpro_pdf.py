"""Render the versioned BipeWPRO plan as a searchable, linked PDF.

Requires reportlab and DejaVu Sans fonts. Usage:
  python3 scripts/build_bipewpro_pdf.py --output /absolute/path/bipewpro-planejamento.pdf
The Markdown remains the source of truth; this script does not publish anything.
"""
from __future__ import annotations

import argparse
import html
import os
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

ROOT = Path(__file__).resolve().parents[1]
INK = colors.HexColor('#0f172a')
BLUE = colors.HexColor('#075fd8')
VIOLET = colors.HexColor('#5145cd')
MUTED = colors.HexColor('#475569')
PALE = colors.HexColor('#edf1f8')
W, H = A4
WIDTH = W - 94


def register_fonts() -> None:
    candidates = [Path('/usr/share/fonts/truetype/dejavu')]
    runtime = os.environ.get('CODEX_PRIMARY_RUNTIME_ROOT')
    if runtime:
        candidates.append(Path(runtime) / 'dependencies/native/libreoffice-headless/libreoffice/share/fonts/truetype')
    font_root = next((p for p in candidates if (p / 'DejaVuSans-Bold.ttf').exists()), None)
    if font_root is None:
        raise RuntimeError('Install DejaVu Sans fonts before rendering.')
    for name, filename in [('Body', 'DejaVuSans.ttf'), ('BodyBold', 'DejaVuSans-Bold.ttf'), ('Mono', 'DejaVuSansMono.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(font_root / filename)))
    pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='Body', boldItalic='BodyBold')


def inline(value: str) -> str:
    value = value.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-')
    held: list[str] = []

    def hold(fragment: str) -> str:
        held.append(fragment)
        return f'ZZTOKEN{len(held)-1}ZZ'

    value = re.sub(r'`([^`]+)`', lambda m: hold(f'<font name="Mono" size="8">{html.escape(m.group(1))}</font>'), value)
    value = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', lambda m: hold(f'<link href="{html.escape(m.group(2), quote=True)}" color="#075fd8">{html.escape(m.group(1))}</link>'), value)
    value = html.escape(value)
    value = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', value)
    for i, fragment in enumerate(held):
        value = value.replace(f'ZZTOKEN{i}ZZ', fragment)
    return value


class EditorDiagram(Flowable):
    """A vector schematic, not a product screenshot."""
    def __init__(self):
        super().__init__()
        self.width, self.height = WIDTH, 186

    def draw(self):
        c = self.canv
        c.setFillColor(colors.HexColor('#1e2a3e'))
        c.roundRect(0, 0, WIDTH, 178, 10, fill=1, stroke=0)
        c.setFillColor(colors.HexColor('#b6c4da'))
        c.setFont('Body', 8)
        c.drawString(14, 158, 'ELEMENTOS / PROPRIEDADES')
        c.drawString(164, 158, 'PREVIA RESPONSIVA')
        c.setFillColor(colors.HexColor('#141e2f'))
        c.roundRect(10, 12, 139, 133, 7, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.roundRect(158, 12, WIDTH-168, 133, 7, fill=1, stroke=0)
        for i, label in enumerate(['Conteudo', 'Flex / Grid', 'Estilo', 'Mobile / Desktop']):
            y = 118-i*28
            c.setFillColor(colors.HexColor('#2e405b'))
            c.roundRect(20, y-8, 119, 21, 4, fill=1, stroke=0)
            c.setFillColor(colors.HexColor('#edf3fc'))
            c.drawString(28, y, label)
        c.setFillColor(PALE)
        c.roundRect(172, 112, WIDTH-196, 21, 4, fill=1, stroke=0)
        c.setFillColor(BLUE)
        c.roundRect(174, 36, 73, 19, 4, fill=1, stroke=0)
        c.setFont('BodyBold', 10)
        c.setFillColor(INK)
        c.drawString(174, 87, 'Um documento.')
        c.drawString(174, 71, 'Cada tela no seu formato.')
        c.setFont('Body', 7)
        c.setFillColor(colors.white)
        c.drawString(191, 42, 'Saiba mais')


class PlanDoc(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(filename, pagesize=A4, leftMargin=47, rightMargin=47,
                         topMargin=54, bottomMargin=48, title='BipeWPRO - Planejamento completo',
                         author='BipeSend', subject='Produto, arquitetura, Food, planos e execução')
        self.addPageTemplates(PageTemplate(id='standard', frames=[Frame(47, 48, WIDTH, H-102,
            leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=self.decorate))
        self.section_index = 0

    def beforeDocument(self):
        self.section_index = 0

    def decorate(self, canvas, doc):
        canvas.saveState()
        if doc.page == 1:
            canvas.setFillColor(INK)
            canvas.rect(0, 0, W, H, stroke=0, fill=1)
            canvas.setFillColor(BLUE)
            canvas.rect(0, H-12, W*0.62, 12, stroke=0, fill=1)
            canvas.setFillColor(VIOLET)
            canvas.rect(W*0.62, H-12, W*0.38, 12, stroke=0, fill=1)
        else:
            canvas.setFillColor(BLUE)
            canvas.rect(47, H-29, 28, 3, stroke=0, fill=1)
            canvas.setFont('BodyBold', 8)
            canvas.setFillColor(INK)
            canvas.drawString(83, H-29, 'BipeWPRO')
            canvas.setFont('Body', 7.3)
            canvas.setFillColor(MUTED)
            canvas.drawRightString(W-47, H-29, 'PLANEJAMENTO 1.0 | 15.09.2026')
            canvas.setStrokeColor(colors.HexColor('#d9e1ed'))
            canvas.line(47, 36, W-47, 36)
            canvas.setFont('Body', 7)
            canvas.drawString(47, 23, 'BipeSend | Produto, arquitetura e execução por etapas')
            canvas.drawRightString(W-47, 23, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == 'Section':
            title = flowable.getPlainText()
            key = f'section-{self.section_index}'
            self.section_index += 1
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, 0)
            self.notify('TOCEntry', (0, title, self.page, key))


def build(output: Path) -> None:
    register_fonts()
    body = ParagraphStyle('Body', fontName='Body', fontSize=9.2, leading=14,
                          textColor=INK, spaceAfter=8, splitLongWords=True)
    section = ParagraphStyle('Section', parent=body, fontName='BodyBold', fontSize=15,
                             leading=20, textColor=BLUE, spaceBefore=19, spaceAfter=10, keepWithNext=True)
    sub = ParagraphStyle('Subsection', parent=body, fontName='BodyBold', fontSize=11,
                         leading=16, spaceBefore=12, keepWithNext=True)
    cell = ParagraphStyle('Cell', parent=body, fontSize=8.1, leading=11.5, spaceAfter=0)
    cell_head = ParagraphStyle('CellHead', parent=cell, fontName='BodyBold', textColor=colors.white)
    bullet = ParagraphStyle('Bullet', parent=body, leftIndent=11, firstLineIndent=-9, spaceAfter=5)
    story = [Spacer(1, 50)]
    story += [Paragraph('BIPESEND / PRODUTO & ENGENHARIA', ParagraphStyle('Kicker', parent=body,
               fontSize=9, textColor=colors.HexColor('#9ac3ff'), spaceAfter=25))]
    story += [Paragraph('BipeWPRO', ParagraphStyle('CoverTitle', parent=body, fontName='BodyBold',
               fontSize=44, leading=52, textColor=colors.white, spaceAfter=12))]
    story += [Paragraph('Construtor de sites,<br/>landing pages e catálogos Food', ParagraphStyle('CoverSubtitle',
               parent=body, fontSize=22, leading=31, textColor=colors.HexColor('#dce9ff'), spaceAfter=22))]
    story += [Paragraph('Plano completo de produto, arquitetura, segurança, design system, publicação e integração com planos.',
               ParagraphStyle('CoverBody', parent=body, fontSize=11, leading=18, textColor=colors.HexColor('#b6c4da')))]
    story += [Spacer(1, 25), EditorDiagram(), Spacer(1, 24)]
    for text in ['Versão 1.0 | 15 de setembro de 2026', 'Branch: feat/bipewpro-planning | Base: 489fae2',
                 'Planejamento para execução por etapas. Interface acima: esquema conceitual.']:
        story.append(Paragraph(text, ParagraphStyle('CoverMeta', parent=body, fontSize=8.4,
                    leading=13, textColor=colors.HexColor('#b6c4da'))))
    story.append(PageBreak())
    story.append(Paragraph('Guia de leitura', ParagraphStyle('ContentsTitle', parent=section, fontSize=24, leading=31)))
    story.append(Paragraph('O documento parte da base real do repositório e detalha o produto desejado. '
                           'A implementação será acompanhada pelos cards PAGE, CAT, BILL e WPRO.', body))
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle('TOC', fontName='Body', fontSize=9.1, leading=12,
                                     textColor=INK, spaceBefore=0, spaceAfter=0,
                                     leftIndent=0, firstLineIndent=0)]
    story += [toc, PageBreak()]

    lines = (ROOT / 'docs/plans/bipewpro.md').read_text().splitlines()
    i = next(i for i, line in enumerate(lines) if line.startswith('Este documento'))
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('## '):
            title = line[3:]
            story.append(Paragraph(inline(title), section))
            i += 1
        elif line.startswith('### '):
            story.append(Paragraph(inline(line[4:]), sub))
            i += 1
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                raw = [x.strip() for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', x) for x in raw):
                    rows.append(raw)
                i += 1
            count = len(rows[0])
            fractions = {2: [.32, .68], 3: [.25, .37, .38], 4: [.18, .28, .27, .27]}[count]
            data = [[Paragraph(inline(x), cell_head if n == 0 else cell) for x in row] for n, row in enumerate(rows)]
            table = Table(data, colWidths=[WIDTH*f for f in fractions], repeatRows=1, hAlign='LEFT')
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), INK), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f4f6fb')]),
                ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LINEBELOW', (0, -1), (-1, -1), .4, colors.HexColor('#d9e1ed')),
            ]))
            story += [table, Spacer(1, 10)]
        elif line.startswith('- ') or re.match(r'^\d+\. ', line):
            if line.startswith('- '):
                content = '• ' + line[2:]
            else:
                content = line
            story.append(Paragraph(inline(content), bullet))
            i += 1
        else:
            text_lines = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r'^(#{1,3} |\||- |\d+\. )', lines[i]):
                text_lines.append(lines[i].strip())
                i += 1
            story.append(Paragraph(inline(' '.join(text_lines)), body))
    output.parent.mkdir(parents=True, exist_ok=True)
    PlanDoc(str(output)).multiBuild(story)
    print(f'PDF created: {output} ({output.stat().st_size} bytes)')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT / 'output/pdf/bipewpro-planejamento.pdf')
    build(parser.parse_args().output.resolve())
