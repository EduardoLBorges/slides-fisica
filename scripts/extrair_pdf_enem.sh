#!/usr/bin/env bash
set -Eeuo pipefail

# Extrai texto pesquisável e imagens incorporadas no PDF do banco ENEM.
# Pode ser chamado de qualquer diretório. Não altera o PDF original.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd -P)"
INPUT_PDF="${PROJECT_DIR}/data/1000 Questões do ENEM - Ciências da Natureza e Suas Tecnologias - Física e Matemática.pdf"
OUTPUT_DIR="${PROJECT_DIR}/data/questoes-extraidas"
ASSETS_DIR="${PROJECT_DIR}/questoes-assets"

if [[ ! -f "$INPUT_PDF" ]]; then
    printf 'Erro: PDF não encontrado:\n%s\n' "$INPUT_PDF" >&2
    exit 1
fi

for cmd in pdftotext pdfimages pdftohtml; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        printf 'Erro: comando "%s" não encontrado. Instale poppler-utils (Ubuntu/Debian: sudo apt install poppler-utils).\n' "$cmd" >&2
        exit 1
    fi
done

mkdir -p -- "$OUTPUT_DIR/imagens"
mkdir -p -- "$ASSETS_DIR"

printf 'Extraindo texto para data/questoes-extraidas/questoes.txt...\n'
pdftotext -layout "$INPUT_PDF" "$OUTPUT_DIR/questoes.txt"

printf 'Extraindo imagens para data/questoes-extraidas/imagens/...\n'
pdfimages -all "$INPUT_PDF" "$OUTPUT_DIR/imagens/figura"

printf 'Registrando páginas e objetos das imagens...\n'
pdfimages -list "$INPUT_PDF" > "$OUTPUT_DIR/imagens-indice.txt"

printf 'Gerando mapa espacial das figuras nas páginas de Física...\n'
pdftohtml -q -xml -f 5 -l 431 "$INPUT_PDF" "$ASSETS_DIR/layout.html"

# Quando chamado com sudo, devolve os arquivos gerados ao usuário que o invocou.
if [[ -n "${SUDO_UID:-}" && -n "${SUDO_GID:-}" ]]; then
    chown -R "${SUDO_UID}:${SUDO_GID}" "$OUTPUT_DIR"
    chown -R "${SUDO_UID}:${SUDO_GID}" "$ASSETS_DIR"
fi

printf '\nConcluído. Arquivos gerados em:\n%s\n' "$OUTPUT_DIR"
printf 'Texto: %s/questoes.txt\nÍndice das imagens: %s/imagens-indice.txt\n' "$OUTPUT_DIR" "$OUTPUT_DIR"
printf 'Mapa espacial e figuras usadas na página: %s/layout.html.xml\n' "$ASSETS_DIR"
