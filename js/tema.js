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

    function criarControles() {
        const container = document.createElement('div');
        container.id = 'top-right-controls';

        // Lógica de Escala de Fonte
        let fontScale = parseFloat(localStorage.getItem('font-scale')) || 1.0;

        const btnFontMinus = document.createElement('button');
        btnFontMinus.className = 'btn-circle-small';
        btnFontMinus.innerHTML = 'A-';
        btnFontMinus.setAttribute('title', 'Reduzir fonte');
        
        const fontIndicator = document.createElement('span');
        fontIndicator.className = 'font-scale-indicator';
        fontIndicator.innerHTML = `${Math.round(fontScale * 100)}%`;
        fontIndicator.setAttribute('title', 'Clique duplo para restaurar 100%');

        fontIndicator.addEventListener('dblclick', () => {
            fontScale = 1.0;
            updateFont();
        });

        const btnFontPlus = document.createElement('button');
        btnFontPlus.className = 'btn-circle-small';
        btnFontPlus.innerHTML = 'A+';
        btnFontPlus.setAttribute('title', 'Aumentar fonte');
        
        const updateFont = () => {
            document.documentElement.style.setProperty('--font-scale', fontScale.toFixed(2));
            localStorage.setItem('font-scale', fontScale.toFixed(2));
            fontIndicator.innerHTML = `${Math.round(fontScale * 100)}%`;
        };

        btnFontMinus.addEventListener('click', () => {
            fontScale = Math.max(0.6, fontScale - 0.1);
            updateFont();
        });

        btnFontPlus.addEventListener('click', () => {
            fontScale = Math.min(2.0, fontScale + 0.1);
            updateFont();
        });

        const btnTema = document.createElement('button');
        btnTema.id = 'btn-tema';
        btnTema.setAttribute('aria-label', 'Alternar tema');
        btnTema.addEventListener('click', () => {
            const atual = document.documentElement.getAttribute('data-tema') || 'escuro';
            aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
        });

        container.appendChild(btnFontMinus);
        container.appendChild(fontIndicator);
        container.appendChild(btnFontPlus);
        container.appendChild(btnTema);

        // Insere no .site-header (index) ou no body (slides/exercícios)
        const header = document.querySelector('.site-header');
        if (header) {
            header.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
    }

    // Aplica tema e fonte imediatamente para evitar flash
    const tema = temaAtual();
    document.documentElement.setAttribute('data-tema', tema);
    const initialFontScale = parseFloat(localStorage.getItem('font-scale')) || 1.0;
    document.documentElement.style.setProperty('--font-scale', initialFontScale);

    // Cria os controles após o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            criarControles();
            aplicarTema(tema);
        });
    } else {
        criarControles();
        aplicarTema(tema);
    }

    // --- Lógica do Fim de Aula Overlay ---
    if (window.location.pathname.includes('/aulas/')) {
        function criarOverlaysDeAula() {
            // Overlay de Fim de Aula
            const overlayFim = document.createElement('div');
            overlayFim.id = 'fim-aula-overlay';
            overlayFim.innerHTML = `
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
            document.body.appendChild(overlayFim);

            // Overlay de Início de Aula
            const overlayInicio = document.createElement('div');
            overlayInicio.id = 'inicio-aula-overlay';
            overlayInicio.innerHTML = `
                <div class="fim-aula-content">
                    <a id="btn-ant-aula" href="#" class="btn-circular" style="display: none;">
                        <span class="icon">←</span>
                        Aula Anterior
                    </a>
                    <button id="btn-exportar-pdf" class="btn-circular" type="button">
                        <span class="icon">📄</span>
                        Exportar PDF
                    </button>
                </div>
            `;
            document.body.appendChild(overlayInicio);

            const btnPdf = overlayInicio.querySelector('#btn-exportar-pdf');
            if (btnPdf) {
                btnPdf.addEventListener('click', (e) => {
                    e.preventDefault();
                    overlayInicio.classList.remove('ativo');
                    document.querySelector('.reveal')?.classList.remove('blur-reveal');
                    setTimeout(() => {
                        window.print();
                    }, 150);
                });
            }

            // Determinar o link de exercícios atual
            const currentFilename = window.location.pathname.split('/').pop();
            const exercicioFilename = currentFilename.replace('aula_', 'exercicio_');
            document.getElementById('btn-exercicios').href = `../exercicios/${exercicioFilename}`;

            // Tentar encontrar a próxima e a aula anterior lendo o index.html
            fetch('../index.html')
                .then(res => res.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const currentLink = doc.querySelector(`a[href="aulas/${currentFilename}"]`);

                    if (currentLink) {
                        const currentCard = currentLink.closest('.aula-card');
                        const nextCard = currentCard.nextElementSibling;
                        const prevCard = currentCard.previousElementSibling;
                        
                        const btnProx = document.getElementById('btn-prox-aula');
                        const btnAnt = document.getElementById('btn-ant-aula');

                        // Próxima aula
                        if (nextCard) {
                            const nextLink = nextCard.querySelector('.aula-titulo-card');
                            if (nextLink) {
                                btnProx.href = nextLink.getAttribute('href').replace('aulas/', '');
                                btnProx.style.display = 'flex';
                            }
                        } else {
                            const currentCap = currentCard.closest('.capitulo-bloco');
                            const nextCap = currentCap.nextElementSibling;
                            if (nextCap && nextCap.classList.contains('capitulo-bloco')) {
                                const nextLink = nextCap.querySelector('.aula-titulo-card');
                                if (nextLink) {
                                    btnProx.href = nextLink.getAttribute('href').replace('aulas/', '');
                                    btnProx.style.display = 'flex';
                                }
                            }
                        }

                        // Aula anterior
                        if (prevCard && !prevCard.classList.contains('capitulo-header')) {
                            const prevLink = prevCard.querySelector('.aula-titulo-card');
                            if (prevLink) {
                                btnAnt.href = prevLink.getAttribute('href').replace('aulas/', '');
                                btnAnt.style.display = 'flex';
                            }
                        } else {
                            const currentCap = currentCard.closest('.capitulo-bloco');
                            const prevCap = currentCap.previousElementSibling;
                            if (prevCap && prevCap.classList.contains('capitulo-bloco')) {
                                const cards = prevCap.querySelectorAll('.aula-card');
                                if (cards.length > 0) {
                                    const prevLink = cards[cards.length - 1].querySelector('.aula-titulo-card');
                                    if (prevLink) {
                                        btnAnt.href = prevLink.getAttribute('href').replace('aulas/', '');
                                        btnAnt.style.display = 'flex';
                                    }
                                }
                            }
                        }
                    }
                })
                .catch(err => console.error('Erro ao buscar aulas:', err));
        }

        document.addEventListener('DOMContentLoaded', () => {
            criarOverlaysDeAula();

            function mostrarOverlayFim() {
                const overlay = document.getElementById('fim-aula-overlay');
                if (overlay) overlay.classList.add('ativo');
                document.querySelector('.reveal')?.classList.add('blur-reveal');
            }

            function mostrarOverlayInicio() {
                const overlay = document.getElementById('inicio-aula-overlay');
                if (overlay) overlay.classList.add('ativo');
                document.querySelector('.reveal')?.classList.add('blur-reveal');
            }

            let estavaNoUltimoSlide = false;
            let estavaNoPrimeiroSlide = false;

            function atualizarEstado() {
                if (!window.Reveal) return;
                const routes = Reveal.availableRoutes();
                const fragments = Reveal.availableFragments();
                estavaNoUltimoSlide = Reveal.isLastSlide() && !routes.right && !routes.down && !fragments.next;
                estavaNoPrimeiroSlide = Reveal.isFirstSlide() && !routes.left && !routes.up && !fragments.prev;
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
            let lastBackTime = 0;
            const DOUBLE_TAP_DELAY = 400; // milissegundos

            function tentarAvancar() {
                const now = new Date().getTime();
                if (now - lastAdvanceTime < DOUBLE_TAP_DELAY) {
                    mostrarOverlayFim();
                    lastAdvanceTime = 0; // reseta
                } else {
                    lastAdvanceTime = now;
                }
            }

            function tentarVoltar() {
                const now = new Date().getTime();
                if (now - lastBackTime < DOUBLE_TAP_DELAY) {
                    mostrarOverlayInicio();
                    lastBackTime = 0; // reseta
                } else {
                    lastBackTime = now;
                }
            }

            function verificarNavegacaoExtra(e) {
                if (!window.Reveal) return;
                
                // Se já estavamos no último slide e tenta avançar
                if (estavaNoUltimoSlide && ['ArrowRight', ' ', 'PageDown'].includes(e.key)) {
                    tentarAvancar();
                }
                
                // Se já estavamos no primeiro slide e tenta voltar
                if (estavaNoPrimeiroSlide && ['ArrowLeft', 'PageUp'].includes(e.key)) {
                    tentarVoltar();
                }
            }

            document.addEventListener('keydown', verificarNavegacaoExtra);

            // Verifica cliques nos controles de navegação
            document.addEventListener('click', (e) => {
                if (!window.Reveal) return;
                
                if (estavaNoUltimoSlide && (e.target.closest('.navigate-right') || e.target.closest('.navigate-next'))) {
                    tentarAvancar();
                }
                
                if (estavaNoPrimeiroSlide && (e.target.closest('.navigate-left') || e.target.closest('.navigate-prev'))) {
                    tentarVoltar();
                }
            });

            // Fecha os overlays
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const overlayFim = document.getElementById('fim-aula-overlay');
                    const overlayInicio = document.getElementById('inicio-aula-overlay');
                    
                    if (overlayFim && overlayFim.classList.contains('ativo')) {
                        overlayFim.classList.remove('ativo');
                        document.querySelector('.reveal')?.classList.remove('blur-reveal');
                    }
                    if (overlayInicio && overlayInicio.classList.contains('ativo')) {
                        overlayInicio.classList.remove('ativo');
                        document.querySelector('.reveal')?.classList.remove('blur-reveal');
                    }
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    // Seta para esquerda também fecha apenas o overlay de FIM, 
                    // pois no início de aula é o comando para ativar o overlay de início.
                    const overlayFim = document.getElementById('fim-aula-overlay');
                    if (overlayFim && overlayFim.classList.contains('ativo')) {
                        overlayFim.classList.remove('ativo');
                        document.querySelector('.reveal')?.classList.remove('blur-reveal');
                    }
                } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                    // Seta para direita fecha o overlay de INÍCIO.
                    const overlayInicio = document.getElementById('inicio-aula-overlay');
                    if (overlayInicio && overlayInicio.classList.contains('ativo')) {
                        overlayInicio.classList.remove('ativo');
                        document.querySelector('.reveal')?.classList.remove('blur-reveal');
                    }
                }
            });
        });
    }
})();
