#!/usr/bin/env python3
"""Gera questoes.json a partir da extração feita por extrair_pdf_enem.sh."""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/questoes-extraidas"
TEXT = (DATA / "questoes.txt").read_text(encoding="utf-8")
INDEX = DATA / "imagens-indice.txt"

HEADER = re.compile(r"(?m)^\s*(\d+)\s*-\s*ENEM\s+(\d{4})\s*$")
ANSWER = re.compile(r"(?m)^\s*(\d+)\s*-\s*Resposta:\s*([A-E])\s*$")

def topic(text):
    t = text.lower()
    groups = [
        ("Mecânica", r"veloc|acelera|movimento|força|newton|energia|trabalho|potência|pressão|gravidade|massa|colisão|atrito|queda|órbita|torque|equilíbrio"),
        ("Termologia", r"calor|temperatura|térmic|termic|dilata|geladeira|refriger|ebuli|fusão|isolante térmico|máquina térmica"),
        ("Eletricidade", r"elétr|eletr|corrente|tensão|resist|circuito|potência elétrica|lâmpada|ímã|magnet|indução|capacitor"),
        ("Ondulatória", r"onda|frequência|som|acúst|ultrassom|eco|vibra|comprimento de onda"),
        ("Óptica", r"luz|lente|espelho|ópt|opt|refração|reflexão|imagem|laser|cor"),
        ("Fluidos", r"fluido|empuxo|densidade|vasos comunicantes|hidrost|vazão|bóia|flutua"),
        ("Física moderna", r"radioativ|fóton|quant|átomo|nuclear|relatividade|semicondutor|efeito fotoelétrico"),
    ]
    for label, pattern in groups:
        if re.search(pattern, t): return label
    return "Outros"

# Use o XML do Poppler, que fornece a posição de cada figura e de cada
# cabeçalho. Assim, páginas com mais de uma questão não compartilham figuras.
layout_xml = ROOT / "questoes-assets/layout.html.xml"
layout_by_question = {}
if layout_xml.exists():
    layout = ET.parse(layout_xml).getroot()
    preceding_question = None
    for page in layout.findall("page"):
        page_number = int(page.get("number", "0"))
        headings = []
        images = []
        for node in page:
            if node.tag == "text":
                match = re.match(r"\s*(\d+)\s*-\s*ENEM\s+(\d{4})", "".join(node.itertext()))
                if match and int(match.group(1)) <= 509:
                    headings.append((int(node.get("top", "0")), int(match.group(1))))
            elif node.tag == "image":
                images.append((int(node.get("top", "0")), node.get("src", "")))
        headings.sort()
        for _, qnum in headings:
            layout_by_question.setdefault(qnum, {"pagina": page_number, "imagens": []})
        for image_top, src in images:
            before = [qnum for top, qnum in headings if top <= image_top]
            owner = before[-1] if before else preceding_question
            if owner is not None and src:
                src_path = Path(src)
                try:
                    relative_src = src_path.resolve().relative_to(ROOT).as_posix()
                except (OSError, ValueError):
                    relative_src = ""
                if relative_src and (ROOT / relative_src).is_file():
                    layout_by_question.setdefault(owner, {"pagina": page_number, "imagens": []})["imagens"].append(relative_src)
        if headings:
            preceding_question = headings[-1][1]

# Fallback para execuções anteriores à geração do XML: usa a lista de objetos
# como aproximação por página.
image_by_page = {}
if not layout_by_question and INDEX.exists():
    for line in INDEX.read_text(encoding="utf-8").splitlines()[2:]:
        fields = line.split()
        if len(fields) >= 3 and fields[2] == "image":
            page_num, image_num = int(fields[0]), int(fields[1])
            candidates = [DATA / "imagens" / f"figura-{image_num:03d}{ext}" for ext in (".png", ".jpg", ".ppm", ".pbm", ".jp2")]
            found = next((p for p in candidates if p.exists()), None)
            if found:
                image_by_page.setdefault(page_num, []).append(found.relative_to(ROOT).as_posix())

key_start = TEXT.rfind("GABARITO DE FÍSICA")
key_end = TEXT.find("GABARITO DE MATEMÁTICA", key_start + 1)
key_text = TEXT[key_start:key_end if key_end >= 0 else len(TEXT)]
answers = {int(m.group(1)): m.group(2) for m in ANSWER.finditer(key_text)}
all_headers = list(HEADER.finditer(TEXT))
headers = [m for m in all_headers if int(m.group(1)) <= 509]
questions = []
for i, match in enumerate(headers):
    next_header = next((m for m in all_headers if m.start() > match.start()), None)
    end = next_header.start() if next_header else TEXT.find("GABARITO DE FÍSICA", match.end())
    if end < 0: end = len(TEXT)
    body = TEXT[match.start():end]
    body = re.sub(r"(?m)^\s*\d{1,3}\s*$", "", body).strip()
    first_page = TEXT.count("\f", 0, match.start()) + 2
    # `end` is the beginning of the next question. Exclude that page when
    # collecting figures; including it assigned every next-question figure to
    # the preceding card.
    last_page = TEXT.count("\f", 0, end) + 1
    if next_header and TEXT.count("\f", 0, next_header.start()) == TEXT.count("\f", 0, match.start()):
        # Multiple questions can begin on one PDF page; keep that page attached
        # to the question that starts on it instead of dropping its figures.
        last_page = first_page
    qnum, year = int(match.group(1)), int(match.group(2))
    layout_record = layout_by_question.get(qnum, {})
    if layout_record:
        first_page = layout_record["pagina"]
        images = layout_record["imagens"]
    else:
        images = [img for pn in range(first_page, last_page + 1) for img in image_by_page.get(pn, [])]
    questions.append({"numero": qnum, "ano": year, "tema": topic(body), "paginaPdf": first_page,
                      "texto": body, "alternativa": answers.get(qnum), "imagens": images})

(ROOT / "questoes.json").write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Geradas {len(questions)} questões em questoes.json")
