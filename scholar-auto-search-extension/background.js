chrome.runtime.onInstalled.addListener(() => {
  console.log('Scholar Auto Search background installed');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== 'proxySemanticToBackend') return;
  chrome.storage.local.get(['backendUrl', 'backendApiKey'], ({backendUrl, backendApiKey}) => {
    if (!backendUrl) {
      //校验后端地址是否存在，不存在则返回错误
      sendResponse({ ok: false, error: 'No backendUrl configured. Set it in extension settings.' });
      return;
    }
    fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(backendApiKey ? { 'x-api-key': backendApiKey } : {})
      },
      body: JSON.stringify(msg.payload)
    }).then(r => r.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));
  });
  return true; 
});
