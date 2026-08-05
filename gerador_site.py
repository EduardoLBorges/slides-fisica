import os
import re
from bs4 import BeautifulSoup
from collections import defaultdict

# ─── Configuração ──────────────────────────────────────────────────────────────
DIR_ORIGEM   = 'aulas_fisica'
DIR_SITE     = 'site'
DIR_AULAS    = os.path.join(DIR_SITE, 'aulas')

os.makedirs(DIR_AULAS, exist_ok=True)

# Mapeamento capítulo → nome do tópico (extraído da estrutura do site)
TOPICOS = {
    1:  'Cinemática',
    2:  'Dinâmica',
    3:  'Gravitação',
    4:  'Estática',
    5:  'Mecânica dos Fluidos',
    6:  'Termologia',
    7:  'Óptica',
    8:  'Eletrostática',
    9:  'Eletrodinâmica',
    10: 'Eletromagnetismo',
    11: 'Ondulatória',
    12: 'Termodinâmica',
    13: 'Física Moderna',
}

# ─── Template dos slides (Reveal.js) ──────────────────────────────────────────
TEMPLATE_SLIDE = """\
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <title>{titulo_aula} · WebFísica</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reset.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --primary: #6c63ff;
            --primary-dark: #4c46b6;
            --bg: #0f0f1a;
            --surface: #1a1a2e;
            --text: #e2e2f0;
            --muted: #888aaa;
        }}

        .reveal-viewport {{ background: var(--bg); }}

        .reveal {{
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            color: var(--text);
        }}

        /* Slide de capa */
        .reveal .capa {{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
        }}

        .reveal .capa .badge {{
            background: var(--primary);
            color: #fff;
            padding: 6px 18px;
            border-radius: 999px;
            font-size: 0.65em;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }}

        .reveal .capa h1 {{
            font-size: 1.6em;
            font-weight: 700;
            color: #fff;
            margin: 0;
            line-height: 1.3;
        }}

        .reveal .capa .aula-num {{
            font-size: 0.75em;
            color: var(--muted);
        }}

        /* Slides de conteúdo */
        .reveal section h3 {{
            text-transform: none;
            color: var(--primary);
            font-size: 1em;
            font-weight: 600;
            margin-bottom: 0.5em;
            border-bottom: 2px solid var(--primary-dark);
            padding-bottom: 0.3em;
        }}

        .reveal section p,
        .reveal section li {{
            font-size: 0.78em;
            text-align: left;
            color: var(--text);
            line-height: 1.6;
        }}

        .reveal section td,
        .reveal section th {{
            font-size: 0.78em;
            text-align: left;
            color: var(--text);
            line-height: 1.5;
        }}

        .reveal table {{
            margin: 0.5em auto;
            border-collapse: collapse;
            width: 90%;
        }}

        .reveal th {{
            background: var(--primary-dark);
            color: #fff;
            padding: 8px 12px;
            border: 1px solid #3a3a5a;
            font-weight: 600;
        }}

        .reveal td {{
            padding: 6px 12px;
            border: 1px solid #3a3a5a;
            background: var(--surface);
        }}

        .reveal tr:nth-child(even) td {{
            background: #22223a;
        }}

        /* Imagens gerais (diagramas, gráficos e animações) */
        .reveal section img {{
            background: #ffffff;
            border-radius: 8px;
            padding: 6px;
            max-height: 420px;
            max-width: 92% !important;
            width: auto !important;
            height: auto !important;
            vertical-align: middle;
            margin: 6px auto;
            object-fit: contain;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
        }}

        /* Fórmulas matemáticas (inline e destaque) */
        .reveal section img[src*="codecogs"],
        .reveal section img.formula,
        .reveal section img.formula_imp {{
            max-height: 100px;
            padding: 4px 8px;
            box-shadow: none;
            margin: 4px;
            display: inline-block;
        }}

        .reveal .addend,
        .reveal .adendo {{
            text-align: center;
            background: rgba(108, 99, 255, 0.07);
            border: 1px solid rgba(108, 99, 255, 0.3);
            border-radius: 12px;
            padding: 20px 24px;
            margin: 16px auto;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            width: 95%;
        }}

        .reveal a {{
            color: var(--primary);
        }}

        .reveal strong {{
            color: #c3b9ff;
        }}

        /* Número de slide */
        .reveal .slide-number {{
            background: rgba(108,99,255,0.3);
            color: var(--text);
            border-radius: 6px;
            padding: 2px 8px;
            font-size: 13px;
        }}

        /* Botão Voltar */
        #btn-voltar {{
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 9999;
            background: rgba(108,99,255,0.85);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            font-family: 'Outfit', sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            backdrop-filter: blur(8px);
            transition: background 0.2s, transform 0.2s;
        }}

        #btn-voltar:hover {{
            background: rgba(108,99,255,1);
            transform: translateY(-1px);
        }}
    </style>
</head>
<body>
    <a id="btn-voltar" href="../index.html">← Menu</a>

    <div class="reveal">
        <div class="slides">
            {slides_html}
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.6.1/reveal.min.js"></script>
    <script>
        Reveal.initialize({{
            hash: true,
            slideNumber: 'c/t',
            transition: 'slide',
            backgroundTransition: 'fade',
            controls: true,
            progress: true,
            center: true,
        }});
    </script>
</body>
</html>
"""

# ─── Template da página inicial ───────────────────────────────────────────────
def gerar_index(capitulos_data):
    """Recebe dict {capitulo: [(titulo, arquivo, num_aula), ...]} e gera o index.html"""

    cards_html = ''
    for cap_num in sorted(capitulos_data.keys()):
        topico = TOPICOS.get(cap_num, f'Capítulo {cap_num}')
        aulas  = sorted(capitulos_data[cap_num], key=lambda x: x[2])  # ordena pelo num da aula

        aulas_html = ''
        for titulo, arquivo, num_aula in aulas:
            aulas_html += f'''
                <a class="aula-card" href="aulas/{arquivo}" id="aula-{num_aula}">
                    <span class="aula-num">Aula {cap_num}-{num_aula}</span>
                    <span class="aula-titulo-card">{titulo}</span>
                    <span class="aula-arrow">→</span>
                </a>'''

        cards_html += f'''
        <div class="capitulo-bloco" id="cap-{cap_num}">
            <div class="capitulo-header">
                <span class="cap-badge">Cap. {cap_num}</span>
                <h2 class="cap-nome">{topico}</h2>
                <span class="cap-count">{len(aulas)} aulas</span>
            </div>
            <div class="aulas-grid">
                {aulas_html}
            </div>
        </div>'''

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Física Básica · Aulas em Slides</title>
    <meta name="description" content="Curso de Física Básica com todas as aulas em formato de slides interativos. Cinemática, Dinâmica, Termodinâmica e muito mais.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

        :root {{
            --primary: #6c63ff;
            --primary-glow: rgba(108,99,255,0.35);
            --accent: #f7c59f;
            --bg: #0b0b14;
            --surface: #13131f;
            --surface2: #1d1d2e;
            --border: rgba(255,255,255,0.07);
            --text: #dde1f5;
            --muted: #7779a0;
            --radius: 14px;
        }}

        html {{ scroll-behavior: smooth; }}

        body {{
            font-family: 'Outfit', sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
        }}

        /* ── Hero ────────────────────────────── */
        .hero {{
            position: relative;
            padding: 80px 24px 64px;
            text-align: center;
            overflow: hidden;
        }}

        .hero::before {{
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(108,99,255,0.18) 0%, transparent 70%);
            pointer-events: none;
        }}

        .hero-badge {{
            display: inline-block;
            padding: 6px 20px;
            border-radius: 999px;
            border: 1px solid var(--primary);
            color: var(--primary);
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 24px;
        }}

        .hero h1 {{
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 800;
            line-height: 1.15;
            color: #fff;
            margin-bottom: 16px;
        }}

        .hero h1 span {{
            background: linear-gradient(90deg, #6c63ff, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}

        .hero p {{
            max-width: 520px;
            margin: 0 auto 36px;
            color: var(--muted);
            font-size: 1.05rem;
            line-height: 1.7;
        }}

        .hero-stats {{
            display: flex;
            justify-content: center;
            gap: 40px;
            flex-wrap: wrap;
        }}

        .stat {{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }}

        .stat-num {{
            font-size: 2rem;
            font-weight: 800;
            color: #fff;
        }}

        .stat-label {{
            font-size: 0.8rem;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }}

        /* ── Busca ───────────────────────────── */
        .search-bar {{
            max-width: 560px;
            margin: 0 auto 48px;
            padding: 0 24px;
        }}

        .search-bar input {{
            width: 100%;
            padding: 14px 20px;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            background: var(--surface2);
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }}

        .search-bar input::placeholder {{ color: var(--muted); }}

        .search-bar input:focus {{
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
        }}

        /* ── Conteúdo ────────────────────────── */
        .conteudo {{
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px 80px;
        }}

        /* ── Bloco de capítulo ───────────────── */
        .capitulo-bloco {{
            margin-bottom: 48px;
        }}

        .capitulo-header {{
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
        }}

        .cap-badge {{
            background: var(--primary);
            color: #fff;
            border-radius: 8px;
            padding: 4px 12px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            white-space: nowrap;
        }}

        .cap-nome {{
            font-size: 1.2rem;
            font-weight: 700;
            color: #fff;
        }}

        .cap-count {{
            margin-left: auto;
            font-size: 0.8rem;
            color: var(--muted);
            white-space: nowrap;
        }}

        /* ── Grid de aulas ───────────────────── */
        .aulas-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 12px;
        }}

        .aula-card {{
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 16px 20px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            text-decoration: none;
            color: var(--text);
            transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
            position: relative;
            overflow: hidden;
        }}

        .aula-card::before {{
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 3px; height: 100%;
            background: var(--primary);
            opacity: 0;
            transition: opacity 0.2s;
        }}

        .aula-card:hover {{
            background: var(--surface2);
            border-color: rgba(108,99,255,0.4);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }}

        .aula-card:hover::before {{
            opacity: 1;
        }}

        .aula-num {{
            font-size: 0.7rem;
            font-weight: 600;
            color: var(--primary);
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }}

        .aula-titulo-card {{
            font-size: 0.9rem;
            font-weight: 500;
            line-height: 1.4;
            color: var(--text);
            flex: 1;
        }}

        .aula-arrow {{
            font-size: 1rem;
            color: var(--muted);
            align-self: flex-end;
            transition: color 0.2s, transform 0.2s;
        }}

        .aula-card:hover .aula-arrow {{
            color: var(--primary);
            transform: translateX(4px);
        }}

        /* ── hidden (busca) ──────────────────── */
        .aula-card.hidden {{ display: none; }}
        .capitulo-bloco.hidden {{ display: none; }}

        /* ── Footer ──────────────────────────── */
        footer {{
            text-align: center;
            padding: 24px;
            color: var(--muted);
            font-size: 0.8rem;
            border-top: 1px solid var(--border);
        }}
    </style>
</head>
<body>

    <header class="hero">
        <div class="hero-badge">⚛ Curso de Física Básica</div>
        <h1>Todas as aulas,<br><span>em slides interativos</span></h1>
        <p>Navegue por 13 capítulos de Física com slides modernos, fórmulas e imagens. Clique em qualquer aula para começar.</p>
        <div class="hero-stats">
            <div class="stat"><span class="stat-num">104</span><span class="stat-label">Aulas</span></div>
            <div class="stat"><span class="stat-num">13</span><span class="stat-label">Capítulos</span></div>
            <div class="stat"><span class="stat-num">100%</span><span class="stat-label">Gratuito</span></div>
        </div>
    </header>

    <div class="search-bar">
        <input type="text" id="busca" placeholder="🔍  Buscar aula (ex: cinemática, força, Kepler…)" autocomplete="off">
    </div>

    <main class="conteudo" id="conteudo">
        {cards_html}
    </main>

    <footer>
        Conteúdo extraído de <strong>webfisica.com</strong> · Apresentação gerada automaticamente com Reveal.js
    </footer>

    <script>
        const input = document.getElementById('busca');
        input.addEventListener('input', () => {{
            const q = input.value.toLowerCase().trim();
            document.querySelectorAll('.capitulo-bloco').forEach(bloco => {{
                let visiveisNoBloco = 0;
                bloco.querySelectorAll('.aula-card').forEach(card => {{
                    const texto = card.textContent.toLowerCase();
                    const visivel = !q || texto.includes(q);
                    card.classList.toggle('hidden', !visivel);
                    if (visivel) visiveisNoBloco++;
                }});
                bloco.classList.toggle('hidden', visiveisNoBloco === 0);
            }});
        }});
    </script>
</body>
</html>
"""

# ─── Processamento das aulas ───────────────────────────────────────────────────
def extrair_dados_arquivo(nome_arquivo):
    """Retorna (cap_num, aula_num) a partir do nome do arquivo."""
    m = re.match(r'aula_(\d+)_(\d+)\.html', nome_arquivo)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None


def gerar_slides_html(conteudo_div, titulo_aula, cap_num, aula_num):
    """Converte o conteúdo da div em seções do Reveal.js."""
    topico = TOPICOS.get(cap_num, f'Capítulo {cap_num}')

    # Slide de capa
    slides = f'''<section>
    <div class="capa">
        <div class="badge">{topico}</div>
        <h1>{titulo_aula}</h1>
        <div class="aula-num">Aula {cap_num}-{aula_num}</div>
    </div>
</section>\n'''

    slide_atual = '<section>\n'
    for elemento in conteudo_div.children:
        tag = getattr(elemento, 'name', None)
        classes = getattr(elemento, 'get', lambda k: [])('class') or []
        if isinstance(classes, str):
            classes = [classes]

        if tag == 'h3' or (tag == 'div' and any(c in ['adendo', 'addend'] for c in classes)):
            slide_atual += '</section>\n'
            slides += slide_atual
            slide_atual = f'<section>\n{str(elemento)}\n'
        elif tag is not None:
            slide_atual += str(elemento) + '\n'

    slide_atual += '</section>\n'
    slides += slide_atual

    # Remove seções vazias
    slides = re.sub(r'<section>\s*</section>\n?', '', slides)
    return slides


def main():
    capitulos_data = defaultdict(list)
    arquivos_ok = 0
    arquivos_falha = 0

    arquivos = sorted(os.listdir(DIR_ORIGEM))

    for nome_arquivo in arquivos:
        if not nome_arquivo.endswith('.html'):
            continue

        cap_num, aula_num = extrair_dados_arquivo(nome_arquivo)
        if cap_num is None:
            continue

        caminho_origem = os.path.join(DIR_ORIGEM, nome_arquivo)

        with open(caminho_origem, 'r', encoding='utf-8') as f:
            html_puro = f.read()

        soup = BeautifulSoup(html_puro, 'html.parser')
        titulo_div   = soup.find('div', class_='aula-titulo')
        conteudo_div = soup.find('div', id='conteudo-aula')

        if not (titulo_div and conteudo_div):
            print(f'[FALHA] {nome_arquivo}: estrutura inesperada.')
            arquivos_falha += 1
            continue

        # Extrai o título limpo (remove a tag <img> interna do ornamento)
        for img in titulo_div.find_all('img'):
            img.decompose()
        titulo_aula = titulo_div.get_text(strip=True)

        # Nome do arquivo de saída
        nome_saida = nome_arquivo  # ex: aula_1_1.html

        # Gera o HTML do slide
        slides_html = gerar_slides_html(conteudo_div, titulo_aula, cap_num, aula_num)
        html_final  = TEMPLATE_SLIDE.format(
            titulo_aula=titulo_aula,
            slides_html=slides_html,
        )

        caminho_saida = os.path.join(DIR_AULAS, nome_saida)
        with open(caminho_saida, 'w', encoding='utf-8') as f:
            f.write(html_final)

        capitulos_data[cap_num].append((titulo_aula, nome_saida, aula_num))
        arquivos_ok += 1
        print(f'[OK] {nome_saida}  —  {titulo_aula}')

    # Gera o index.html
    index_html = gerar_index(dict(capitulos_data))
    with open(os.path.join(DIR_SITE, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(index_html)

    print(f'\n✅ Site gerado em "{DIR_SITE}/"')
    print(f'   {arquivos_ok} slides criados  |  {arquivos_falha} falhas')
    print(f'   Abra: {DIR_SITE}/index.html')


if __name__ == '__main__':
    main()
