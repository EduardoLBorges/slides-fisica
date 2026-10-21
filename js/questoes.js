const list = document.querySelector('#list');
const search = document.querySelector('#search');
const yearFilter = document.querySelector('#year');
const topicFilter = document.querySelector('#topic');
const count = document.querySelector('#count');
let questions = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function imageMarkup(src, questionNumber) {
  const safeSrc = encodeURI(src);
  return `<a class="question-figure" href="${safeSrc}" target="_blank" rel="noopener"><img loading="lazy" src="${safeSrc}" alt="Figura da questão ${questionNumber}"></a>`;
}

function renderQuestionBody(question) {
  const images = question.imagens || [];
  if (!images.length) return escapeHtml(question.texto);

  const lines = question.texto.split('\n');
  const choiceLines = [];
  lines.forEach((line, index) => {
    const match = line.match(/^\s*\(([A-E])\)\s*$/);
    if (match) choiceLines.push({ index, letter: match[1] });
  });

  // Quando há cinco ou mais recortes, os cinco últimos costumam ser as figuras das alternativas.
  const hasChoiceFigures = choiceLines.length >= 5 && images.length >= 5;
  const choiceImages = hasChoiceFigures ? images.slice(-5) : [];
  const bodyImages = hasChoiceFigures ? images.slice(0, -5) : [...images];
  const insertions = new Map();

  if (hasChoiceFigures) {
    choiceLines.slice(0, 5).forEach((choice, index) => {
      insertions.set(choice.index, [imageMarkup(choiceImages[index], question.numero)]);
    });
  }

  const referencePattern = /\b(figura|figuras|imagem|imagens|esquema|desenho|gráfico|gráficos|tabela|quadro|fotografia|mapa)\b/i;
  const paragraphs = [];
  let start = 0;
  for (let index = 0; index <= lines.length; index += 1) {
    if (index === lines.length || !lines[index].trim()) {
      if (start < index) paragraphs.push({ start, end: index - 1, text: lines.slice(start, index).join(' ') });
      start = index + 1;
    }
  }

  let imageIndex = 0;
  paragraphs.forEach(paragraph => {
    if (imageIndex < bodyImages.length && referencePattern.test(paragraph.text)) {
      const existing = insertions.get(paragraph.end) || [];
      existing.push(imageMarkup(bodyImages[imageIndex], question.numero));
      insertions.set(paragraph.end, existing);
      imageIndex += 1;
    }
  });

  // Recortes sem uma referência textual clara ficam antes do bloco de alternativas.
  if (imageIndex < bodyImages.length) {
    const firstChoice = choiceLines[0]?.index;
    const anchor = firstChoice === undefined ? lines.length - 1 : Math.max(0, firstChoice - 1);
    const existing = insertions.get(anchor) || [];
    while (imageIndex < bodyImages.length) {
      existing.push(imageMarkup(bodyImages[imageIndex], question.numero));
      imageIndex += 1;
    }
    insertions.set(anchor, existing);
  }

  return lines.map((line, index) => {
    const content = escapeHtml(line);
    const figures = insertions.get(index);
    return figures ? `${content}\n${figures.join('')}` : content;
  }).join('\n');
}

function render() {
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  const selectedYear = yearFilter.value;
  const selectedTopic = topicFilter.value;
  const filtered = questions.filter(q =>
    (!selectedYear || String(q.ano) === selectedYear) &&
    (!selectedTopic || q.tema === selectedTopic) &&
    (!query || `${q.texto} ${q.ano} ${q.tema} ${q.numero}`.toLocaleLowerCase('pt-BR').includes(query))
  );
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'questão' : 'questões'}`;
  if (!filtered.length) {
    list.innerHTML = '<div class="empty">Nenhuma questão corresponde a esses filtros.</div>';
    return;
  }
  list.innerHTML = filtered.map(q => `
    <article class="question">
      <header class="question-head"><div><span class="number">Questão ${q.numero}</span><span class="meta">ENEM ${q.ano} · ${escapeHtml(q.tema)}</span></div><span class="page">PDF p. ${q.paginaPdf}</span></header>
      <div class="question-text">${renderQuestionBody(q)}</div>
      ${q.alternativa ? `<details class="answer"><summary>Ver gabarito</summary><p>Alternativa <strong>${escapeHtml(q.alternativa)}</strong></p></details>` : '<p class="no-answer">Gabarito não localizado no arquivo extraído.</p>'}
    </article>`).join('');
}

fetch('questoes.json')
  .then(response => { if (!response.ok) throw new Error('Não foi possível abrir o banco de questões.'); return response.json(); })
  .then(data => {
    questions = data;
    [...new Set(data.map(q => q.ano))].sort((a,b) => b-a).forEach(year => yearFilter.add(new Option(year, year)));
    [...new Set(data.map(q => q.tema))].sort((a,b) => a.localeCompare(b, 'pt-BR')).forEach(topic => topicFilter.add(new Option(topic, topic)));
    render();
  })
  .catch(error => { count.textContent = ''; list.innerHTML = `<div class="empty">${escapeHtml(error.message)} Abra o projeto por um servidor local, por exemplo: <code>python3 -m http.server</code>.</div>`; });

[search, yearFilter, topicFilter].forEach(control => control.addEventListener(control === search ? 'input' : 'change', render));
document.querySelector('#clear').addEventListener('click', () => { search.value = ''; yearFilter.value = ''; topicFilter.value = ''; render(); });
