const list = document.querySelector('#list');
const search = document.querySelector('#search');
const yearFilter = document.querySelector('#year');
const topicFilter = document.querySelector('#topic');
const count = document.querySelector('#count');
let questions = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
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
      <div class="question-text">${escapeHtml(q.texto)}</div>
      ${q.imagens.length ? `<div class="figures">${q.imagens.map(src => `<a href="${encodeURI(src)}" target="_blank" rel="noopener"><img loading="lazy" src="${encodeURI(src)}" alt="Figura da questão ${q.numero}"></a>`).join('')}</div>` : ''}
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
