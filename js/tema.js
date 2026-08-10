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
        const btn = document.querySelector('#btn-tema');
        if (btn) {
            btn.innerHTML = ICONES[tema] + ' <span>' + LABELS[tema] + '</span>';
            btn.setAttribute('aria-label', LABELS[tema]);
        }
    }

    function criarBotao() {
        const btn = document.createElement('button');
        btn.id = 'btn-tema';
        btn.setAttribute('aria-label', 'Alternar tema');
        btn.addEventListener('click', () => {
            const atual = document.documentElement.getAttribute('data-tema') || 'escuro';
            aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
        });

        // Insere no .site-header (index) ou no body (slides/exercícios)
        // O posicionamento fixo em páginas sem header é tratado pelo base.css
        const header = document.querySelector('.site-header');
        if (header) {
            header.appendChild(btn);
        } else {
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

    // --- Lógica do Fim de Aula Overlay ---
    if (window.location.pathname.includes('/aulas/')) {
        function criarOverlayFimAula() {
            const overlay = document.createElement('div');
            overlay.id = 'fim-aula-overlay';
            overlay.innerHTML = `
                <div class="fim-aula-content">
                    <a id="btn-prox-aula" href="#" class="btn-circular" style="display: none;">
                        <span class="icon">→</span>
                        Próxima Aula
                    </a>
                    <a id="btn-exercicios" href="#" class="btn-circular">
                        <span class="icon">✎</span>
                        Exercícios
                    </a>
                </div>
            `;
            document.body.appendChild(overlay);

            // Determinar o link de exercícios atual
            const currentFilename = window.location.pathname.split('/').pop();
            const exercicioFilename = currentFilename.replace('aula_', 'exercicio_');
            document.getElementById('btn-exercicios').href = `../exercicios/${exercicioFilename}`;

            // Tentar encontrar a próxima aula lendo o index.html
            fetch('../index.html')
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const currentLink = doc.querySelector(`a[href="aulas/${currentFilename}"]`);

                    if (currentLink) {
                        const currentCard = currentLink.closest('.aula-card');
                        const nextCard = currentCard.nextElementSibling;
                        const btnProx = document.getElementById('btn-prox-aula');

                        if (nextCard) {
                            const nextLink = nextCard.querySelector('.aula-titulo-card');
                            if (nextLink) {
                                btnProx.href = nextLink.getAttribute('href').replace('aulas/', '');
                                btnProx.style.display = 'flex';
                            }
                        } else {
                            // Tentar a primeira aula do próximo capítulo
                            const currentCap = currentCard.closest('.capitulo-bloco');
                            const nextCap = currentCap.nextElementSibling;
                            if (nextCap) {
                                const nextLink = nextCap.querySelector('.aula-titulo-card');
                                if (nextLink) {
                                    btnProx.href = nextLink.getAttribute('href').replace('aulas/', '');
                                    btnProx.style.display = 'flex';
                                }
                            }
                        }
                    }
                })
                .catch(err => console.error('Erro ao buscar próxima aula:', err));

            return overlay;
        }

        document.addEventListener('DOMContentLoaded', () => {
            criarOverlayFimAula();

            function mostrarOverlay() {
                const overlay = document.getElementById('fim-aula-overlay');
                if (overlay) overlay.classList.add('ativo');
                document.querySelector('.reveal')?.classList.add('blur-reveal');
            }

            let estavaNoUltimoSlide = false;

            function atualizarEstado() {
                if (!window.Reveal) return;
                const routes = Reveal.availableRoutes();
                const fragments = Reveal.availableFragments();
                estavaNoUltimoSlide = Reveal.isLastSlide() && !routes.right && !routes.down && !fragments.next;
            }

            // Aguarda o Reveal estar disponível
            const interval = setInterval(() => {
                if (window.Reveal && Reveal.on) {
                    clearInterval(interval);
                    Reveal.on('slidechanged', atualizarEstado);
                    Reveal.on('fragmentshown', atualizarEstado);
                    Reveal.on('fragmenthidden', atualizarEstado);
                    Reveal.on('ready', atualizarEstado);
                    atualizarEstado();
                }
            }, 100);

            // Lógica de clique duplo / duplo avanço
            let lastAdvanceTime = 0;
            const DOUBLE_TAP_DELAY = 400; // milissegundos

            function tentarAvancar() {
                const now = new Date().getTime();
                if (now - lastAdvanceTime < DOUBLE_TAP_DELAY) {
                    mostrarOverlay();
                    lastAdvanceTime = 0; // reseta
                } else {
                    lastAdvanceTime = now;
                }
            }

            function verificarFimAulaKey(e) {
                if (!window.Reveal) return;
                // Se já estavamos no último slide antes de apertar a tecla
                if (estavaNoUltimoSlide) {
                    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) {
                        tentarAvancar();
                    }
                }
            }

            document.addEventListener('keydown', verificarFimAulaKey);

            // Verifica cliques nos controles de navegação
            document.addEventListener('click', (e) => {
                if (!window.Reveal) return;
                if (estavaNoUltimoSlide && (e.target.closest('.navigate-right') || e.target.closest('.navigate-next'))) {
                    tentarAvancar();
                }
            });

            // Fecha o overlay
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    const overlay = document.getElementById('fim-aula-overlay');
                    if (overlay && overlay.classList.contains('ativo')) {
                        overlay.classList.remove('ativo');
                        document.querySelector('.reveal')?.classList.remove('blur-reveal');
                    }
                }
            });
        });
    }
})();
