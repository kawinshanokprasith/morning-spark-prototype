/* Fake browser behind the Web Browser icon: Google-style start page, address-bar suggestions,
   back/forward. The Maker (maker.js) is the "Morning Spark Admin" page inside it. */
const ADMIN_HOST = 'https://morningspark.krungthai/MSweb/maker/';
const B = {page:'start', q:'', hist:[{page:'start'}], i:0, sugg:[], sel:0};
const SITE_RX = /morning|spark|ms|admin|มอร์นิ่ง|มอนิ่ง|สปาร์ค|สปาร์ก/i;
const BR_SVG = {
  mag:'<svg viewBox="0 0 24 24"><path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1014 15.5l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" fill="currentColor"/></svg>',
  mic:'<svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.9V21h2v-3.1A7 7 0 0019 11h-2z" fill="#4285f4"/></svg>',
  cam:'<svg viewBox="0 0 24 24"><path d="M9 3L7.2 5H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-3.2L15 3H9zm3 15a5 5 0 110-10 5 5 0 010 10z" fill="#34a853"/></svg>',
  grid:'<svg viewBox="0 0 24 24"><g fill="#5f6368"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></g></svg>',
  site:`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#1d5fd0"/><circle cx="12" cy="12" r="3.6" fill="#fff"/><g stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.7 6.7l1.4 1.4M15.9 15.9l1.4 1.4M6.7 17.3l1.4-1.4M15.9 8.1l1.4-1.4"/></g></svg>`,
};
const $$ = (sel, r=document) => [...r.querySelectorAll(sel)];
const gWord = (cls='') => `<span class="g-word ${cls}"><b style="color:#4285f4">G</b><b style="color:#ea4335">o</b><b style="color:#fbbc05">o</b><b style="color:#4285f4">g</b><b style="color:#34a853">l</b><b style="color:#ea4335">e</b></span>`;
const TILES = [['O','Outlook','#0f6cbd'],['T','Teams','#5b5fc7'],['อ','อินทราเน็ต','#188038'],['ข','ข่าวสาร','#c5221f']];

function brUrl(h){
  if (h.page==='start') return '';
  if (h.page==='results') return 'https://www.google.com/search?q=' + encodeURIComponent(h.q);
  return ADMIN_HOST + ({login:'login.jsp', list:'articles', form: M.form?.rowId ? `articles/edit.jsp?ref=${M.form.ref}` : 'articles/create.jsp'}[M.view] || 'login.jsp');
}
function brTitle(h){ return h.page==='start' ? 'แท็บใหม่' : h.page==='results' ? `${h.q} - ค้นหา` : 'Morning Spark'; }

/* keep tab, address bar and back/forward buttons in step with the current page */
function brSync(){
  const el = document.getElementById('maker'); if (!el) return;
  const h = B.hist[B.i];
  const addr = el.querySelector('#m-url');
  if (addr && document.activeElement!==addr) addr.value = brUrl(h);
  el.querySelector('#br-title').textContent = brTitle(h);
  const fav = el.querySelector('.br-tab .fav');
  fav.classList.toggle('g', h.page!=='admin');
  fav.innerHTML = h.page==='admin' ? `<img src="${A}w-logo-white.svg" alt="">` : BR_SVG.mag;
  el.querySelector('[data-br="back"]').classList.toggle('off', B.i===0);
  el.querySelector('[data-br="fwd"]').classList.toggle('off', B.i>=B.hist.length-1);
  el.querySelector('.br-url').classList.toggle('empty', h.page==='start');
}
function brShow(){
  const h = B.hist[B.i]; B.page = h.page; brHide();
  if (h.page==='admin') return mRender();
  $('#m-page').innerHTML = h.page==='start' ? vStart() : vResults(h.q);
  brSync();
  if (h.page==='start') $('#maker #br-gq')?.focus();
}
function brGo(h){
  const cur = B.hist[B.i];
  if (cur.page===h.page && cur.q===h.q) return brShow();
  B.hist = B.hist.slice(0, B.i+1).concat(h); B.i = B.hist.length-1; brShow();
}
function brStep(n){ const k = B.i+n; if (k<0 || k>=B.hist.length) return; B.i = k; brShow(); }

function vStart(){
  return `<div class="g-page"><div class="g-top"><span>Gmail</span><span>รูปภาพ</span><span class="ico">${BR_SVG.grid}</span></div>
    <div class="g-mid">${gWord('big')}
      <div class="g-box">${BR_SVG.mag}<input id="br-gq" autocomplete="off" spellcheck="false" aria-label="ค้นหา"><span class="ico">${BR_SVG.mic}</span><span class="ico">${BR_SVG.cam}</span><div class="br-sugg" id="br-sugg-g"></div></div>
      <div class="g-btns"><button data-br="gsearch">ค้นหาด้วย Google</button><button data-br="lucky">ฉันรู้สึกโชคดี</button></div>
      <div class="g-tiles">${TILES.map(t => `<button data-br="tile"><span style="background:${t[2]}">${t[0]}</span>${t[1]}</button>`).join('')}<button data-br="tile"><span class="add">+</span>เพิ่มทางลัด</button></div>
    </div></div>`;
}
function vResults(q){
  return `<div class="g-page res"><div class="g-head">${gWord()}<div class="g-box sm">${BR_SVG.mag}<input id="br-gq" value="${esc(q)}" autocomplete="off" spellcheck="false" aria-label="ค้นหา"><div class="br-sugg" id="br-sugg-g"></div></div></div>
    <div class="g-res"><p>ไม่พบผลการค้นหาสำหรับ <b>“${esc(q)}”</b></p><p class="sub">ต้นแบบนี้ไม่ได้เชื่อมต่ออินเทอร์เน็ต จึงไม่มีผลการค้นหาจริง</p></div></div>`;
}

/* ---- suggestions ---- */
function brItems(q){
  q = q.trim(); if (!q) return [];
  const items = [];
  if (SITE_RX.test(q)) items.push({kind:'site', text:'Morning Spark Admin', sub:ADMIN_HOST.replace('https://','') + 'login.jsp'});
  [q, q + ' login', q + ' ktb'].forEach(s => items.push({kind:'search', text:s}));
  return items;
}
function brSuggest(inp){
  B.src = inp; B.sugg = brItems(inp.value); B.sel = 0;
  const box = inp.id==='m-url' ? $('#br-sugg-a') : inp.parentElement.querySelector('.br-sugg');
  $$('.br-sugg').forEach(b => b!==box && (b.innerHTML = '', b.classList.remove('open')));
  box.classList.toggle('open', B.sugg.length>0);
  box.innerHTML = B.sugg.map((s,i) => s.kind==='site'
    ? `<div class="sg${i===B.sel?' on':''}" data-br="pick" data-i="${i}"><span class="sg-i">${BR_SVG.site}</span><span class="sg-t"><b>${esc(s.text)}</b><em>&nbsp;— ${esc(s.sub)}</em></span></div>`
    : `<div class="sg${i===B.sel?' on':''}" data-br="pick" data-i="${i}"><span class="sg-i">${BR_SVG.mag}</span><span class="sg-t">${esc(s.text)}</span></div>`).join('');
}
function brHide(){ B.sugg = []; $$('.br-sugg').forEach(b => { b.innerHTML = ''; b.classList.remove('open'); }); }
function brMark(){ $$('.br-sugg.open .sg').forEach((r,i) => r.classList.toggle('on', i===B.sel)); }
function brChoose(i){
  const s = B.sugg[i]; if (!s) return;
  brHide(); document.activeElement?.blur?.();
  if (s.kind==='site') return brGo({page:'admin'});
  brGo({page:'results', q:s.text});
}
function brSubmit(inp){ // Enter / search button with no highlighted row
  const q = inp.value.trim(); if (!q) return;
  B.sugg = brItems(q); B.sel = 0; brChoose(0);
}

/* ---- events (wired in openMaker) ---- */
function brClick(e){
  const t = e.target.closest('[data-br]'); if (!t) { if (!e.target.closest('.br-sugg,#br-gq,#m-url')) brHide(); return; }
  const k = t.dataset.br;
  if (k==='back') return brStep(-1);
  if (k==='fwd') return brStep(1);
  if (k==='reload') return brShow();
  if (k==='pick') return brChoose(+t.dataset.i);
  if (k==='gsearch' || k==='lucky') return $('#br-gq').value.trim() ? brSubmit($('#br-gq')) : $('#br-gq').focus();
  if (k==='tile') return toast('ทางลัดนี้ไม่ได้อยู่ในขอบเขตของต้นแบบ');
}
function brInput(e){ if (e.target.id==='m-url' || e.target.id==='br-gq') brSuggest(e.target); }
function brKey(e){
  const t = e.target; if (t.id!=='m-url' && t.id!=='br-gq') return;
  if (e.key==='ArrowDown' || e.key==='ArrowUp'){
    if (!B.sugg.length) return brSuggest(t);
    e.preventDefault(); B.sel = (B.sel + (e.key==='ArrowDown'?1:-1) + B.sugg.length) % B.sugg.length; brMark();
  } else if (e.key==='Enter'){ e.preventDefault(); B.sugg.length ? brChoose(B.sel) : brSubmit(t); }
  else if (e.key==='Escape'){ if (B.sugg.length){ e.stopPropagation(); brHide(); } else { t.value = brUrl(B.hist[B.i]); t.blur(); } }
}
function brFocus(e){ if (e.target.id==='m-url'){ e.target.select(); if (e.target.value && B.page!=='admin') brSuggest(e.target); } }
function brBlur(e){ if (e.target.id==='m-url'){ brHide(); e.target.value = brUrl(B.hist[B.i]); } }
