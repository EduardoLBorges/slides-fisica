const list = document.querySelector('#list');
const search = document.querySelector('#search');
const yearFilter = document.querySelector('#year');
const topicFilter = document.querySelector('#topic');
const count = document.querySelector('#count');
const selectionCount = document.querySelector('#selection-count');
const selectedQuestions = new Set();
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
  const lines = question.texto.replace(/\f/g, '\n').split(/\r?\n/);
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

  const blocks = [];
  let blockLines = [];
  let blockStart = 0;
  const flushBlock = end => {
    if (!blockLines.length) return;
    const text = escapeHtml(blockLines.map(line => line.trim()).filter(Boolean).join(' '));
    const figures = [];
    for (let index = blockStart; index <= end; index += 1) {
      figures.push(...(insertions.get(index) || []));
    }
    if (text) blocks.push(`<p>${text}</p>`);
    blocks.push(...figures);
    blockLines = [];
  };

  lines.forEach((line, index) => {
    const isChoice = /^\s*\([A-E]\)(?:\s|$)/.test(line);
    if (!line.trim()) {
      flushBlock(index - 1);
      return;
    }
    if (isChoice) flushBlock(index - 1);
    if (!blockLines.length) blockStart = index;
    blockLines.push(line);
    if (isChoice) flushBlock(index);
  });
  flushBlock(lines.length - 1);
  return blocks.join('');
}

function getFilteredQuestions() {
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  const selectedYear = yearFilter.value;
  const selectedTopic = topicFilter.value;
  const filtered = questions.filter(q =>
    (!selectedYear || String(q.ano) === selectedYear) &&
    (!selectedTopic || q.tema === selectedTopic) &&
    (!query || `${q.texto} ${q.ano} ${q.tema} ${q.numero}`.toLocaleLowerCase('pt-BR').includes(query))
  );
  return filtered;
}

function updateSelectionTools() {
  const total = selectedQuestions.size;
  selectionCount.textContent = `${total} ${total === 1 ? 'questão selecionada' : 'questões selecionadas'}`;
  document.querySelector('#export-selected').disabled = total === 0;
}

function render() {
  const filtered = getFilteredQuestions();
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'questão' : 'questões'}`;
  if (!filtered.length) {
    list.innerHTML = '<div class="empty">Nenhuma questão corresponde a esses filtros.</div>';
    updateSelectionTools();
    return;
  }
  list.innerHTML = filtered.map(q => `
    <article class="question">
      <header class="question-head"><label class="question-select"><input type="checkbox" data-question="${q.numero}" ${selectedQuestions.has(q.numero) ? 'checked' : ''} aria-label="Selecionar questão ${q.numero}"></label><div><span class="number">Questão ${q.numero}</span><span class="meta">ENEM ${q.ano} · ${escapeHtml(q.tema)}</span></div><span class="page">PDF p. ${q.paginaPdf}</span></header>
      <div class="question-text">${renderQuestionBody(q)}</div>
      ${q.alternativa ? `<details class="answer"><summary>Ver gabarito</summary><p>Alternativa <strong>${escapeHtml(q.alternativa)}</strong></p></details>` : '<p class="no-answer">Gabarito não localizado no arquivo extraído.</p>'}
    </article>`).join('');
  updateSelectionTools();
}

function exportSelected() {
  const chosen = questions.filter(question => selectedQuestions.has(question.numero));
  if (!chosen.length) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.alert('Permita a abertura da janela de impressão para gerar o PDF.');
    return;
  }

  const cards = chosen.map(q => `
    <article class="question">
      <header class="question-head"><div><span class="number">Questão ${q.numero}</span><span class="meta">ENEM ${q.ano} · ${escapeHtml(q.tema)}</span></div><span class="page">PDF p. ${q.paginaPdf}</span></header>
      <div class="question-text">${renderQuestionBody(q)}</div>
    </article>`).join('');
  printWindow.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${escapeHtml(location.href)}"><title>Questões selecionadas</title><link rel="stylesheet" href="css/index.css"><link rel="stylesheet" href="css/questoes.css"><style>
    body { padding: 24px; background: #fff; color: #111; }
    .print-title { margin: 0 0 18px; font: 700 18px Arial, sans-serif; }
    .question-list { display: grid; gap: 12px; }
    .question { break-inside: avoid; border: 1px solid #bbb; border-left: 3px solid #555; background: #fff; color: #111; }
    .question-head { border-color: #ccc; }
    .number, .meta, .page, .question-text { color: #111; }
    .question-figure img { max-height: 320px; }
    @page { margin: 16mm; }
    @media print { body { padding: 0; } }
  </style></head><body><h1 class="print-title">Questões selecionadas</h1><main class="question-list">${cards}</main></body></html>`);
  printWindow.document.close();
  printWindow.addEventListener('load', () => {
    const images = [...printWindow.document.images];
    Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }))).then(() => {
      printWindow.focus();
      printWindow.print();
    });
  }, { once: true });
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
list.addEventListener('change', event => {
  const checkbox = event.target.closest('input[data-question]');
  if (!checkbox) return;
  const number = Number(checkbox.dataset.question);
  if (checkbox.checked) selectedQuestions.add(number);
  else selectedQuestions.delete(number);
  updateSelectionTools();
});
document.querySelector('#select-visible').addEventListener('click', () => {
  getFilteredQuestions().forEach(question => selectedQuestions.add(question.numero));
  render();
});
document.querySelector('#clear-selection').addEventListener('click', () => {
  selectedQuestions.clear();
  render();
});
document.querySelector('#export-selected').addEventListener('click', exportSelected);
