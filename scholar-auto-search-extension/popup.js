async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

document.getElementById('runKeywords').addEventListener('click', async () => {
  const raw = document.getElementById('keywords').value || '';
  const kws = raw.split(',').map(s => s.trim()).filter(s => s);
  if (!kws.length) {
    showResult('请输入至少一个关键词（用逗号分隔）');
    return;
  }
  const tab = await getActiveTab();
  chrome.tabs.sendMessage(tab.id, { type: 'runKeywordFilter', payload: { keywords: kws } }, (resp) => {
    if (chrome.runtime.lastError) {
      showResult('无法运行：content script 未注入到当前页面。请打开 scholar.google.com 的学者/搜索结果页面后再试。');
      return;
    }
    showResult(`关键词检索已执行，匹配 ${resp.count} 条（页面高亮显示）`);
  });
});

document.getElementById('fetchPapers').addEventListener('click', async () => {
  const tab = await getActiveTab();
  chrome.tabs.sendMessage(tab.id, { type: 'getPapers' }, (resp) => {
    if (chrome.runtime.lastError) {
      showResult('无法获取论文：content script 未注入或页面不支持。');
      return;
    }
    const papers = resp.papers || [];
    if (!papers.length) { showResult('未检测到论文条目。'); return; }
    const list = papers.slice(0,40).map(p => `<div style="margin-bottom:8px"><a href="${p.link||'#'}" target="_blank">${escapeHtml(p.title||'(无标题)')}</a><div style="font-size:12px;color:#666">${escapeHtml(p.authorsAndVenue||'')}</div></div>`).join('');
    document.getElementById('result').innerHTML = list;
  });
});

document.getElementById('runSemantic').addEventListener('click', async () => {
  const q = document.getElementById('semanticQuery').value || '';
  const topK = parseInt(document.getElementById('topK').value || '5');
  if (!q) { showResult('请输入语义检索的示例文本或标题。'); return; }
  const tab = await getActiveTab();
  chrome.tabs.sendMessage(tab.id, { type: 'runSemanticLocal', payload: { query: q, topK } }, (resp) => {
    if (chrome.runtime.lastError) {
      showResult('无法运行语义检索：content script 未注入或页面不支持。');
      return;
    }
    if (!resp.ok) { showResult('本地语义检索失败'); return; }
    const results = resp.results || [];
    if (!results.length) { showResult('未找到相似论文（本地近似检查）。'); return; }
    const html = results.map(r => `<div style="margin-bottom:8px"><b>${escapeHtml(r.title||'(无标题)')}</b><div style="font-size:12px;color:#333">相似度: ${Number(r.sim).toFixed(3)}</div></div>`).join('');
    document.getElementById('result').innerHTML = html;
  });
});

document.getElementById('saveBackend').addEventListener('click', async () => {
  const url = document.getElementById('backendUrl').value || '';
  const key = document.getElementById('backendApiKey').value || '';
  chrome.storage.local.set({ backendUrl: url, backendApiKey: key }, () => {
    showResult('已保存后端设置（仅当使用远程语义检索时有效）');
  });
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}

function showResult(html) {
  document.getElementById('result').innerHTML = '<div style="font-size:13px">' + html + '</div>';
}

chrome.storage.local.get(['backendUrl','backendApiKey'], ({backendUrl, backendApiKey}) => {
  if (backendUrl) document.getElementById('backendUrl').value = backendUrl;
  if (backendApiKey) document.getElementById('backendApiKey').value = backendApiKey;
});
