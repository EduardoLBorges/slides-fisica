import os
from bs4 import BeautifulSoup

diretorio_origem = 'aulas_fisica'
diretorio_destino = 'aulas_slides'

os.makedirs(diretorio_destino, exist_ok=True)

# Template base do Reveal.js via CDN
template_reveal = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{titulo_aula}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reset.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/theme/simple.min.css">
    <style>
        .reveal h3 {{ text-transform: none; color: #2c3e50; font-size: 1.2em; }}
        .reveal p, .reveal td, .reveal th {{ font-size: 0.6em; text-align: left; }}
        .reveal table {{ margin: auto; border-collapse: collapse; width: 90%; }}
        .reveal th, .reveal td {{ border: 1px solid #ccc; padding: 10px; }}
        .formula {{ vertical-align: middle; max-height: 80px; }}
        .addend {{ text-align: center; }}
    </style>
</head>
<body>
    <div class="reveal">
        <div class="slides">
            {slides_html}
        </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.js"></script>
    <script>
        Reveal.initialize({{
            hash: true,
            slideNumber: true,
            transition: 'slide'
        }});
    </script>
</body>
</html>
"""

arquivos_processados = 0

for nome_arquivo in os.listdir(diretorio_origem):
    if not nome_arquivo.endswith('.html'):
        continue
        
    caminho_origem = os.path.join(diretorio_origem, nome_arquivo)
    
    with open(caminho_origem, 'r', encoding='utf-8') as f:
        html_puro = f.read()
        soup = BeautifulSoup(html_puro, 'html.parser')
        
    # Extrai o título e o container principal
    titulo_div = soup.find('div', class_='aula-titulo')
    conteudo_div = soup.find('div', id='conteudo-aula')
    
    if titulo_div and conteudo_div:
        nome_aula = titulo_div.text.strip()
        caminho_destino = os.path.join(diretorio_destino, f"slide_{nome_arquivo}")
        
        # O primeiro slide será a capa
        slides_conteudo = f"<section><h2>{nome_aula}</h2></section>\n"
        slide_atual = "<section>\n"
        
        # Percorre o conteúdo e quebra os slides toda vez que acha um <h3>
        for elemento in conteudo_div.children:
            if getattr(elemento, 'name', None) == 'h3':
                # Fecha o slide atual e abre um novo
                slide_atual += "</section>\n"
                slides_conteudo += slide_atual
                slide_atual = f"<section>\n{str(elemento)}"
            elif elemento.name is not None:
                slide_atual += str(elemento)
        
        # Adiciona o último slide do loop
        slide_atual += "</section>\n"
        slides_conteudo += slide_atual
        
        # Remove eventuais seções vazias duplas
        slides_conteudo = slides_conteudo.replace("<section>\n</section>\n", "")
        
        # Monta o HTML final com o template do Reveal.js
        html_final = template_reveal.format(titulo_aula=nome_aula, slides_html=slides_conteudo)
        
        with open(caminho_destino, 'w', encoding='utf-8') as f:
            f.write(html_final)
            
        arquivos_processados += 1
        print(f"[SLIDE CRIADO] {caminho_destino}")
        
    else:
        # Debug detalhado para você saber o que deu errado com o arquivo baixado
        print(f"[FALHA] {nome_arquivo}: O arquivo não contém a estrutura esperada.")
        if "Cloudflare" in html_puro or "Just a moment" in html_puro:
            print("   -> MOTIVO: O site bloqueou o download por segurança (Cloudflare).")
        elif "login" in html_puro.lower():
            print("   -> MOTIVO: O site exigiu login para acessar o conteúdo.")
        else:
            print("   -> MOTIVO: Estrutura HTML diferente ou arquivo vazio.")

print(f"\nConcluído! {arquivos_processados} apresentações criadas na pasta '{diretorio_destino}'.")