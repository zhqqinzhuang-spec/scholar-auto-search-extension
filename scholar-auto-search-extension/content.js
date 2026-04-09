(function(){
  const style = document.createElement('style');
  style.textContent = `
  .sas-highlight { outline: 3px solid rgba(255,165,0,0.9); padding: 6px; border-radius:8px; background: rgba(255,255,0,0.02); }
  #sas-toolbar { position: fixed; right: 16px; top: 120px; z-index:999999; background: #fff; border:1px solid #ddd; padding:10px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08); font-size:13px; }
  #sas-toolbar .sas-btn { margin:4px; padding:6px 8px; border-radius:6px; cursor:pointer; border:1px solid #ccc; background:#f9f9f9; }
  `;
  document.head.appendChild(style);

  function extractPapers(){
    const papers = [];
    const items = document.querySelectorAll('.gs_r, .gs_ri, .gsc_a_tr');
    items.forEach((item, idx) => {
      let title = '', link = '', snippet = '', authorsAndVenue = '';
      if (item.classList && item.classList.contains('gsc_a_tr')) {
        const titleEl = item.querySelector('.gsc_a_at');
        title = titleEl ? titleEl.textContent.trim() : '';
        link = titleEl && titleEl.href ? titleEl.href : '';
        const authorsEl = item.querySelector('.gs_gray') || item.querySelector('.gsc_a_at');
        authorsAndVenue = authorsEl ? authorsEl.innerText.trim() : '';
        snippet = '';
      } else {
        const titleEl = item.querySelector('.gs_rt a');
        title = titleEl ? titleEl.innerText.trim() : (item.querySelector('.gs_rt') ? item.querySelector('.gs_rt').innerText.trim() : '');
        link = titleEl ? titleEl.href : '';
        const snippetEl = item.querySelector('.gs_rs');
        snippet = snippetEl ? snippetEl.innerText.trim() : '';
        const authorsEl = item.querySelector('.gs_a');
        authorsAndVenue = authorsEl ? authorsEl.innerText.trim() : '';
      }
      papers.push({
        index: papers.length,
        title, link, snippet, authorsAndVenue
      });
    });
    return papers;
  }

  function ensureToolbar(){
    if (document.getElementById('sas-toolbar')) return;
    const bar = document.createElement('div');
    bar.id = 'sas-toolbar';
    bar.innerHTML = `<div style="font-weight:600;margin-bottom:6px">Scholar Auto Search</div>
      <div id="sas-count">—</div>
      <div style="margin-top:6px">
        <button id="sas-clear" class="sas-btn">清除高亮</button>
      </div>`;
    document.body.appendChild(bar);
    document.getElementById('sas-clear').addEventListener('click', ()=> {
      document.querySelectorAll('.sas-highlight').forEach(el => el.classList.remove('sas-highlight'));
      const c = document.getElementById('sas-count'); if (c) c.innerText = '0';
    });
  }
  ensureToolbar();

  function highlightByIndexes(idxList) {
    const items = Array.from(document.querySelectorAll('.gs_r, .gs_ri, .gsc_a_tr'));
    items.forEach(it => it.classList.remove('sas-highlight'));
    idxList.forEach(i => {
      const el = items[i];
      if (el) el.classList.add('sas-highlight');
    });
    const c = document.getElementById('sas-count'); if (c) c.innerText = `${idxList.length} 个匹配`;
  }

  function runKeywordFilter(keywords) {
    const papers = extractPapers();
    const idxs = [];
    papers.forEach((p, i) => {
      const text = [p.title, p.snippet, p.authorsAndVenue].join('\n');
      if (window.sasUtils.keywordMatch(text, keywords)) idxs.push(i);
    });
    highlightByIndexes(idxs);
    return idxs.length;
  }

  function runSemanticLocal(query, topK=5) {
    const papers = extractPapers();
    const scores = papers.map((p, i) => {
      const text = [p.title, p.snippet, p.authorsAndVenue].join(' ');
      const sim = window.sasUtils.jaccardSimilarity(query, text);
      return {i, sim, title: p.title, link: p.link};
    });
    scores.sort((a,b) => b.sim - a.sim);
    const top = scores.slice(0, topK).filter(s => s.sim > 0);
    const idxs = top.map(t => t.i);
    highlightByIndexes(idxs);
    return top;
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.type) return;
    if (msg.type === 'runKeywordFilter') {
      const { keywords } = msg.payload || {};
      const count = runKeywordFilter(keywords || []);
      sendResponse({ ok: true, count });
    } else if (msg.type === 'getPapers') {
      const papers = extractPapers();
      sendResponse({ papers });
    } else if (msg.type === 'runSemanticLocal') {
      const { query, topK } = msg.payload || {};
      const top = runSemanticLocal(query || '', topK || 5);
      sendResponse({ ok: true, results: top });
    } else if (msg.type === 'applySemanticIndexes') {
      const { indexes } = msg.payload || {};
      highlightByIndexes(indexes || []);
      sendResponse({ ok: true });
    }
  });

  window.sasContent = { extractPapers, runKeywordFilter, runSemanticLocal };
})();
