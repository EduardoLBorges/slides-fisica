# Web Scraping de Aulas de Física

Este projeto consiste em um conjunto de scripts Python para fazer o download automático de aulas de física de um site (webfisica.com) e convertê-las em apresentações de slides usando as ferramentas Marp ou Reveal.js.

## Estrutura do Projeto

* `extrator_aulas.py`: Faz o download do conteúdo das aulas (HTML) e as salva na pasta `aulas_fisica`. Ele disfarça as requisições para evitar bloqueios.
* `gerador_marp.py`: Processa os arquivos HTML baixados na pasta `aulas_fisica`, extrai o conteúdo e gera apresentações Markdown compatíveis com o formato Marp na pasta `aulas_marp`.
* `gerador_slides.py`: Processa os arquivos HTML baixados e gera apresentações em HTML usando o Reveal.js na pasta `aulas_slides`.

## Como usar

1. Execute o extrator para baixar as aulas:
   ```bash
   python extrator_aulas.py
   ```
2. Após o término do download, escolha como deseja gerar os slides. 
   Para gerar com Markdown (Marp):
   ```bash
   python gerador_marp.py
   ```
   Para gerar com HTML (Reveal.js):
   ```bash
   python gerador_slides.py
   ```

## Notas
As pastas geradas (`aulas_fisica`, `aulas_marp`, `aulas_slides`) contêm o resultado dos processamentos e estão ignoradas no versionamento pelo `.gitignore`.