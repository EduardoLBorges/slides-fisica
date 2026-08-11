(() => {
    const CHAVE = 'tema-fisica';
    const ICONES = { escuro: '☀️', claro: '🌙' };
    const LABELS = { escuro: 'Tema Claro', claro: 'Tema Escuro' };

    function temaAtual() {
        return localStorage.getItem(CHAVE) || 
            (window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro');
    }

    function aplicarTema(tema) {
        document.documentElement.setAttribute('data-tema', tema);
        localStorage.setItem(CHAVE, tema);
        const btn = document.querySelector('#btn-tema');
        if (btn) {
            btn.innerHTML = `${ICONES[tema]} <span>${LABELS[tema]}</span>`;
            btn.setAttribute('aria-label', LABELS[tema]);
        }
    }

    function criarBotao(texto, className, title, onClick) {
        const btn = document.createElement('button');
        btn.className = className;
        btn.innerHTML = texto;
        if (title) btn.setAttribute('title', title);
        if (onClick) btn.addEventListener('click', onClick);
        return btn;
    }

    function criarControles() {
        const container = document.createElement('div');
        container.id = 'top-right-controls';

        let fontScale = parseFloat(localStorage.getItem('font-scale')) || 1.0;

        const updateFont = () => {
            document.documentElement.style.setProperty('--font-scale', fontScale.toFixed(2));
            localStorage.setItem('font-scale', fontScale.toFixed(2));
            fontIndicator.innerHTML = `${Math.round(fontScale * 100)}%`;
        };

        const fontIndicator = document.createElement('span');
        fontIndicator.className = 'font-scale-indicator';
        fontIndicator.innerHTML = `${Math.round(fontScale * 100)}%`;
        fontIndicator.setAttribute('title', 'Clique duplo para restaurar 100%');
        fontIndicator.addEventListener('dblclick', () => {
            fontScale = 1.0;
            updateFont();
        });

        const btnFontMinus = criarBotao('A-', 'btn-circle-small', 'Reduzir fonte', () => {
            fontScale = Math.max(0.6, fontScale - 0.1);
            updateFont();
        });

        const btnFontPlus = criarBotao('A+', 'btn-circle-small', 'Aumentar fonte', () => {
            fontScale = Math.min(2.0, fontScale + 0.1);
            updateFont();
        });

        const btnTema = criarBotao('', '', '', () => {
            const atual = document.documentElement.getAttribute('data-tema') || 'escuro';
            aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
        });
        btnTema.id = 'btn-tema';
        btnTema.setAttribute('aria-label', 'Alternar tema');

        container.append(btnFontMinus, fontIndicator, btnFontPlus, btnTema);

        const header = document.querySelector('.site-header');
        (header || document.body).appendChild(container);
    }

    // Inicialização imediata de tema e fonte
    const tema = temaAtual();
    document.documentElement.setAttribute('data-tema', tema);
    document.documentElement.style.setProperty('--font-scale', parseFloat(localStorage.getItem('font-scale')) || 1.0);

    const init = () => {
        criarControles();
        aplicarTema(tema);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // --- Lógica de navegação de aulas e overlays ---
    if (window.location.pathname.includes('/aulas/')) {

        function fecharOverlay(id) {
            const el = document.getElementById(id);
            if (el?.classList.contains('ativo')) {
                el.classList.remove('ativo');
                document.querySelector('.reveal')?.classList.remove('blur-reveal');
            }
        }

        function mostrarOverlay(id) {
            document.getElementById(id)?.classList.add('ativo');
            document.querySelector('.reveal')?.classList.add('blur-reveal');
        }

        function configurarBotaoNav(btn, linkCard) {
            const href = linkCard?.getAttribute('href');
            if (btn && href) {
                btn.href = href.replace('aulas/', '');
                btn.style.display = 'flex';
            }
        }

        function criarOverlaysDeAula() {
            const overlayFim = document.createElement('div');
            overlayFim.id = 'fim-aula-overlay';
            overlayFim.innerHTML = `
                <div class="fim-aula-content">
                    <a id="btn-prox-aula" href="#" class="btn-circular" style="display: none;">
                        <span class="icon">→</span>Próxima Aula
                    </a>
                    <a id="btn-exercicios" href="#" class="btn-circular">
                        <span class="icon">✎</span>Exercícios
                    </a>
                </div>
            `;
            document.body.appendChild(overlayFim);

            const overlayInicio = document.createElement('div');
            overlayInicio.id = 'inicio-aula-overlay';
            overlayInicio.innerHTML = `
                <div class="fim-aula-content">
                    <a id="btn-ant-aula" href="#" class="btn-circular" style="display: none;">
                        <span class="icon">←</span>Aula Anterior
                    </a>
                    <button id="btn-exportar-pdf" class="btn-circular" type="button">
                        <span class="icon">📄</span>Exportar PDF
                    </button>
                </div>
            `;
            document.body.appendChild(overlayInicio);

            overlayInicio.querySelector('#btn-exportar-pdf')?.addEventListener('click', (e) => {
                e.preventDefault();
                fecharOverlay('inicio-aula-overlay');
                setTimeout(() => window.print(), 150);
            });

            const currentFilename = window.location.pathname.split('/').pop();
            document.getElementById('btn-exercicios').href = `../exercicios/${currentFilename.replace('aula_', 'exercicio_')}`;

            fetch('../index.html')
                .then(res => res.text())
                .then(html => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const currentLink = doc.querySelector(`a[href="aulas/${currentFilename}"]`);
                    if (!currentLink) return;

                    const currentCard = currentLink.closest('.aula-card');
                    const nextCard = currentCard.nextElementSibling;
                    const prevCard = currentCard.previousElementSibling;
                    const btnProx = document.getElementById('btn-prox-aula');
                    const btnAnt = document.getElementById('btn-ant-aula');

                    // Próxima aula
                    if (nextCard) {
                        configurarBotaoNav(btnProx, nextCard.querySelector('.aula-titulo-card'));
                    } else {
                        const nextCap = currentCard.closest('.capitulo-bloco')?.nextElementSibling;
                        if (nextCap?.classList.contains('capitulo-bloco')) {
                            configurarBotaoNav(btnProx, nextCap.querySelector('.aula-titulo-card'));
                        }
                    }

                    // Aula anterior
                    if (prevCard && !prevCard.classList.contains('capitulo-header')) {
                        configurarBotaoNav(btnAnt, prevCard.querySelector('.aula-titulo-card'));
                    } else {
                        const prevCap = currentCard.closest('.capitulo-bloco')?.previousElementSibling;
                        if (prevCap?.classList.contains('capitulo-bloco')) {
                            const cards = prevCap.querySelectorAll('.aula-card');
                            if (cards.length > 0) {
                                configurarBotaoNav(btnAnt, cards[cards.length - 1].querySelector('.aula-titulo-card'));
                            }
                        }
                    }
                })
                .catch(err => console.error('Erro ao buscar aulas:', err));
        }

        document.addEventListener('DOMContentLoaded', () => {
            criarOverlaysDeAula();

            let estavaNoUltimoSlide = false;
            let estavaNoPrimeiroSlide = false;

            function atualizarEstado() {
                if (!window.Reveal) return;
                const routes = Reveal.availableRoutes();
                const fragments = Reveal.availableFragments();
                estavaNoUltimoSlide = Reveal.isLastSlide() && !routes.right && !routes.down && !fragments.next;
                estavaNoPrimeiroSlide = Reveal.isFirstSlide() && !routes.left && !routes.up && !fragments.prev;
            }

            const interval = setInterval(() => {
                if (window.Reveal?.on) {
                    clearInterval(interval);
                    ['slidechanged', 'fragmentshown', 'fragmenthidden', 'ready'].forEach(evt => Reveal.on(evt, atualizarEstado));
                    atualizarEstado();
                }
            }, 100);

            let lastAdvanceTime = 0;
            let lastBackTime = 0;
            const DOUBLE_TAP_DELAY = 400;

            function tentarAvancar() {
                const now = Date.now();
                if (now - lastAdvanceTime < DOUBLE_TAP_DELAY) {
                    mostrarOverlay('fim-aula-overlay');
                    lastAdvanceTime = 0;
                } else {
                    lastAdvanceTime = now;
                }
            }

            function tentarVoltar() {
                const now = Date.now();
                if (now - lastBackTime < DOUBLE_TAP_DELAY) {
                    mostrarOverlay('inicio-aula-overlay');
                    lastBackTime = 0;
                } else {
                    lastBackTime = now;
                }
            }

            document.addEventListener('keydown', (e) => {
                if (!window.Reveal) return;
                if (estavaNoUltimoSlide && ['ArrowRight', ' ', 'PageDown'].includes(e.key)) tentarAvancar();
                if (estavaNoPrimeiroSlide && ['ArrowLeft', 'PageUp'].includes(e.key)) tentarVoltar();
            });

            document.addEventListener('click', (e) => {
                if (!window.Reveal) return;
                if (estavaNoUltimoSlide && (e.target.closest('.navigate-right') || e.target.closest('.navigate-next'))) tentarAvancar();
                if (estavaNoPrimeiroSlide && (e.target.closest('.navigate-left') || e.target.closest('.navigate-prev'))) tentarVoltar();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    fecharOverlay('fim-aula-overlay');
                    fecharOverlay('inicio-aula-overlay');
                } else if (['ArrowLeft', 'PageUp'].includes(e.key)) {
                    fecharOverlay('fim-aula-overlay');
                } else if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) {
                    fecharOverlay('inicio-aula-overlay');
                }
            });
        });
    }
})();
