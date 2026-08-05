import urllib.request
import urllib.error
import time
import os

os.makedirs('exercicios_fisica', exist_ok=True)

def descobrir_capitulo(aula):
    if aula >= 98: return 13
    elif aula >= 89: return 12
    elif aula >= 84: return 11
    elif aula >= 77: return 10
    elif aula >= 71: return 9
    elif aula >= 62: return 8
    elif aula >= 51: return 7
    elif aula >= 38: return 6
    elif aula >= 33: return 5
    elif aula >= 30: return 4
    elif aula >= 26: return 3
    elif aula >= 11: return 2
    else: return 1

base_url = "https://webfisica.com/curso-de-fisica-basica/exercicios/{}-{}"

# Cabeçalhos para fingir ser o Google Chrome e evitar bloqueio
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

for aula in range(1, 105):
    capitulo = descobrir_capitulo(aula)
    url = base_url.format(capitulo, aula)
    arquivo_destino = f"exercicios_fisica/exercicio_{capitulo}_{aula}.html"
    
    # Criando a requisição com o cabeçalho "disfarçado"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            with open(arquivo_destino, 'w', encoding='utf-8') as f:
                f.write(html)
                
        print(f"[SUCESSO] Salvo: {arquivo_destino}")
        
    except urllib.error.HTTPError as e:
        print(f"[ERRO] {url} retornou status {e.code}")
    except Exception as e:
        print(f"[ERRO] Falha ao acessar {url}: {e}")
        
    time.sleep(1)