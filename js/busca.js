// Lógica de busca de aulas — index.html
(() => {
    const input     = document.getElementById('busca');
    const contador  = document.getElementById('busca-contador');
    const buscaVazia = document.getElementById('busca-vazia');
    const conteudo  = document.getElementById('conteudo');

    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        let totalVisiveis = 0;

        document.querySelectorAll('.capitulo-bloco').forEach(bloco => {
            let visiveisNoBloco = 0;
            bloco.querySelectorAll('.aula-card').forEach(card => {
                const visivel = !q || card.textContent.toLowerCase().includes(q);
                card.classList.toggle('hidden', !visivel);
                if (visivel) visiveisNoBloco++;
            });
            bloco.classList.toggle('hidden', visiveisNoBloco === 0);
            totalVisiveis += visiveisNoBloco;
        });

        if (q) {
            contador.textContent = totalVisiveis > 0
                ? `${totalVisiveis} aula${totalVisiveis !== 1 ? 's' : ''} encontrada${totalVisiveis !== 1 ? 's' : ''} para "${q}"`
                : '';
            buscaVazia.classList.toggle('visivel', totalVisiveis === 0);
            conteudo.style.display = totalVisiveis === 0 ? 'none' : '';
        } else {
            contador.textContent = '';
            buscaVazia.classList.remove('visivel');
            conteudo.style.display = '';
        }
    });
})();
