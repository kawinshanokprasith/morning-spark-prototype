// Morning Spark Maker (admin portal for NRR Compliance), shown in a browser window on the desktop.
// Shares ARTICLES with the Receiver: publishing, editing and recalling here updates the widget and app.
const MA = 'assets/maker/';
const TODAY = '09/09/2569', TOMORROW = '10/09/2569';
const ME = 'Kamolchanok P.';
const AUTHORS = ['Sorrawit J.', 'Kamolchanok P.', 'Sirin W.'];
const GROUP_LOCKED = 'กลุ่มทำกับงานกฎเกณฑ์';
const GROUPS = ['สาขา: บริหารภาพรวม', 'สาขา: สินเชื่อ', 'สาขา: บริการลูกค้า/ การขาย', 'สาขา: บริการลูกค้า', 'สำนักงานเขต: บริหารภาพรวม', 'Branch Call Center'];
// Document types and image sources follow the Iteration 2 filter lists in Figma
const DOC_TYPES = ['ระเบียบ', 'คู่มือ', 'นโยบาย', 'นว.', 'คำสั่ง ธ.', 'ฟอร์ม', 'คู่มือการขาย (Sales Sheet)', 'อื่นๆ'];
const DOC_STATUS = ['ใหม่', 'อัปเดต', 'ยกเลิก', 'เหมือนเดิม'];
const IMG_SOURCES = ['CLMG POST', 'เรื่องเด่นเรื่องเด็ด', 'สรุปสั้นทันใจ', 'NRR พารู้', 'อื่นๆ'];
const STATUS_LABEL = {published:'เผยแพร่แล้ว', scheduled:'กำหนดเผยแพร่', draft:'ฉบับร่าง', expired:'หมดอายุ', recalled:'ยกเลิกใช้'};
const UPLOAD_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#1a1e28" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4.5 4.5 0 01-.6-8.96A6 6 0 0118 9a4 4 0 01-1 7.9"/><path d="M12 12v9m0-9l-3 3m3-3l3 3"/></svg>`;

const GRIP = `<button type="button" class="grip" data-grip aria-label="ลากเพื่อจัดลำดับ (หรือกด ↑ ↓)" data-tip="ลากเพื่อจัดลำดับ"><svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor"><circle cx="2.5" cy="3" r="1.4"/><circle cx="7.5" cy="3" r="1.4"/><circle cx="2.5" cy="8" r="1.4"/><circle cx="7.5" cy="8" r="1.4"/><circle cx="2.5" cy="13" r="1.4"/><circle cx="7.5" cy="13" r="1.4"/></svg></button>`;
const pad = n => String(n).padStart(2,'0');
const parseBE = s => { const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s||''); return m ? new Date(+m[3]-543, +m[2]-1, +m[1]) : null; };
const toBE = d => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()+543}`;
const clock = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const daysBetween = (a,b) => Math.round((parseBE(b)-parseBE(a))/864e5);
const splitEff = eff => { const m = (eff||'').replace('เริ่มใช้','').trim().split(' - '); return {start:(m[0]||'').trim(), end:(m[1]||'').trim()}; };
const guessType = n => /Sales sheet/i.test(n) ? 'คู่มือการขาย (Sales Sheet)' : n.includes('ระเบียบ') ? 'ระเบียบ' : (n.includes('คู่มือ') || /Checklist|ตาราง|สคริปต์|รายการ/.test(n)) ? 'คู่มือ' : n.includes('นโยบาย') ? 'นโยบาย' : n.includes('หนังสือเวียน') ? 'นว.' : /ประกาศ|พ\.ร\.[กบ]|คำสั่ง/.test(n) ? 'คำสั่ง ธ.' : /ฟอร์ม|Form/i.test(n) ? 'ฟอร์ม' : 'อื่นๆ';
const docUrl = n => 'https://intranet.krungthai/compliance/docs/' + encodeURIComponent(n) + '.pdf';

/* ---------- Seed rows (published articles mirror the Receiver data) ---------- */
const MK = {rows:[], seq:2};
ARTICLES.forEach((a,i) => {
  const d = 18 - i;
  MK.rows.push({id:'r'+a.id, aid:a.id, ref:`6907${pad(d)}-${String(i%3?i+1:2).padStart(3,'0')}`, mstatus:'published',
    createdBy:i%3===1?ME:'Sorrawit J.', created:`${pad(d)}/07/2569 16:16:32`, updatedBy:ME, updated:`${pad(d+1)}/07/2569 09:10:32`, ts:d+1});
});
[
  {ref:'690713-D014', type:'practice', title:'การเปิดบัญชีเงินฝาก Next savings', start:'01/08/2569', end:'', mstatus:'scheduled', sched:'12/09/2569', lockedBy:'Sirin W.', createdBy:'Sorrawit J.', created:'13/07/2569 16:16:32', updated:'18/07/2569 09:10:32', ts:18.5},
  {ref:'690713-D901', type:'product', title:'บัตรเครดิต KTC', start:'15/01/2569', end:'15/12/2569', mstatus:'draft', badge:{status:'update'}, createdBy:'Sorrawit J.', created:'13/07/2569 11:16:32', updated:'17/07/2569 09:10:32', ts:17.5},
  {ref:'690713-D026', type:'practice', title:'ฟอร์มใหม่ FATCA', start:'01/10/2569', end:'', mstatus:'scheduled', sched:'15/09/2569', createdBy:'Sorrawit J.', created:'13/07/2569 18:16:32', updated:'13/07/2569 09:10:32', ts:13.5},
  {ref:'690707-011', type:'product', title:'สินเชื่อ Home for cash', start:'01/08/2569', end:'12/09/2569', mstatus:'published', createdBy:'Sorrawit J.', created:'07/07/2569 16:16:32', updated:'08/07/2569 09:10:32', ts:8.5},
  {ref:'690702-003', type:'product', title:'ไทยช่วยไทยพลัส', start:'01/06/2569', end:'30/06/2569', mstatus:'expired', badge:{status:'cancel', cancel:'01/07/2569'}, createdBy:'Sorrawit J.', created:'02/07/2569 16:16:32', updated:'11/07/2569 09:10:32', ts:7.5},
  {ref:'690701-992', type:'product', title:'การเปิดบัญชีเงินฝาก Next savings (ฉบับเดิม)', start:'01/08/2569', end:'30/08/2569', mstatus:'recalled', badge:{status:'cancel', cancel:'01/07/2569'}, createdBy:'Sirin W.', created:'02/07/2569 16:16:32', updated:'09/07/2569 09:10:32', ts:6.5},
].forEach((r,i) => MK.rows.push({id:'x'+i, updatedBy:ME, ...r}));

const M = {loggedIn:false, view:'login', tab:'articles', q:'', qInput:'', onlyUpd:false, type:'all', author:'all', status:'all',
  sort:{key:'ts', dir:-1}, page:1, per:10, side:false, form:null, modal:null, prev:null, open:{}};

const art = r => r.aid ? ARTICLES.find(a => a.id===r.aid) : null;
function rv(r){ // row view: live fields from the shared article when there is one
  const a = art(r);
  if (!a) return {...r, badge:r.badge||{}};
  const {start,end} = splitEff(a.eff);
  return {...r, type:a.type, title:a.title, start, end, badge:{status:a.status, cancel:a.cancel}};
}

/* ---------- Window ---------- */
function openMaker(){
  let el = document.getElementById('maker');
  if (!el){
    el = document.createElement('div'); el.className = 'win'; el.id = 'maker';
    el.innerHTML = `<div class="br-tabs">
        <div class="br-tab"><span class="fav"><img src="${A}w-logo-white.svg" alt=""></span><span class="t">Morning Spark</span><img class="x" src="${MA}b-close.svg" alt=""></div>
        <span class="br-new"><img src="${MA}b-add.svg" alt=""></span><div class="grow"></div>
        <div class="os-ctl"><button data-mwin="min">${ctlSvg.min}</button><button data-mwin="max">${ctlSvg.max}</button><button class="x" data-mwin="close">${ctlSvg.x}</button></div></div>
      <div class="br-bar"><img src="${MA}b-back.svg" alt=""><img src="${MA}b-fwd.svg" alt=""><img src="${MA}b-refresh.svg" alt="">
        <div class="br-url"><img src="${MA}b-lock.svg" alt=""><span id="m-url"></span></div>
        <img src="${MA}b-share.svg" alt=""><img src="${MA}b-bookmark.svg" alt=""><img src="${MA}b-more.svg" alt=""></div>
      <div class="m-page" id="m-page"></div>`;
    $('#windows').appendChild(el);
    makeDraggable(el, el.querySelector('.br-tabs'));
    makeResizable(el, 800, 500);
    el.addEventListener('pointerdown', mReorder);
    el.addEventListener('click', mClick);
    el.addEventListener('input', mInput);
    el.addEventListener('change', mChange);
    el.addEventListener('submit', mSubmit);
    ['dragover','dragleave','drop'].forEach(t => el.addEventListener(t, mDrag));
    place(el);
  }
  el.classList.remove('hidden'); focusWin(el); mRender();
}

/* ---------- Views ---------- */
function mRender(){
  const pg = $('#m-page'); if (!pg) return;
  const urls = {login:'login.jsp', list:'articles', form: M.form?.rowId ? `articles/edit.jsp?ref=${M.form.ref}` : 'articles/create.jsp'};
  $('#m-url').textContent = 'https://morningspark.krungthai/MSweb/maker/' + urls[M.view];
  const keep = pg.querySelector('.m-main')?.scrollTop || 0;
  if (M.view==='login'){ pg.innerHTML = vMLogin() + vModal(); return; }
  pg.innerHTML = vSide() + `<div class="m-main"><div class="m-zoom">${M.view==='list'?vList():vForm()}</div></div>` + vModal() + vPreview();
  if (M._keepScroll) pg.querySelector('.m-main').scrollTop = keep;
  M._keepScroll = false;
}
const rerender = () => { M._keepScroll = true; mRender(); };

function vMLogin(){
  return `<div class="m-login"><div class="m-zoom" style="display:grid;place-items:center;min-height:auto"><form class="m-card" id="m-login" novalidate>
    <div class="m-logo"><span><img src="${A}logo-sun-orange.svg" alt=""></span>Morning Spark</div>
    <h2>เข้าสู่ระบบ</h2>
    <div class="form">
      <div class="field" id="mf-id"><label>รหัสพนักงาน (Employee AD) <i>*</i></label><div class="input"><input id="m-emp" placeholder="กรอกรหัสพนักงาน (Employee AD)" autocomplete="off"></div><div class="msg">กรุณากรอกรหัสพนักงาน</div></div>
      <div class="field" id="mf-pw"><label>รหัสผ่าน <i>*</i></label><div class="input"><input id="m-pw" type="password" placeholder="กรอกรหัสผ่าน"><button type="button" data-m="eye"><img src="${A}icon-eye.svg" alt=""></button></div><div class="msg">กรุณากรอกรหัสผ่าน</div></div>
      <button class="btn-primary" type="submit" id="m-login-btn">เข้าสู่ระบบ</button>
    </div>
    <div class="version">Version 0.1.0 <img src="${A}dot.svg" alt=""> Build 20260520020402</div>
    <img class="ktb" src="${MA}ktb-logo-color.png" alt="Krungthai">
  </form></div></div>`;
}
function vSide(){
  return `<nav class="m-side${M.side?' open':''}">
    <div class="it logo"><img src="${MA}logo.svg" alt=""><span class="lbl">Morning Spark</span></div>
    <button class="it" data-m="side" data-tip="ขยายเมนู"><img src="${MA}chev-double-right.svg" alt="" style="transform:rotate(${M.side?180:0}deg)"><span class="lbl">ย่อเมนู</span></button>
    <hr>
    <button class="it on" data-m="home"><img src="${MA}megaphone-fill.svg" alt=""><span class="lbl">ประกาศ</span></button>
    <div class="sp"></div>
    <div class="it"><svg width="24" height="24" viewBox="0 0 24 24" style="flex-shrink:0"><circle cx="12" cy="12" r="11" fill="#fff"/><circle cx="12" cy="9.5" r="3.6" fill="#359fe1"/><path d="M5.2 19a7.5 7.5 0 0113.6 0A10.9 10.9 0 0112 23a10.9 10.9 0 01-6.8-4z" fill="#359fe1"/></svg><span class="lbl who">${ME}<br>NRR Compliance</span></div>
    <hr>
    <button class="it" data-m="logout" data-tip="ออกจากระบบ"><img src="${MA}logout.svg" alt=""><span class="lbl">ออกจากระบบ</span></button>
  </nav>`;
}
const opts = (list, v, all) => (all?`<option value="all">${all}</option>`:'') + list.map(o => { const [val,lab] = Array.isArray(o)?o:[o,o]; return `<option value="${esc(val)}"${val===v?' selected':''}>${esc(lab)}</option>`; }).join('');
const msel = (id, list, v, all, w) => `<label class="sel" style="width:${w}px"><select data-mf="${id}">${opts(list,v,all)}</select><img src="${MA}chev-down.svg" alt=""></label>`;

function vList(){
  const tabs = [['articles','tab-list.svg','ประกาศ'],['docs','tab-folder.svg','เอกสาร'],['images','tab-photo.svg','ข้อมูลรูปภาพ']];
  const body = M.tab==='articles' ? vArticles() : M.tab==='docs' ? vDocs() : vImages();
  return `<div class="m-wrap">
    <div class="m-head"><div><h1>ประกาศ</h1><p>ค้นหาและจัดการประกาศทั้งหมดใน Morning Spark</p></div>
      <div class="m-actions"><button class="btn sec" data-m="report"><img src="${MA}download.svg" alt="">ดาวน์โหลดรายงาน</button>
      <button class="btn pri" data-m="create"><img src="${MA}plus.svg" alt="" style="filter:brightness(0) invert(1)">สร้างประกาศ</button></div></div>
    <div class="panel"><div class="m-tabs">${tabs.map(t=>`<button class="m-tab${M.tab===t[0]?' on':''}" data-mtab="${t[0]}"><img src="${MA}${t[1]}" alt="">${t[2]}</button>`).join('')}</div>${body}</div>
  </div>`;
}
function searchBar(ph, extra=''){
  return `<form class="m-filters" id="m-search"><div class="input"><img src="${A}icon-search.svg" alt=""><input id="m-q" value="${esc(M.qInput)}" placeholder="${ph}"></div>
    <button class="btn sec" type="submit" style="min-width:96px">ค้นหา</button><div class="grow"></div>${extra}</form>`;
}
function filteredRows(){
  const q = M.q.trim().toLowerCase();
  const rows = MK.rows.map(rv).filter(r =>
    (!q || (r.title+' '+r.ref).toLowerCase().includes(q)) && (!M.onlyUpd || r.badge.status==='update') &&
    (M.type==='all' || r.type===M.type) && (M.author==='all' || r.createdBy===M.author) && (M.status==='all' || r.mstatus===M.status));
  const {key,dir} = M.sort;
  return rows.sort((a,b) => (a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0) * dir);
}
function vArticles(){
  const rows = filteredRows(), n = rows.length, pages = Math.max(1, Math.ceil(n/M.per));
  M.page = Math.min(M.page, pages);
  const from = (M.page-1)*M.per, view = rows.slice(from, from+M.per);
  const sortBtn = (k,l) => `<button data-sort="${k}" class="${M.sort.key===k?'on':''}">${l}<img src="${MA}${M.sort.key===k&&M.sort.dir>0?'sort-asc.svg':'sort-desc.svg'}" alt=""></button>`;
  const extra = `<label class="chk"><input type="checkbox" data-mf="onlyUpd" ${M.onlyUpd?'checked':''}>แสดงเฉพาะอัปเดต</label>
    ${msel('type',[['product','ผลิตภัณฑ์'],['practice','ข้อปฏิบัติ']],M.type,'ประเภททั้งหมด',128)}
    ${msel('author',AUTHORS,M.author,'ผู้เขียนทั้งหมด',136)}
    ${msel('status',Object.entries(STATUS_LABEL),M.status,'สถานะทั้งหมด',132)}
    <button type="button" class="ghost" data-m="clear" style="min-width:auto">ล้างตัวกรอง</button>`;
  return searchBar('ค้นหาประกาศ หรือรหัสอ้างอิง', extra) + `<div class="tbl">
    <div class="tr thd">${sortBtn('ref','รหัสอ้างอิง')}<span>ชื่อประกาศ</span><span>เริ่มใช้</span><span>สร้างโดย</span>${sortBtn('ts','อัปเดตโดย')}<span>สถานะ</span><span>การจัดการ</span></div>
    ${view.length ? view.map(rowHtml).join('') : `<div class="m-empty"><b>ไม่พบประกาศ</b>ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</div>`}
  </div>
  <div class="tbl-foot"><span>แสดง ${n?from+1:0}-${Math.min(from+M.per,n)} จาก ${n} รายการ</span>
    <div class="r">จำนวนรายการต่อหน้า <label class="sel"><select data-mf="per">${opts([5,10,20].map(v=>[String(v),String(v)]),String(M.per))}</select><img src="${MA}chev-down.svg" alt=""></label>
      <div class="pager">${pagerHTML(M.page, pages, 'mpage')}</div></div></div>`;
}
function rowHtml(r){
  const locked = !!r.lockedBy, dim = locked || r.ref.includes('-D');
  const left = r.end && r.mstatus==='published' ? daysBetween(TODAY, r.end) : null;
  const warn = left!==null && left>=0 && left<=3 ? `<div class="warn"><img src="${MA}warn.svg" alt="">หมดอายุในอีก ${left} วัน</div>` : '';
  let acts = '';
  if (r.mstatus==='published') acts = `<button class="ib" data-edit="${r.id}" data-tip="แก้ไข" ${locked?'disabled':''}><img src="${MA}${locked?'edit-dis':'edit'}.svg" alt=""></button><button class="ib" data-recall="${r.id}" data-tip="เรียกคืนประกาศ" ${locked?'disabled':''}><img src="${MA}recall.svg" alt=""></button>`;
  else if (r.mstatus==='draft' || r.mstatus==='scheduled') acts = `<button class="ib" data-edit="${r.id}" data-tip="แก้ไข" ${locked?'disabled':''}><img src="${MA}${locked?'edit-dis':'edit'}.svg" alt=""></button><button class="ib" data-del="${r.id}" data-tip="ลบ" ${locked?'disabled':''}><img src="${MA}${locked?'trash-dis':'trash'}.svg" alt=""></button>`;
  const badgeArt = {type:r.type, status:r.badge.status, cancel:r.badge.cancel};
  return `<div class="tr${dim?' dim':''}">
    <span>${r.ref}</span>
    <div class="tt"><b>${TYPE[r.type].label}${badgeArt.status?badges(badgeArt).replace(/<span class="badge type">.*?<\/span>/,''):''}</b><div class="ttl">${esc(r.title)}</div></div>
    <div>${r.start}${r.end?' - '+r.end:''}${warn}</div>
    <div>${r.createdBy}<small>${r.created}</small></div>
    <div>${r.updatedBy}<small>${r.updated}</small></div>
    <div><span class="st ${r.mstatus}">${STATUS_LABEL[r.mstatus]}</span>
      ${r.sched?`<div class="meta"><img src="${MA}calendar.svg" alt="">วันที่ ${r.sched}</div>`:''}
      ${locked?`<div class="meta"><img src="${MA}lock.svg" alt="">กำลังแก้ไขโดย ${r.lockedBy}</div>`:''}</div>
    <div class="acts">${acts}</div>
  </div>`;
}
// Document and Infographic tabs live in maker-library.js

/* ---------- Create / edit form ---------- */
const blankDoc = () => ({status:'', dtype:'', url:'', name:'', open:true, rows:[]});
const blankSection = () => ({title:'', open:true, docs:[blankDoc()]});
function newForm(){
  return {rowId:null, ref:`690909-D00${MK.seq++}`, mstatus:'draft', pubMode:'next', pubDate:'', groups:[GROUP_LOCKED], type:'', start:'', end:'',
    title:'', contacts:[{unit:'', tel:''}], summary:'', sections:[blankSection()], uploads:[], tab:'summary', savedAt:clock(), showErr:false, dirty:false, groupMenu:false};
}
function formFromRow(r){
  if (r._form && !r.aid) return {...JSON.parse(JSON.stringify(r._form)), uploads:r._form.uploads.map(u=>({...u})), rowId:r.id, ref:r.ref, mstatus:r.mstatus, showErr:false, dirty:false, groupMenu:false};
  const v = rv(r), a = art(r), f = newForm(); MK.seq--;
  Object.assign(f, {rowId:r.id, ref:r.ref, mstatus:r.mstatus, type:v.type, start:v.start, end:v.end, title:v.title,
    groups:[GROUP_LOCKED, 'สาขา: บริหารภาพรวม', 'สาขา: บริการลูกค้า'], pubMode:r.sched?'custom':'next', pubDate:r.sched||''});
  if (a){
    f.summary = a.summary; f.contacts = a.contacts.map(c=>({...c}));
    f.sections = a.groups.map(g => ({title:g.group, open:true, docs:g.docs.map(d => ({status:'เหมือนเดิม', dtype:guessType(d.name), url:docUrl(d.name), name:d.name, open:true, rows:(d.rows||[]).map(x=>({...x}))}))}));
    f.uploads = (a.images||[]).map((src,i) => ({name: i ? `${a.igName.replace(/\.\w+$/,'')} (${i+1}).jpg` : a.igName, src: src.includes('/')?src:A+src, status:'เหมือนเดิม', source:'เรื่องเด่นเรื่องเด็ด', updated:'26/06/2569'}));
  } else f.contacts = [{unit:'ฝ่าย Non-Retail Banking and Internal Regulations', tel:'02-208-3877'}];
  return f;
}
const getP = (o,p) => p.split('.').reduce((x,k)=>x?.[k], o);
const setP = (o,p,v) => { const ks = p.split('.'), last = ks.pop(); ks.reduce((x,k)=>x[k], o)[last] = v; };

function validate(f){
  const e = {}, dateOk = s => !!parseBE(s);
  if (f.pubMode==='custom'){ if (!dateOk(f.pubDate)) e.pubDate='กรุณาเลือกวันที่เผยแพร่'; else if (parseBE(f.pubDate) < parseBE(TODAY)) e.pubDate='วันที่เผยแพร่ต้องไม่ย้อนหลัง'; }
  if (!f.type) e.type = 'กรุณาเลือกประเภทประกาศ';
  if (!dateOk(f.start)) e.start = 'กรุณาเลือกวันที่เริ่มต้น';
  if (f.end && (!dateOk(f.end) || (dateOk(f.start) && parseBE(f.end) < parseBE(f.start)))) e.end = 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น';
  if (!f.title.trim()) e.title = 'กรุณากรอกหัวข้อประกาศ'; else if (f.title.length>250) e.title = 'ความยาวเกิน 250 ตัวอักษร';
  if (f.summary.length>500) e.summary = 'ความยาวเกิน 500 ตัวอักษร';
  f.contacts.forEach((c,i) => { if (!c.unit.trim()) e[`contacts.${i}.unit`]='กรุณากรอกทีม/ หน่วยงาน'; if (!c.tel.trim()) e[`contacts.${i}.tel`]='กรุณากรอกข้อมูลการติดต่อ'; });
  f.sections.forEach((s,i) => {
    if (!s.title.trim()) e[`sections.${i}.title`] = 'กรุณากรอกหัวข้อเซ็กชั่น';
    s.docs.forEach((d,j) => { const p = `sections.${i}.docs.${j}`;
      if (!d.status) e[p+'.status']='กรุณาเลือก'; if (!d.dtype) e[p+'.dtype']='กรุณาเลือก';
      if (!d.url.trim()) e[p+'.url']='กรุณากรอก Intranet URL'; else if (!/^https?:\/\/[^\s]*intranet/i.test(d.url)) e[p+'.url']='ต้องเป็นลิงก์ Intranet ของธนาคาร';
      if (!d.name.trim() && !e[p+'.url']) e[p+'.name']='กดไอคอนค้นหาเพื่อดึงชื่อเอกสาร';
    });
  });
  f.uploads.forEach((u,i) => { if (!u.source) e[`uploads.${i}.source`]='กรุณาเลือกแหล่งที่มา'; });
  return e;
}
const pubDateOf = f => f.pubMode==='custom' && f.pubDate ? f.pubDate : TOMORROW;
function fld(path, inner, {cnt, cls=''}={}){
  const err = M.form.showErr && M.form._e[path];
  const over = cnt && getP(M.form,path).length > cnt;
  return `<div class="fld${cnt?' withcnt':''}${err?' err':''}${over?' over':''} ${cls}" data-fp="${path}">${inner}${cnt?`<span class="cnt" data-cnt="${path}">${pad(getP(M.form,path).length)} /${cnt}</span>`:''}<div class="emsg">${err||''}</div></div>`;
}
const inp = (path, ph='กรอกข้อมูล', extra='') => `<input class="fin" data-f="${path}" value="${esc(getP(M.form,path)||'')}" placeholder="${ph}" ${extra}>`;
const fsel = (path, list, ph='เลือกข้อมูล') => `<label class="sel"><select data-f="${path}"><option value="">${ph}</option>${opts(list, getP(M.form,path))}</select><img src="${MA}chev-down.svg" alt=""></label>`;
const date = (path, off=false, sm=false) => `<div class="dt${off?' off':''}${sm?' sm':''}"><input class="txt" data-f="${path}" value="${esc(getP(M.form,path)||'')}" placeholder="วว/ดด/ปปปป" ${off?'disabled':''}><button type="button" data-pick="${path}" ${off?'disabled':''}><img src="${MA}calendar.svg" alt=""></button></div>`;
const L = (t, req, tip) => `<span class="lab">${t}${req?'<i>*</i>':''}${tip?`<i class="tip" data-tip="${esc(tip)}">i</i>`:''}</span>`;

function vForm(){
  const f = M.form; f._e = validate(f);
  const valid = !Object.keys(f._e).length, edit = f.mstatus==='published';
  const stTag = `<span class="st ${f.mstatus}">${STATUS_LABEL[f.mstatus]}</span>`;
  const chips = f.groups.map(g => g===GROUP_LOCKED ? `<span class="chipx lock">${g}</span>` : `<span class="chipx">${g}<button type="button" data-ungroup="${esc(g)}">✕</button></span>`).join('');
  const menu = f.groupMenu ? `<div class="ms-menu">${GROUPS.map(g=>`<label><input type="checkbox" data-group="${esc(g)}" ${f.groups.includes(g)?'checked':''}>${g}</label>`).join('')}</div>` : '';
  return `<div class="m-wrap">
    <div class="crumb"><div><button data-m="leave">ประกาศ</button> › <b>${edit?'แก้ไขประกาศ':'สร้างประกาศ'} (${f.ref})</b></div><span class="auto"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></svg>บันทึกอัตโนมัติ (${f.savedAt})</span></div>
    <div class="m-head" style="margin-bottom:0"><div><h1>${edit?'แก้ไขประกาศ':'สร้างประกาศ'}</h1><p>สร้างหรืออัปเดตข้อมูลประกาศเพื่อแสดงใน Morning Spark</p></div></div>

    <div class="fcard"><div class="fh">ข้อมูลประกาศ<div class="r">${stTag}${f.ref}</div></div>
      <div class="fbody">
        <div class="fbox">
          <div>${L('วันที่เผยแพร่',1)}
            <label class="radio"><input type="radio" name="pubMode" data-f="pubMode" value="next" ${f.pubMode==='next'?'checked':''}>เผยแพร่วันถัดไป <span class="g">(${TOMORROW} เวลา 06:00 น.)</span></label>
            <div style="display:flex;align-items:center;gap:12px"><label class="radio"><input type="radio" name="pubMode" data-f="pubMode" value="custom" ${f.pubMode==='custom'?'checked':''}>กำหนดวันที่เผยแพร่</label>
              ${fld('pubDate', date('pubDate', f.pubMode!=='custom', true))}</div></div>
          <div>${L('กลุ่มผู้รับ',1)}<div class="fld" style="position:relative"><div class="ms-box" data-m="groups">${chips}<img src="${MA}chev-down.svg" alt=""></div>${menu}</div></div>
        </div>
        <div class="row3">
          <div>${L('ประเภทประกาศ',1)}${fld('type', fsel('type',[['product','ผลิตภัณฑ์'],['practice','ข้อปฏิบัติ']]))}</div>
          <div>${L('เริ่มใช้ (วันที่เริ่มต้น)',1)}${fld('start', date('start'))}</div><span class="dash">–</span>
          <div>${L('(วันที่สิ้นสุด)')}${fld('end', date('end', !f.start))}</div>
        </div>
        <div>${L('หัวข้อประกาศ',1)}${fld('title', inp('title'), {cnt:250})}</div>
        <div class="sub">ข้อมูลสำหรับสอบถามข้อมูลเพิ่มเติม</div>
        <div class="crow"><span>${L('ทีม/ หน่วยงาน',1)}</span><span>${L('ข้อมูลการติดต่อ',1)}</span><span></span></div>
        ${f.contacts.map((c,i)=>`<div class="crow" style="margin-top:-8px">${fld(`contacts.${i}.unit`, inp(`contacts.${i}.unit`))}${fld(`contacts.${i}.tel`, inp(`contacts.${i}.tel`,'เช่น 02-208-3879, example@email.com'))}
          <button class="tbtn" data-rmcontact="${i}" ${f.contacts.length<2?'disabled':''} data-tip="ลบ"><img src="${MA}trash.svg" alt=""></button></div>`).join('')}
        <button class="addl" data-m="addcontact"><img src="${MA}plus.svg" alt="">เพิ่มข้อมูลติดต่อ</button>
      </div></div>

    <div class="fcard"><div class="ftabs" style="margin-top:12px">
        <button class="m-tab${f.tab==='summary'?' on':''}" data-ftab="summary"><img src="${A}icon-doc-tab-active.svg" alt="">ข้อมูลสรุป</button>
        <button class="m-tab${f.tab==='images'?' on':''}" data-ftab="images"><img src="${A}icon-photo-tab.svg" alt="">ข้อมูลรูปภาพ${f.uploads.length?` (${f.uploads.length})`:''}</button></div>
      <div class="fbody">${f.tab==='summary' ? vSummaryTab(f) : vImagesTab(f)}</div></div>
  </div>
  <div class="ftr"><button class="btn link" data-m="leave">ยกเลิก</button>
    <div class="r"><small>${edit?'อัปเดตทันทีเมื่อกดบันทึก':'เผยแพร่วันที่ '+pubDateOf(f)+' เวลา 06:00 น.'}</small>
      <div><button class="btn sec" data-m="preview"><img src="${MA}eye.svg" alt="">ดูตัวอย่าง</button>
      ${edit?'':`<button class="btn sec" data-m="draft"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e87cb" stroke-width="2"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/></svg>บันทึกร่าง</button>`}
      <button class="btn pri${valid?'':' off'}" data-m="publish" id="m-pub"><img src="${MA}megaphone-fill.svg" alt="">${edit?'บันทึกการแก้ไข':'เผยแพร่ประกาศ'}</button></div></div></div>`;
}
function vSummaryTab(f){
  return `<div>${L('สรุปประกาศ')}${fld('summary', `<textarea class="fin" data-f="summary" placeholder="สรุปการเปลี่ยนแปลงโดยรวม เพื่อแสดงให้ผู้รับเห็นเป็นอย่างแรก">${esc(f.summary)}</textarea>`, {cnt:500})}</div>
    ${f.sections.map((s,i)=>{ const P=`sections.${i}`; return `<div class="sec${s.open?'':' closed'}" data-si="${i}">
      <div class="sh">${GRIP}
        หัวข้อเซ็กชั่น <i style="color:#ffd0cf;font-style:normal">*</i>${fld(P+'.title', inp(P+'.title','เช่น ตรวจสอบข้อมูล, ยืนยันตัวตน'))}
        <button class="btn" data-rmsec="${i}" ${f.sections.length<2?'disabled':''}><img src="${MA}trash.svg" alt="">ลบเซ็กชั่น</button>
        <button class="acc" data-togsec="${i}"><img src="${A}icon-chevron-up.svg" alt=""></button></div>
      <div class="sb">${s.docs.map((d,j)=>{ const D=`${P}.docs.${j}`; return `<div class="dblk${d.open?'':' closed'}" data-di="${j}">
          <div class="drow"><span></span>${L('สถานะเอกสาร',1)}${L('ประเภทเอกสาร',1)}${L('Intranet URL',1,'วางลิงก์เอกสารจาก Intranet แล้วกดไอคอนค้นหาเพื่อดึงชื่อเอกสาร')}${L('ชื่อเอกสาร',1,'ระบบดึงชื่อเอกสารจาก Intranet ให้อัตโนมัติ')}<span></span><span></span></div>
          <div class="drow" style="margin-top:-6px">${GRIP}
            ${fld(D+'.status', fsel(D+'.status', DOC_STATUS))}${fld(D+'.dtype', fsel(D+'.dtype', DOC_TYPES))}
            ${fld(D+'.url', `<div class="urlbox">${inp(D+'.url','https://intranet.krungthai/...')}<button type="button" data-fetch="${D}" data-tip="ดึงชื่อเอกสาร"><img src="${A}icon-search.svg" alt=""></button></div>`)}
            ${fld(D+'.name', inp(D+'.name','ชื่อเอกสาร','disabled'))}
            <button class="tbtn" data-rmdoc="${i}:${j}" ${s.docs.length<2?'disabled':''} data-tip="ลบเอกสาร"><img src="${MA}trash.svg" alt=""></button>
            <button class="acc" data-togdoc="${i}:${j}"><img src="${A}icon-chevron-up.svg" alt=""></button></div>
          <div class="dets">${d.rows.map((r,k)=>`<div class="det" data-ri="${k}">${GRIP}
              <input class="fin" data-f="${D}.rows.${k}.ref" value="${esc(r.ref)}" placeholder="อ้างอิง เช่น หน้า 12 | หมวด 1 | ข้อ 1.3">
              <input class="fin" data-f="${D}.rows.${k}.detail" value="${esc(r.detail)}" placeholder="รายละเอียด / สาระสำคัญ">
              <input class="fin" data-f="${D}.rows.${k}.note" value="${esc(r.note)}" placeholder="สิ่งที่เปลี่ยนแปลง (ถ้ามี)">
              <button class="tbtn" data-rmrow="${i}:${j}:${k}" data-tip="ลบรายละเอียด"><img src="${MA}trash.svg" alt=""></button></div>`).join('')}</div>
          <button class="addl" data-addrow="${i}:${j}"><img src="${MA}plus.svg" alt="">เพิ่มรายละเอียด</button>
        </div>`; }).join('')}
        <div class="addbox"><button class="btn sec" data-adddoc="${i}" style="height:36px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e87cb" stroke-width="2"><path d="M6 2h9l5 5v15H6z"/><path d="M12 11v6M9 14h6"/></svg>เพิ่มเอกสาร</button></div>
      </div></div>`; }).join('')}
    <button class="btn pri" data-m="addsec" style="align-self:flex-start"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>เพิ่มหัวข้อเซ็กชั่น</button>`;
}
function vImagesTab(f){
  return `<div class="info"><span class="d">i</span>ระบบสามารถระบุแหล่งที่มาของไฟล์ได้อัตโนมัติหากพบอยู่ในชื่อไฟล์ที่อัปโหลด โดยชื่อไฟล์ต้องมีความยาวไม่เกิน 80 ตัวอักษร</div>
    <div>${L('อัปโหลดรูปภาพ')}<div class="drop" id="m-drop">${UPLOAD_SVG}<div>เลือก หรือลากไฟล์ที่นี่</div><small>ประเภทไฟล์ที่รองรับ: jpg, png | ขนาดไฟล์ไม่เกิน 10 MB | มีได้สูงสุด 30 ไฟล์</small>
      <button class="btn pri" data-m="upload">อัปโหลดไฟล์</button><button class="addl" data-m="sample" style="align-self:center;font-weight:500;font-size:13px">หรือใช้รูปตัวอย่าง</button>
      <input type="file" id="m-file" accept="image/png,image/jpeg" multiple hidden></div></div>
    <div style="color:var(--gray-fg-mid)">จำนวนไฟล์ ${f.uploads.length} รายการ</div>
    <div class="utbl"><div class="ur thd"><span></span><span>สถานะรูปภาพ <i style="color:var(--error-fg-high);font-style:normal">*</i></span><span>แหล่งที่มา <i style="color:var(--error-fg-high);font-style:normal">*</i></span><span>ชื่อไฟล์</span><span>อัปเดตล่าสุด</span><span>การจัดการ</span></div>
      ${f.uploads.length ? f.uploads.map((u,i)=>`<div class="ur"><img class="thumb" src="${u.src}" alt="">
        ${fsel(`uploads.${i}.status`, DOC_STATUS.slice(0,3).concat('เหมือนเดิม'), 'เลือก')}
        ${fld(`uploads.${i}.source`, fsel(`uploads.${i}.source`, IMG_SOURCES, 'เลือกแหล่งที่มา'))}
        <span class="fn" title="${esc(u.name)}">${esc(u.name)}</span><span>${u.updated}</span>
        <button class="tbtn" data-rmup="${i}" data-tip="ลบ"><img src="${MA}trash.svg" alt=""></button></div>`).join('')
        : `<div class="m-empty"><b>ยังไม่มีข้อมูลในส่วนนี้</b>กรุณาอัปโหลดไฟล์เพื่อแสดงข้อมูล</div>`}</div>`;
}

/* ---------- Modals & preview ---------- */
function vModal(){
  const m = M.modal; if (!m) return '';
  const x = `<button data-m="close"><img src="${MA}b-close.svg" alt=""></button>`;
  let h = '';
  if (m.kind==='report') h = `<div class="m-mod w"><h3><span><img src="${MA}download.svg" alt="">ดาวน์โหลดรายงาน</span>${x}</h3>
      ${['created','published'].map((k,i)=>`${i?'<hr>':''}<label class="chk"><input type="checkbox" data-rep="${k}" ${m[k]?'checked':''}>${k==='created'?'วันที่สร้าง':'วันที่เผยแพร่'}</label>
        <div>${L('ระยะเวลา (เริ่มต้น-สิ้นสุด)',1)}<div class="rng">${repDate(k+'From', !m[k])}<span>–</span>${repDate(k+'To', !m[k])}</div></div>`).join('')}
      <div class="ft"><button class="btn out" data-m="close">ยกเลิก</button><button class="btn pri" data-m="dlreport">ดาวน์โหลด</button></div></div>`;
  if (m.kind==='logout') h = confirmBox('ออกจากระบบ', 'ต้องการออกจากระบบ Morning Spark ใช่หรือไม่?', 'ออกจากระบบ', 'dologout');
  if (m.kind==='leave') h = confirmBox('ออกจากหน้านี้?', 'ข้อมูลที่ยังไม่ได้บันทึกจะหายไป คุณต้องการออกจากหน้านี้ใช่หรือไม่?', 'ออกจากหน้านี้', 'doleave', true);
  if (m.kind==='recall') h = confirmBox('เรียกคืนประกาศ', `ประกาศ “${esc(rv(m.row).title)}” จะแสดงสถานะ <b style="color:var(--error-fg-high)">ยกเลิกใช้ ${TODAY}</b> ให้ผู้รับทุกกลุ่มเห็นทันที`, 'เรียกคืนประกาศ', 'dorecall', true);
  if (m.kind==='delete') h = confirmBox('ลบฉบับร่าง', `ต้องการลบ “${esc(rv(m.row).title)}” ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`, 'ลบ', 'dodelete', true);
  if (m.kind==='rmsec') h = confirmBox('ลบเซ็กชั่น', 'เอกสารและรายละเอียดทั้งหมดในเซ็กชั่นนี้จะถูกลบด้วย ต้องการลบใช่หรือไม่?', 'ลบเซ็กชั่น', 'dormsec', true);
  if (m.kind==='notify') h = `<div class="m-mod w"><h3><span>บันทึกการแก้ไข</span>${x}</h3><p>ต้องการแจ้งเตือนผู้รับเกี่ยวกับการแก้ไขครั้งนี้หรือไม่?</p>
      <label class="opt"><input type="radio" name="notify" value="1" ${m.notify?'checked':''} data-notify="1"><div><b>แจ้งเตือนผู้รับ</b><small>ประกาศจะกลับมาเป็น “ยังไม่อ่าน” พร้อมป้าย อัปเดต ใน Widget และหน้า Home feed</small></div></label>
      <label class="opt"><input type="radio" name="notify" value="0" ${m.notify?'':'checked'} data-notify="0"><div><b>ไม่แจ้งเตือน</b><small>สำหรับการแก้ไขเล็กน้อย เช่น แก้คำผิด ผู้รับจะเห็นเนื้อหาใหม่โดยไม่มีการแจ้งเตือน</small></div></label>
      <div class="ft"><button class="btn out" data-m="close">ยกเลิก</button><button class="btn pri" data-m="dosaveedit">บันทึก</button></div></div>`;
  if (m.kind==='published') h = `<div class="m-mod w"><div class="okic">✓</div><h3 style="justify-content:center">ตั้งเวลาเผยแพร่แล้ว</h3>
      <p style="text-align:center">“${esc(m.title)}” จะส่งถึงผู้รับ ${m.groups} กลุ่ม ในวันที่ <b>${m.date}</b> เวลา 06:00 น.</p>
      <div class="ft" style="justify-content:center"><button class="btn out" data-m="close">กลับหน้ารายการ</button><button class="btn pri" data-m="deliver">จำลองการส่งตอน 06:00 น.</button></div></div>`;
  if (!h) h = libModal(m);
  return `<div class="m-ov">${h}</div>`;
}
const confirmBox = (t, p, ok, act, danger) => `<div class="m-mod"><h3><span>${t}</span><button data-m="close"><img src="${MA}b-close.svg" alt=""></button></h3><p>${p}</p>
  <div class="ft"><button class="btn out" data-m="close">ยกเลิก</button><button class="btn ${danger?'danger':'pri'}" data-m="${act}">${ok}</button></div></div>`;
const repDate = (k, off) => `<div class="dt${off?' off':''}"><input class="txt" data-rd="${k}" value="${esc(M.modal[k]||'')}" placeholder="วว/ดด/ปปปป" ${off?'disabled':''}><button type="button" data-pickr="${k}" ${off?'disabled':''}><img src="${MA}calendar.svg" alt=""></button></div>`;

function toArticle(f, base){
  const imgs = f.uploads.filter(u => u.status!=='ยกเลิก').map(u => u.src);
  return {id: base?.id ?? Math.max(...ARTICLES.map(a=>a.id))+1, imp: base?.imp||false, read:false, type:f.type,
    status: base?.status||null, cancel: base?.cancel, date: (base?'อัปเดต ':'ประกาศ ') + (base?TODAY:pubDateOf(f)),
    eff: 'เริ่มใช้ ' + f.start + (f.end?' - '+f.end:''), title:f.title.trim(), ex:f.summary.slice(0,180), summary:f.summary,
    groups: f.sections.map(s => ({group:s.title, docs:s.docs.map(d => ({name:d.name||d.url, rows: d.rows.length ? d.rows.map(r=>({ref:r.ref||'-', detail:r.detail||'-', note:r.note||'-'})) : undefined}))})),
    contacts: f.contacts.map(c=>({...c})), igName: f.uploads[0]?.name || base?.igName || '',
    images: imgs.length ? imgs : undefined, posters: imgs.length ? undefined : (base?.posters||[])};
}
function vPreview(){
  const p = M.prev; if (!p) return '';
  const keep = {article:state.article, tab:state.tab, img:state.img};
  Object.assign(state, {article:p.article, tab:p.tab, img:p.img});
  const html = vDetail();
  Object.assign(state, keep);
  return `<div class="m-prev"><div class="pbar"><span>ตัวอย่างมุมมองผู้รับ (Read-only) — ${esc(M.form.ref)}</span><button class="btn out" data-m="closeprev">ปิดตัวอย่าง</button></div><div class="pbody">${html}</div></div>`;
}

/* ---------- Sync with Receiver ---------- */
function refreshReceiver(){
  renderWidget(); updateTaskbar?.();
  const app = $('#app');
  if (app && !app.classList.contains('hidden') && state.screen!=='login'){
    if (state.screen==='detail' && !ARTICLES.includes(state.article)) go('feed'); else render();
  }
}
const nowStamp = () => `${TODAY} ${clock()}`;
function touch(row){ row.updatedBy = ME; row.updated = nowStamp(); row.ts = 100 + Date.now()/1e13; }

/* ---------- Events ---------- */
function mClick(e){
  e.stopPropagation();
  const dtIn = e.target.closest('.dt input.txt:not(:disabled)');
  if (dtIn && !dp) return dtIn.parentElement.querySelector('button').click();
  const t = e.target.closest('button,[data-edit],[data-m],[data-libdoc],[data-libpreview]');
  if (libClick(e, t)) return;
  if (!t) { closeMenus(e); return; }
  const d = t.dataset, f = M.form;
  if (d.mwin==='min'){ $('#maker').classList.add('hidden'); return updateTaskbar(); }
  if (d.mwin==='max') return $('#maker').classList.toggle('max');
  if (d.mwin==='close'){ $('#maker').remove(); return updateTaskbar(); }
  // preview interactions reuse the Receiver's detail controls
  if (M.prev && t.closest('.m-prev')){
    if (d.tab){ M.prev.tab = d.tab; M.prev.img = 0; } else if (d.img){ M.prev.img = d.img==='prev'?M.prev.img-1:d.img==='next'?M.prev.img+1:+d.img; }
    else if (t.classList.contains('acc')) return t.closest('.doc').classList.toggle('closed');
    else if (d.doc) return toast(`เปิดเอกสาร “${d.doc}”`);
    else if (d.m!=='closeprev') return;
    if (d.m==='closeprev') M.prev = null;
    return rerender();
  }
  if (d.m==='eye'){ const p=$('#m-pw'); p.type = p.type==='password'?'text':'password'; return; }
  if (d.m==='side'){ M.side = !M.side; return rerender(); }
  if (d.m==='home') return f?.dirty ? (M.modal={kind:'leave'}, rerender()) : (M.view='list', M.form=null, mRender());
  if (d.m==='logout'){ M.modal = {kind:'logout'}; return rerender(); }
  if (d.m==='dologout'){ Object.assign(M, {loggedIn:false, view:'login', modal:null, form:null}); return mRender(); }
  if (d.m==='close'){ M.modal = null; return rerender(); }
  if (d.mtab){ M.tab = d.mtab; M.q = M.qInput = ''; LIB.menu = null; return mRender(); }
  if (d.m==='clear'){ Object.assign(M, {q:'', qInput:'', onlyUpd:false, type:'all', author:'all', status:'all', page:1}); return mRender(); }
  if (d.sort){ M.sort = {key:d.sort, dir: M.sort.key===d.sort ? -M.sort.dir : -1}; return rerender(); }
  if (d.mpage){ const pages = Math.max(1, Math.ceil(filteredRows().length/M.per)); M.page = d.mpage==='prev'?Math.max(1,M.page-1):d.mpage==='next'?Math.min(pages,M.page+1):+d.mpage; return rerender(); }
  if (d.openKey){ M.open[d.openKey] = !M.open[d.openKey]; return t.closest('.dcard').classList.toggle('closed'); }
  if (d.m==='report'){ M.modal = {kind:'report', created:true, published:false, createdFrom:'01/07/2569', createdTo:TODAY}; return rerender(); }
  if (d.m==='dlreport'){
    const m = M.modal, ok = ['created','published'].filter(k => m[k]);
    if (!ok.length) return toast('กรุณาเลือกอย่างน้อย 1 เงื่อนไข');
    if (ok.some(k => !parseBE(m[k+'From']) || !parseBE(m[k+'To']))) return toast('กรุณาระบุช่วงวันที่ให้ครบ');
    M.modal = null; rerender(); return toast('ดาวน์โหลด MorningSpark_Report.xlsx แล้ว');
  }
  if (d.pickr){ const k = d.pickr; return openDP(t.closest('.dt'), M.modal[k], v => { M.modal[k] = v; rerender(); }); }
  if (d.edit){ const r = MK.rows.find(x=>x.id===d.edit); if (r.lockedBy) return toast(`กำลังแก้ไขโดย ${r.lockedBy}`); M.form = formFromRow(r); M.view = 'form'; return mRender(); }
  if (d.recall){ M.modal = {kind:'recall', row:MK.rows.find(x=>x.id===d.recall)}; return rerender(); }
  if (d.del){ M.modal = {kind:'delete', row:MK.rows.find(x=>x.id===d.del)}; return rerender(); }
  if (d.m==='dorecall'){
    const r = M.modal.row, a = art(r); r.mstatus = 'recalled'; touch(r);
    if (a) Object.assign(a, {status:'cancel', cancel:TODAY, read:false, date:'อัปเดต '+TODAY});
    M.modal = null; mRender(); refreshReceiver(); return toast('เรียกคืนประกาศแล้ว ผู้รับจะเห็นสถานะ ยกเลิกใช้');
  }
  if (d.m==='dodelete'){ MK.rows = MK.rows.filter(x=>x!==M.modal.row); M.modal = null; mRender(); return toast('ลบฉบับร่างแล้ว'); }
  if (d.m==='create'){ M.form = newForm(); M.view = 'form'; return mRender(); }

  // ---- form ----
  if (!f) return;
  const ix = s => s.split(':').map(Number);
  const changed = () => { f.dirty = true; f.savedAt = clock(); rerender(); };
  if (d.m==='leave') { if (f.dirty){ M.modal = {kind:'leave'}; return rerender(); } M.view='list'; M.form=null; return mRender(); }
  if (d.m==='doleave'){ M.modal = null; M.view = 'list'; M.form = null; return mRender(); }
  if (d.m==='groups'){ f.groupMenu = !f.groupMenu; return rerender(); }
  if (d.ungroup){ f.groups = f.groups.filter(g=>g!==d.ungroup); return changed(); }
  if (d.pick){ const p = d.pick; return openDP(t.closest('.dt'), getP(f,p), v => { setP(f,p,v); f.dirty = true; f.savedAt = clock(); rerender(); },
    {min: p==='pubDate' ? TODAY : p==='end' ? f.start : undefined}); }
  if (d.ftab){ f.tab = d.ftab; return rerender(); }
  if (d.m==='addcontact'){ f.contacts.push({unit:'', tel:''}); return changed(); }
  if (d.rmcontact){ f.contacts.splice(+d.rmcontact,1); return changed(); }
  if (d.m==='addsec'){ f.sections.push(blankSection()); return changed(); }
  if (d.rmsec){ M.modal = {kind:'rmsec', i:+d.rmsec}; return rerender(); }
  if (d.m==='dormsec'){ f.sections.splice(M.modal.i,1); M.modal = null; return changed(); }
  if (d.togsec){ const s = f.sections[+d.togsec]; s.open = !s.open; return rerender(); }
  if (d.mvsec){ const [i,dir] = ix(d.mvsec); const s = f.sections; [s[i], s[i+dir]] = [s[i+dir], s[i]]; return changed(); }
  if (d.adddoc){ f.sections[+d.adddoc].docs.push(blankDoc()); return changed(); }
  if (d.rmdoc){ const [i,j] = ix(d.rmdoc); f.sections[i].docs.splice(j,1); return changed(); }
  if (d.togdoc){ const [i,j] = ix(d.togdoc); const x = f.sections[i].docs[j]; x.open = !x.open; return rerender(); }
  if (d.mvdoc){ const [i,j,dir] = ix(d.mvdoc); const s = f.sections[i].docs; [s[j], s[j+dir]] = [s[j+dir], s[j]]; return changed(); }
  if (d.addrow){ const [i,j] = ix(d.addrow); f.sections[i].docs[j].rows.push({ref:'', detail:'', note:''}); return changed(); }
  if (d.rmrow){ const [i,j,k] = ix(d.rmrow); f.sections[i].docs[j].rows.splice(k,1); return changed(); }
  if (d.fetch){ const doc = getP(f, d.fetch); if (!/^https?:\/\/[^\s]*intranet/i.test(doc.url)) { f.showErr = true; return rerender(); }
    const seg = decodeURIComponent(doc.url.split(/[/?#]/).filter(Boolean).pop() || '');
    if (!/\.\w{2,5}$/.test(seg)){ M.modal = {kind:'nameMissing', path:d.fetch, val:'', err:''}; return rerender(); }
    doc.name = seg.replace(/\.\w+$/,'').replace(/[_-]+/g,' ');
    if (!doc.dtype) doc.dtype = guessType(doc.name); toast('ดึงชื่อเอกสารจาก Intranet แล้ว'); return changed(); }
  if (d.m==='upload') return $('#m-file').click();
  if (d.m==='sample'){ addUploads(['info-1.png','info-2.png','info-4.png'].map((n,i)=>({name:i?`NRR พาให้รู้ Issue 36 (${i}).jpg`:'เรื่องเด่นเรื่องเด็ด 197-แนวทาง FATCA CRS.jpg', src:A+n}))); return; }
  if (d.rmup){ f.uploads.splice(+d.rmup,1); return changed(); }
  if (d.m==='preview'){ const row = MK.rows.find(x=>x.id===f.rowId); const a = toArticle(f, row && art(row)); if (!a.title) a.title = '(ยังไม่มีหัวข้อประกาศ)';
    M.prev = {article:a, tab:'summary', img:0}; return rerender(); }
  if (d.m==='draft'){ saveRow('draft'); f.dirty = false; f.savedAt = clock(); rerender(); return toast('บันทึกร่างแล้ว'); }
  if (d.m==='publish'){
    if (Object.keys(validate(f)).length){ f.showErr = true; rerender(); toast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      setTimeout(()=>$('#maker .fld.err')?.scrollIntoView({behavior:'smooth', block:'center'}), 30); return; }
    const row = MK.rows.find(x=>x.id===f.rowId);
    if (row && row.mstatus==='published'){ M.modal = {kind:'notify', notify:true}; return rerender(); }
    const r = saveRow('scheduled'); r.sched = pubDateOf(f); r.ref = r.ref.replace('-D','-');
    M.modal = {kind:'published', row:r, title:f.title, date:r.sched, groups:f.groups.length}; M.view = 'list'; M.form = null; return mRender();
  }
  if (d.m==='dosaveedit'){
    const row = MK.rows.find(x=>x.id===f.rowId), a = art(row), n = toArticle(f, a), notify = M.modal.notify;
    if (a) Object.assign(a, n, notify ? {read:false, status: a.status==='cancel'?'cancel':'update'} : {read:a.read, date:a.date});
    else { ARTICLES.unshift(n); row.aid = n.id; }
    touch(row); M.modal = null; M.view = 'list'; M.form = null; mRender(); refreshReceiver();
    return toast(notify ? 'บันทึกแล้ว และแจ้งเตือนผู้รับเรียบร้อย' : 'บันทึกแล้ว (ไม่แจ้งเตือนผู้รับ)');
  }
  closeMenus(e);
}
function closeMenus(e){ if (M.form?.groupMenu && !e.target.closest('.ms-menu,.ms-box')){ M.form.groupMenu = false; rerender(); } }
function mDeliver(){
  const m = M.modal, r = m.row, a = toArticle(r._form, null);
  a.date = 'ประกาศ ' + r.sched; ARTICLES.unshift(a); r.aid = a.id; r.mstatus = 'published'; r.sched = null; delete r._form; touch(r);
  M.modal = null; mRender(); refreshReceiver(); focusWin(widget());
  toast('06:00 น. — ประกาศถึงผู้รับแล้ว ดูได้ที่ Widget บนเดสก์ท็อป');
}
function saveRow(mstatus){
  const f = M.form; let r = MK.rows.find(x=>x.id===f.rowId);
  if (!r){ r = {id:'n'+Date.now(), ref:f.ref, createdBy:ME, created:nowStamp()}; MK.rows.push(r); f.rowId = r.id; }
  Object.assign(r, {type:f.type||'practice', title:f.title||'(ยังไม่มีหัวข้อประกาศ)', start:f.start, end:f.end, mstatus, _form:JSON.parse(JSON.stringify(f))});
  r._form.uploads = f.uploads; touch(r); return r;
}
function addUploads(list){
  const f = M.form, room = 30 - f.uploads.length;
  if (list.length > room) toast('อัปโหลดได้สูงสุด 30 ไฟล์');
  list.slice(0, room).forEach(u => {
    if (u.name.length > 80) return toast(`ชื่อไฟล์ “${u.name.slice(0,20)}…” ยาวเกิน 80 ตัวอักษร`);
    const source = IMG_SOURCES.find(s => u.name.includes(s.split(' ')[0])) || '';
    f.uploads.push({name:u.name, src:u.src, status:'ใหม่', source, updated:TODAY});
  });
  f.dirty = true; f.savedAt = clock(); rerender();
}
function mInput(e){
  if (libInput(e)) return;
  const t = e.target;
  if (t.id==='m-q'){ M.qInput = t.value; return; }
  if (t.dataset.rd){ M.modal[t.dataset.rd] = t.value; return; }
  const p = t.dataset.f; if (!p || !M.form) return;
  if (t.type==='radio') return;
  setP(M.form, p, t.value); M.form.dirty = true; M.form.savedAt = clock();
  const c = document.querySelector(`[data-cnt="${p}"]`);
  if (c){ const max = +c.textContent.split('/')[1]; c.textContent = `${pad(t.value.length)} /${max}`; c.parentElement.classList.toggle('over', t.value.length>max); }
  if (/\.url$/.test(p)) setP(M.form, p.replace(/url$/,'name'), '');
  const pub = $('#m-pub'); if (pub) pub.classList.toggle('off', Object.keys(validate(M.form)).length>0);
  const auto = $('#maker .crumb .auto'); if (auto) auto.lastChild.textContent = `บันทึกอัตโนมัติ (${M.form.savedAt})`;
  if (M.form.showErr){ const fe = t.closest('.fld'); if (fe && !validate(M.form)[fe.dataset.fp]) fe.classList.remove('err'); }
}
function mChange(e){
  if (libChange(e)) return;
  const t = e.target, d = t.dataset;
  if (d.mf){ if (d.mf==='onlyUpd') M.onlyUpd = t.checked; else if (d.mf==='per') M.per = +t.value; else M[d.mf] = t.value; M.page = 1; return rerender(); }
  if (d.rep){ M.modal[d.rep] = t.checked; return rerender(); }
  if (d.rdate){ if (t.value){ M.modal[d.rdate] = toBE(new Date(t.value)); rerender(); } return; }
  if (d.notify!==undefined){ M.modal.notify = d.notify==='1'; return; }
  if (t.id==='m-file'){ addUploads([...t.files].filter(f => /image\/(png|jpe?g)/.test(f.type) && f.size <= 10*1024*1024).map(f => ({name:f.name, src:URL.createObjectURL(f)}))); return; }
  if (!M.form) return;
  if (d.group){ const f = M.form; f.groups = t.checked ? [...f.groups, d.group] : f.groups.filter(g=>g!==d.group); f.dirty = true; return rerender(); }
  if (d.date){ if (t.value){ setP(M.form, d.date, toBE(new Date(t.value))); M.form.dirty = true; rerender(); } return; }
  if (d.f){ setP(M.form, d.f, t.value); M.form.dirty = true; if (t.tagName==='SELECT' || t.type==='radio' || t.classList.contains('txt')) rerender(); }
}
function mSubmit(e){
  e.preventDefault(); e.stopPropagation();
  if (e.target.id==='m-search'){ M.q = M.qInput; M.page = 1; return rerender(); }
  if (e.target.id==='m-login'){
    const id = $('#m-emp').value.trim(), pw = $('#m-pw').value;
    $('#mf-id').classList.toggle('err', !id); $('#mf-pw').classList.toggle('err', !pw);
    if (!id || !pw) return;
    const b = $('#m-login-btn'); b.innerHTML = '<span class="spin"></span>'; b.disabled = true;
    setTimeout(() => { M.loggedIn = true; M.view = 'list'; mRender(); }, 600);
  }
}
// Drag to reorder (same model as the document-detail-builder reference):
// grab the grip, the card lifts and follows the cursor, a dashed slot previews the drop spot.
// Three levels — sections, documents, detail rows — each reorders only within its own parent.
const LEVELS = {
  sec: {sel:'.sec[data-si]', arr:(f)=>f.sections},
  doc: {sel:'.dblk[data-di]', arr:(f,it)=>f.sections[+it.closest('.sec').dataset.si].docs},
  det: {sel:'.det[data-ri]', arr:(f,it)=>f.sections[+it.closest('.sec').dataset.si].docs[+it.closest('.dblk').dataset.di].rows},
};
let mdrag = null;
const uiZoom = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui')) || 1;
function mReorder(e){
  if (e.pointerType==='mouse' && e.button!==0) return;
  const grip = e.target.closest('[data-grip]'); if (!grip || !M.form) return;
  const item = grip.closest('.det[data-ri],.dblk[data-di],.sec[data-si]');
  const kind = item.matches('.det') ? 'det' : item.matches('.dblk') ? 'doc' : 'sec', L = LEVELS[kind];
  const container = item.parentElement, sibs = [...container.children].filter(n => n.matches(L.sel));
  if (sibs.length < 2) return;
  e.preventDefault();
  const arr = L.arr(M.form, item), rect = item.getBoundingClientRect(), z = uiZoom();
  const slot = document.createElement('div'); slot.className = 'drop-slot'; slot.style.height = rect.height/z + 'px';
  container.insertBefore(slot, item);
  // Lift to <body> so the window's overflow can't clip it; keep the page zoom so it stays the same size
  Object.assign(item.style, {width:rect.width/z+'px', left:rect.left/z+'px', top:rect.top/z+'px'});
  item.classList.add('lifted'); document.body.appendChild(item); document.body.classList.add('is-dragging');
  try { grip.setPointerCapture(e.pointerId); } catch {}
  mdrag = {item, slot, container, sel:L.sel, arr, from:sibs.indexOf(item), to:sibs.indexOf(item), dx:e.clientX-rect.left, dy:e.clientY-rect.top, z, frame:null, grip:kind};
}
document.addEventListener('pointermove', e => {
  if (!mdrag) return;
  const d = mdrag, main = $('#maker .m-main');
  d.item.style.left = (e.clientX-d.dx)/d.z + 'px'; d.item.style.top = (e.clientY-d.dy)/d.z + 'px';
  if (main){ const r = main.getBoundingClientRect(); if (e.clientY < r.top+70) main.scrollTop -= 14; else if (e.clientY > r.bottom-70) main.scrollTop += 14; }
  const sibs = [...d.container.children].filter(n => n.matches(d.sel));
  let to = sibs.length;
  for (let i = 0; i < sibs.length; i++){ const r = sibs[i].getBoundingClientRect(); if (e.clientY < r.top + r.height/2){ to = i; break; } }
  if (to === d.to && d.slot.isConnected) return;
  d.to = to;
  if (to < sibs.length) d.container.insertBefore(d.slot, sibs[to]); else sibs[sibs.length-1].after(d.slot);
});
function mEndDrag(commit){
  if (!mdrag) return;
  const {item, slot, arr, from, to, frame} = mdrag;
  if (frame) cancelAnimationFrame(frame);
  slot.remove(); item.remove(); document.body.classList.remove('is-dragging'); mdrag = null;
  if (commit && to!==from){ arr.splice(to, 0, arr.splice(from, 1)[0]); M.form.dirty = true; M.form.savedAt = clock(); }
  rerender();
}
document.addEventListener('pointerup', () => mEndDrag(true));
document.addEventListener('pointercancel', () => mEndDrag(false));
document.addEventListener('keydown', e => {
  if (e.key==='Escape' && mdrag){ e.preventDefault(); return mEndDrag(false); }
  if (e.key!=='ArrowUp' && e.key!=='ArrowDown') return;
  const grip = e.target.closest?.('#maker [data-grip]'); if (!grip || !M.form) return;
  const item = grip.closest('.det[data-ri],.dblk[data-di],.sec[data-si]');
  const kind = item.matches('.det') ? 'det' : item.matches('.dblk') ? 'doc' : 'sec';
  const arr = LEVELS[kind].arr(M.form, item), from = +(item.dataset.ri ?? item.dataset.di ?? item.dataset.si), to = from + (e.key==='ArrowDown'?1:-1);
  if (to < 0 || to >= arr.length) return;
  e.preventDefault(); arr.splice(to, 0, arr.splice(from, 1)[0]); M.form.dirty = true; rerender();
  // keep focus on the moved item's handle
  const sel = {sec:`.sec[data-si="${to}"]>.sh [data-grip]`, doc:`.sec[data-si="${item.closest('.sec').dataset.si}"] .dblk[data-di="${to}"] .drow [data-grip]`, det:`.sec[data-si="${item.closest('.sec').dataset.si}"] .dblk[data-di="${item.closest('.dblk').dataset.di}"] .det[data-ri="${to}"] [data-grip]`}[kind];
  $('#maker '+sel)?.focus();
});
function mDrag(e){
  const z = e.target.closest('#m-drop,#lib-drop'); if (!z) return;
  e.preventDefault(); e.stopPropagation();
  z.classList.toggle('over', e.type==='dragover');
  if (e.type==='drop' && z.id==='lib-drop'){ const f = [...e.dataTransfer.files].find(f => /image\/(png|jpe?g)/.test(f.type)); if (f){ M.modal.up = {name:f.name, src:URL.createObjectURL(f), status:'อัปเดต', source:'อื่นๆ'}; rerender(); } return; }
  if (e.type==='drop') addUploads([...e.dataTransfer.files].filter(f => /image\/(png|jpe?g)/.test(f.type)).map(f => ({name:f.name, src:URL.createObjectURL(f)})));
}
// "Simulate 6:00" lives outside mClick so it can read the saved form snapshot
document.addEventListener('click', e => { if (e.target.closest('#maker [data-m="deliver"]')) mDeliver(); }, true);
