from pathlib import Path
import re
from html import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'output/poster-narrative-3/research-paper.md'
OUTPUT=SOURCE.with_suffix('.pdf')
FONTS=Path('/usr/share/fonts/liberation')
for family in ('Serif','Sans'):
    for suffix,filename in [('', 'Regular'),('-Bold','Bold'),('-Italic','Italic'),('-BoldItalic','BoldItalic')]:
        pdfmetrics.registerFont(TTFont(family+suffix,str(FONTS/f'Liberation{family}-{filename}.ttf')))
    pdfmetrics.registerFontFamily(family,normal=family,bold=family+'-Bold',italic=family+'-Italic',boldItalic=family+'-BoldItalic')

body=ParagraphStyle('body',fontName='Serif',fontSize=10.5,leading=12.5,alignment=TA_JUSTIFY,spaceAfter=5)
title=ParagraphStyle('title',fontName='Sans-Bold',fontSize=15,leading=18,spaceAfter=10,textColor=colors.HexColor('#183442'))
heading=ParagraphStyle('heading',fontName='Sans-Bold',fontSize=12,leading=14,spaceBefore=7,spaceAfter=5,keepWithNext=True)
bullet=ParagraphStyle('bullet',parent=body,leftIndent=11,firstLineIndent=-9,spaceAfter=2,alignment=TA_LEFT)
reference=ParagraphStyle('reference',parent=body,fontSize=8.6,leading=10,spaceAfter=3,alignment=TA_LEFT)
caption=ParagraphStyle('caption',parent=body,fontSize=9,leading=10.5,spaceAfter=5,keepWithNext=True)
cell=ParagraphStyle('cell',parent=body,fontSize=9.5,leading=11,spaceAfter=0,alignment=TA_LEFT)
number=ParagraphStyle('number',parent=cell,alignment=TA_RIGHT)

def inline(s):
    s=escape(s).replace('—','-').replace('–','-')
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:f'<link href="{m[2]}" color="#215970">{m[1]}</link>',s)
    s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
    s=re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)',r'<i>\1</i>',s)
    return re.sub(r'`([^`]+)`',r'\1',s)

doc=SimpleDocTemplate(str(OUTPUT),pagesize=A4,rightMargin=45,leftMargin=45,topMargin=38,bottomMargin=38,
                      title='Построение Legal RAG: вклад компонентов в качество ответов и цитирования',author='')
story=[];lines=SOURCE.read_text().splitlines();i=0;refs=False
while i<len(lines):
    line=lines[i].strip();i+=1
    if not line:continue
    if line.startswith('# '):story.append(Paragraph(inline(line[2:]),title));continue
    if line.startswith('## '):
        if line.startswith('## 3.'):story.append(PageBreak())
        story.append(Paragraph(inline(line[3:]),heading));continue
    if line=='**Литература**':
        refs=True;story.append(Paragraph('Литература',ParagraphStyle('refhead',parent=heading,fontSize=10,leading=11,spaceBefore=5)));continue
    if line.startswith('|'):
        table_lines=[line]
        while i<len(lines) and lines[i].strip().startswith('|'):
            table_lines.append(lines[i].strip());i+=1
        data=[]
        for j,row in enumerate(table_lines):
            if j==1:continue
            cells=[x.strip() for x in row.strip('|').split('|')]
            data.append([Paragraph(inline('**'+x+'**' if j==0 else x),number if k>=2 else cell) for k,x in enumerate(cells)])
        widths=[doc.width*x for x in (.10,.44,.14,.16,.16)]
        t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#EAF0F3')),
            ('LINEBELOW',(0,0),(-1,0),.6,colors.HexColor('#617985')),
            ('LINEBELOW',(0,-1),(-1,-1),.6,colors.HexColor('#617985')),
            ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F7F8F9')]),
            ('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),3),
            ('BOTTOMPADDING',(0,0),(-1,-1),3),('LEFTPADDING',(0,0),(-1,-1),5)]))
        story.extend([t,Spacer(1,7)]);continue
    if line.startswith('- '):story.append(Paragraph('• '+inline(line[2:]),bullet));continue
    style=reference if refs else caption if line.startswith('*Таблица') else body
    story.append(Paragraph(inline(line),style))

def footer(canvas,doc):
    canvas.saveState();canvas.setFont('Sans',8);canvas.setFillColor(colors.HexColor('#6A7278'))
    canvas.drawString(45,22,'Legal RAG · эмпирическое исследование')
    canvas.drawRightString(A4[0]-45,22,str(doc.page));canvas.restoreState()

doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUTPUT)
