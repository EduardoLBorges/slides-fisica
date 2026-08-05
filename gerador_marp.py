import os
from bs4 import BeautifulSoup

diretorio_origem = 'aulas_fisica'
diretorio_destino = 'aulas_marp'

os.makedirs(diretorio_destino, exist_ok=True)

arquivos_processados = 0

for nome_arquivo in os.listdir(diretorio_origem):
    if not nome_arquivo.endswith('.html'):
        continue
        
    caminho_origem = os.path.join(diretorio_origem, nome_arquivo)
    
    with open(caminho_origem, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
        
    titulo_div = soup.find('div', class_='aula-titulo')
    conteudo_div = soup.find('div', id='conteudo-aula')
    
    if titulo_div and conteudo_div:
        nome_aula = titulo_div.text.strip()
        nome_md = nome_arquivo.replace('.html', '.md')
        caminho_destino = os.path.join(diretorio_destino, nome_md)
        
        # Cabeçalho de configuração do Marp
        md_content = (
            "---\n"
            "marp: true\n"
            "theme: gaia\n"
            "class: lead\n"
            "paginate: true\n"
            "backgroundColor: #fdfdfd\n"
            "---\n\n"
        )
        
        # Slide de Capa
        md_content += f"# {nome_aula}\n\n---\n\n"
        
        # Percorre o conteúdo
        for elemento in conteudo_div.children:
            if getattr(elemento, 'name', None) == 'h3':
                # Cria um novo slide a cada <h3>
                md_content += "\n---\n\n"
                md_content += f"### {elemento.text.strip()}\n\n"
            elif elemento.name is not None:
                # Mantém as tabelas e imagens das fórmulas como HTML nativo
                # O Marp renderiza isso perfeitamente
                md_content += str(elemento) + "\n"
        
        # Salva o arquivo Markdown
        with open(caminho_destino, 'w', encoding='utf-8') as f:
            f.write(md_content)
            
        arquivos_processados += 1
        print(f"[MARP CRIADO] {nome_md}")

print(f"\nConcluído! {arquivos_processados} apresentações criadas na pasta '{diretorio_destino}'.")