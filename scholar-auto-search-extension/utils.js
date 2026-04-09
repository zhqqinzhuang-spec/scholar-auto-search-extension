(function(){
  function normalizeText(s) {
    if (!s) return '';
    return s.replace(/\s+/g,' ').trim().toLowerCase();
  }

  function ngrams(s, n=3) {
    s = normalizeText(s);
    if (s.length < n) return new Set([s]);
    const set = new Set();
    for (let i=0;i<=s.length-n;i++){
      set.add(s.slice(i, i+n));
    }
    return set;
  }

  function jaccardSimilarity(a,b) {
    const A = ngrams(a,3);
    const B = ngrams(b,3);
    if (A.size===0 && B.size===0) return 0;
    let inter = 0;
    A.forEach(x => { if (B.has(x)) inter++; });
    const uni = new Set(Array.from(A).concat(Array.from(B))).size;
    return uni === 0 ? 0 : inter / uni;
  }

  function keywordMatch(text, keywords) {
    if (!text) return false;
    const t = normalizeText(text);
    for (const k of keywords) {
      const kk = normalizeText(k);
      if (!kk) continue;
      if (kk.startsWith('^')) {
        if (t.startsWith(kk.slice(1))) return true;
      } else if (kk.startsWith('=')) {
        if (t === kk.slice(1)) return true;
      } else {
        if (t.indexOf(kk) !== -1) return true;
      }
    }
    return false;
  }

  function highlightElement(el, cls='sas-highlight') {
    if (!el) return;
    el.classList.add(cls);
  }

  window.sasUtils = {
    normalizeText, ngrams, jaccardSimilarity, keywordMatch, highlightElement
  };
})();
