(() => {
    const CHAVE = 'tema-fisica';
    const ICONES = { escuro: '☀️', claro: '🌙' };
    const LABELS = { escuro: 'Tema Claro', claro: 'Tema Escuro' };

    function temaAtual() {
        const salvo = localStorage.getItem(CHAVE);
        if (salvo) return salvo;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro';
    }

    function aplicarTema(tema) {
        document.documentElement.setAttribute('data-tema', tema);
        localStorage.setItem(CHAVE, tema);
        document.querySelectorAll('#btn-tema').forEach(btn => {
            btn.innerHTML = ICONES[tema] + ' <span>' + LABELS[tema] + '</span>';
            btn.setAttribute('aria-label', LABELS[tema]);
        });
    }

    function criarBotao() {
        const btn = document.createElement('button');
        btn.id = 'btn-tema';
        btn.setAttribute('aria-label', 'Alternar tema');
        btn.addEventListener('click', () => {
            const atual = document.documentElement.getAttribute('data-tema') || 'escuro';
            aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
        });

        // Tenta inserir no .site-header (index), senão appenda ao body (slides/exercícios)
        const header = document.querySelector('.site-header');
        if (header) {
            header.appendChild(btn);
        } else {
            // Para páginas sem header (slides e exercícios): posição fixa via CSS
            btn.style.position = 'fixed';
            btn.style.top = '16px';
            btn.style.right = '16px';
            btn.style.zIndex = '9999';
            document.body.appendChild(btn);
        }

        return btn;
    }

    // Aplica tema imediatamente para evitar flash
    const tema = temaAtual();
    document.documentElement.setAttribute('data-tema', tema);

    // Cria o botão após o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            criarBotao();
            aplicarTema(tema);
        });
    } else {
        criarBotao();
        aplicarTema(tema);
    }
})();
