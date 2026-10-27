// Maker › เอกสาร and ข้อมูลรูปภาพ tabs, built from Figma "Iteration 2 › Maker":
// Homepage (Tab: Document) and Homepage (Tab: Infographic) — list, expand, search & filters,
// rename / replace with per-article notify, cancel, and image preview.
// Changes write straight into ARTICLES, so the Receiver sees renamed / replaced / cancelled items.

const LIB = {docs:{}, imgs:{}, types:null, srcs:null, dsort:'upd-desc', isort:'upd-desc', dpage:1, ipage:1, menu:null, open:{}, lastQ:''};
const LIB_SORTS = {'upd-desc':'วันที่อัปเดต (ล่าสุด)', 'upd-asc':'วันที่อัปเดต (เก่าสุด)', 'cnt-desc':'จำนวนประกาศ (มากไปน้อย)', 'cnt-asc':'จำนวนประกาศ (น้อยไปมาก)'};
const BAD_CHARS = /[\\/:*?"<>|]/;
// Maker-only rows (drafts, scheduled, expired…) that also reference documents / infographics
const EXTRA_DOCS = {x0:['ระเบียบการเปิดบัญชีเงินฝากออมทรัพย์'], x1:['ตารางค่าธรรมเนียมบัตร KTC Proud'],
  x2:['แบบฟอร์ม FATCA/CRS Self Certification (บุคคลธรรมดา)', 'ระเบียบปฏิบัติงาน การปฏิบัติตามกฎหมาย FATCA'],
  x3:['ประกาศเงื่อนไขสินเชื่อเพื่อที่อยู่อาศัย', 'Sales sheet สินเชื่อบ้าน'], x4:['Sales sheet สินเชื่อบ้าน'], x5:['ระเบียบการเปิดบัญชีเงินฝากออมทรัพย์']};
const EXTRA_IMGS = {x5:['4:0'], x3:['10:0'], x2:['2:0', '2:1'], x4:['10:1']};

const libHL = (s, q) => { const e = esc(s); if (!q) return e; const i = s.toLowerCase().indexOf(q); return i < 0 ? e : esc(s.slice(0,i)) + `<mark>${esc(s.slice(i, i+q.length))}</mark>` + libHL(s.slice(i+q.length), q); };
const libSorter = k => ({'upd-desc':(a,b)=>b.ts-a.ts, 'upd-asc':(a,b)=>a.ts-b.ts, 'cnt-desc':(a,b)=>b.uses.length-a.uses.length, 'cnt-asc':(a,b)=>a.uses.length-b.uses.length})[k];

/* ---------- Indexes ---------- */
function docIndex(){
  const map = new Map();
  const add = (name, r) => { if (!map.has(name)) map.set(name, {name, type:guessType(name), uses:[]}); const d = map.get(name); if (!d.uses.includes(r)) d.uses.push(r); };
  MK.rows.forEach(r => { const a = art(r); if (a) a.groups.forEach(g => g.docs.forEach(d => add(d.name, r))); (EXTRA_DOCS[r.id]||[]).forEach(n => add(n, r)); });
  return [...map.values()].map(d => ({...d, cancelled:!!LIB.docs[d.name]?.cancelled, ts:Math.max(LIB.docs[d.name]?.ts||0, ...d.uses.map(r => r.ts||0))}));
}
function imgIndex(){
  const items = new Map();
  MK.rows.forEach(r => { const a = art(r); if (!a) return;
    const list = a.images ? a.images.map(src => ({src: src.includes('/') ? src : A+src})) : (a.posters||[]).map(p => ({p}));
    list.forEach((x, k) => {
      const key = a.id+':'+k, o = LIB.imgs[key] || {};
      const baseName = a.images ? (k ? `NRR พารู้ Issue 36 (${k}).jpg` : a.igName) : `${x.p.title}.jpg`;
      const source = o.source || (a.images ? (k ? 'NRR พารู้' : 'เรื่องเด่นเรื่องเด็ด') : a.type==='product' ? 'CLMG POST' : k%2 ? 'อื่นๆ' : 'สรุปสั้นทันใจ');
      items.set(key, {key, a, k, src:o.src || x.src, p:o.src ? null : x.p, name:o.name || baseName, source, cancelled:!!o.cancelled,
        ocr: x.p && !o.src ? [x.p.sub, ...x.p.points].join(' · ') : a.summary, updated:o.updated || '19/07/2569 13:34:54', uses:[r], ts:Math.max(o.ts||0, r.ts||0)});
    });
  });
  MK.rows.forEach(r => (EXTRA_IMGS[r.id]||[]).forEach(key => { const it = items.get(key); if (it){ it.uses.push(r); it.ts = Math.max(it.ts, r.ts||0); } }));
  return [...items.values()];
}
const imgTitle = it => `${it.source} - ${it.name.replace(/\.\w+$/, '')}`;
const imgThumb = (it, cls='lib-thumb') => it.src ? `<img class="${cls}" src="${it.src}" alt="">` : `<span class="${cls} poster-mini">${poster(it.p, it.a)}</span>`;

/* ---------- List views ---------- */
function libFilters(kind){
  const isDoc = kind==='doc', sel = isDoc ? LIB.types : LIB.srcs, all = isDoc ? DOC_TYPES : IMG_SOURCES;
  const mk = isDoc ? 'dtype' : 'isrc', sk = isDoc ? 'dsort' : 'isort', cur = LIB[sk];
  const label = !sel ? (isDoc ? 'ประเภททั้งหมด' : 'แหล่งข้อมูลทั้งหมด') : sel.length===1 ? sel[0] : `${isDoc?'ประเภท':'แหล่งข้อมูล'} (${sel.length})`;
  const opt = (v, arrow, l) => `<button type="button" class="${cur===v?'on':''}" data-libsort="${sk}:${v}"><span class="ar">${arrow}</span>${l}</button>`;
  return `<div class="lib-dd"><button type="button" class="sel lib-btn${LIB.menu===mk?' dd-open':''}" data-libmenu="${mk}"><span>${esc(label)}</span><img src="${MA}chev-down.svg" alt=""></button>
      ${LIB.menu===mk ? `<div class="lib-pop"><label><input type="checkbox" data-liball="${mk}" ${!sel?'checked':''}>ทั้งหมด</label>${all.map(t => `<label><input type="checkbox" data-libopt="${mk}" value="${esc(t)}" ${!sel||sel.includes(t)?'checked':''}>${esc(t)}</label>`).join('')}</div>` : ''}</div>
    <div class="lib-dd"><button type="button" class="sel lib-btn wide${LIB.menu===sk?' dd-open':''}" data-libmenu="${sk}"><span>${LIB_SORTS[cur]}</span><img src="${MA}chev-down.svg" alt=""></button>
      ${LIB.menu===sk ? `<div class="lib-pop sort"><small>วันที่อัปเดต</small>${opt('upd-desc','↑','ล่าสุดก่อน')}${opt('upd-asc','↓','เก่าสุดก่อน')}<small>จำนวนประกาศ</small>${opt('cnt-desc','↑','มากไปน้อย')}${opt('cnt-asc','↓','น้อยไปมาก')}</div>` : ''}</div>
    <button type="button" class="ghost" data-m="libclear" style="min-width:auto">ล้างตัวกรอง</button>`;
}
function kidTable(rows, q){
  return `<div class="lib-kids"><div class="kr kh"><span>รหัสอ้างอิง <img src="${MA}sort-desc.svg" alt=""></span><span>ชื่อประกาศ</span><span>เริ่มใช้</span><span>สร้างโดย</span><span>อัปเดตโดย <img src="${MA}sort-desc.svg" alt=""></span><span>สถานะ</span></div>
    ${rows.map(r => { const v = rv(r), dim = !!r.lockedBy || r.ref.includes('-D');
      const left = v.end && v.mstatus==='published' ? daysBetween(TODAY, v.end) : null;
      const b = v.badge.status ? badges({type:v.type, status:v.badge.status, cancel:v.badge.cancel}).replace(/<span class="badge type">.*?<\/span>/,'') : '';
      return `<div class="kr${dim?' dim':''}"><span>${v.ref}</span><div><b class="kt">${TYPE[v.type].label}${b}</b><div class="ttl">${libHL(v.title, q)}</div></div>
        <div>${v.start}${v.end?' - '+v.end:''}${left!==null&&left>=0&&left<=3?`<div class="warn"><img src="${MA}warn.svg" alt="">หมดอายุในอีก ${left} วัน</div>`:''}</div>
        <div>${v.createdBy}<small>${v.created}</small></div><div>${v.updatedBy}<small>${v.updated}</small></div>
        <div><span class="st ${v.mstatus}">${STATUS_LABEL[v.mstatus]}</span>${v.sched?`<div class="meta"><img src="${MA}calendar.svg" alt="">วันที่ ${v.sched}</div>`:''}${v.lockedBy?`<div class="meta"><img src="${MA}lock.svg" alt="">กำลังแก้ไขโดย ${v.lockedBy}</div>`:''}</div></div>`; }).join('')}</div>`;
}
function libList(kind, items, q){
  const isDoc = kind==='doc', pk = isDoc ? 'dpage' : 'ipage', per = 10, n = items.length, pages = Math.max(1, Math.ceil(n/per));
  LIB[pk] = Math.min(LIB[pk], pages);
  const from = (LIB[pk]-1)*per, view = items.slice(from, from+per);
  const row = it => {
    const key = (isDoc ? 'd:' : 'i:') + (isDoc ? it.name : it.key);
    const open = LIB.open[key] ?? (!!q && it.matchKids);
    const name = isDoc
      ? `<div class="lib-name"><span class="lib-chip">${esc(it.type)}</span><a class="lib-link" data-libdoc="${esc(it.name)}">${libHL(it.name, q)}</a>${it.cancelled?'<span class="st recalled">ยกเลิกใช้</span>':''}</div>`
      : `<div class="lib-name col"><div><svg class="pic" viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.5" fill="none" stroke="#1e87cb" stroke-width="1.3"/><circle cx="6" cy="6.5" r="1.2" fill="#1e87cb"/><path d="M3 12l3.5-3.5 2.5 2.5 1.5-1.5 2.5 2.5" fill="none" stroke="#1e87cb" stroke-width="1.3"/></svg><a class="lib-link" data-libpreview="${it.key}">${libHL(imgTitle(it), q)}</a>${it.cancelled?'<span class="st recalled">ยกเลิกใช้</span>':''}</div><small class="ocr">${libHL(it.ocr, q)}</small></div>`;
    const id = esc(isDoc ? it.name : it.key);
    const acts = isDoc
      ? `<button class="ib" data-librename="${id}" data-tip="แก้ไขชื่อเอกสาร" ${it.cancelled?'disabled':''}><img src="${MA}${it.cancelled?'edit-dis':'edit'}.svg" alt=""></button><button class="ib" data-libdcancel="${id}" data-tip="ยกเลิกใช้เอกสาร" ${it.cancelled?'disabled':''}><img src="${MA}recall.svg" alt=""></button>`
      : `<button class="ib" data-libreplace="${id}" data-tip="แก้ไขรูปภาพ" ${it.cancelled?'disabled':''}><img src="${MA}${it.cancelled?'edit-dis':'edit'}.svg" alt=""></button><button class="ib" data-libicancel="${id}" data-tip="ยกเลิกใช้รูปภาพ" ${it.cancelled?'disabled':''}><img src="${MA}recall.svg" alt=""></button>`;
    return `<div class="lib-row${open?' open':''}${it.cancelled?' cancelled':''}"><div class="lib-h">
        <button class="lib-tog" data-libtog="${esc(key)}" aria-label="ขยาย"><img src="${MA}chev-right.svg" alt=""></button>${name}
        <span class="lib-cnt">${it.uses.length}</span><div class="acts">${acts}</div></div>${open ? kidTable(it.uses, q) : ''}</div>`;
  };
  return searchBar(isDoc ? 'ค้นหาชื่อเอกสาร' : 'ค้นหารูปภาพ', libFilters(kind))
    + (q ? `<div class="lib-res">ผลการค้นหา ${n} รายการ</div>` : '')
    + `<div class="lib-tbl"><div class="lib-h lib-th"><span></span><span>${isDoc?'ชื่อเอกสาร':'ชื่อรูปภาพ'}</span><span class="lib-cnt">จำนวนประกาศ</span><span class="acts">การจัดการ</span></div>
      ${view.length ? view.map(row).join('') : `<div class="m-empty"><b>${isDoc?'ไม่พบเอกสาร':'ไม่พบรูปภาพ'}</b>ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</div>`}</div>
    <div class="tbl-foot"><span>แสดง ${n?from+1:0}-${Math.min(from+per,n)} จาก ${n} รายการ</span>
      <div class="r">จำนวนรายการต่อหน้า <label class="sel"><select disabled><option>10</option></select><img src="${MA}chev-down.svg" alt=""></label>
      <div class="pager">${pagerHTML(LIB[pk], pages, 'lib'+pk)}</div></div></div>`;
}
function libQuery(){ const q = M.q.trim().toLowerCase(); if (q !== LIB.lastQ){ LIB.lastQ = q; LIB.dpage = LIB.ipage = 1; LIB.open = {}; } return q; }
function vDocs(){
  const q = libQuery();
  const docs = docIndex().map(d => ({...d, matchKids: !!q && d.uses.some(r => rv(r).title.toLowerCase().includes(q))}))
    .filter(d => (!LIB.types || LIB.types.includes(d.type)) && (!q || d.name.toLowerCase().includes(q) || d.matchKids))
    .sort(libSorter(LIB.dsort));
  return libList('doc', docs, q);
}
function vImages(){
  const q = libQuery();
  const imgs = imgIndex().map(it => ({...it, matchKids: !!q && it.uses.some(r => rv(r).title.toLowerCase().includes(q))}))
    .filter(it => (!LIB.srcs || LIB.srcs.includes(it.source)) && (!q || imgTitle(it).toLowerCase().includes(q) || it.ocr.toLowerCase().includes(q) || it.matchKids))
    .sort(libSorter(LIB.isort));
  return libList('img', imgs, q);
}

/* ---------- Modals ---------- */
function libUses(m, uses){
  const elig = uses.filter(r => r.mstatus==='published'), all = elig.length && elig.every(r => m.notify.includes(r.id));
  return `<div class="lib-uses"><div class="lab" style="margin:0">ประกาศที่ใช้${m.kind.startsWith('doc')?'เอกสาร':'รูปภาพ'}นี้ <span class="g">(${uses.length} ประกาศ)</span></div>
    <small class="g">เลือกประกาศที่ต้องการแจ้งเตือนผู้อ่านถึงการเปลี่ยนแปลงนี้</small>
    <div class="lu"><div class="lur luh"><span></span><label class="chk"><input type="checkbox" data-libnall ${all?'checked':''} ${elig.length?'':'disabled'}>แจ้งเตือนผู้อ่านในทุกประกาศ</label></div>
    ${uses.map(r => { const v = rv(r), ok = r.mstatus==='published';
      const left = v.end && ok ? daysBetween(TODAY, v.end) : null;
      return `<div class="lur"><div class="lui"><span>${v.ref}</span><div><b>${TYPE[v.type].label}</b><div class="ttl1">${esc(v.title)}</div></div>
        <div>${v.start}${v.end?' - '+v.end:''}${left!==null&&left>=0&&left<=3?`<div class="warn"><img src="${MA}warn.svg" alt="">หมดอายุในอีก ${left} วัน</div>`:''}</div><span><span class="st ${v.mstatus}">${STATUS_LABEL[v.mstatus]}</span></span></div>
        <label class="chk" ${ok?'':'data-tip="ยังไม่เผยแพร่ จะไม่มีแจ้งเตือน"'}><input type="checkbox" data-libn="${r.id}" ${ok&&m.notify.includes(r.id)?'checked':''} ${ok?'':'disabled'}>แจ้งเตือน</label></div>`; }).join('')}</div></div>`;
}
const libX = `<button data-m="close" aria-label="ปิด"><img src="${MA}b-close.svg" alt=""></button>`;
const libFoot = (m, verb, n, ok) => `<div class="ft lib-ft"><small>${verb}ใน <b>${n}</b> ประกาศ · แจ้งเตือนผู้อ่าน <b>${m.notify.length}</b> ประกาศ</small><span><button class="btn out" data-m="close">ยกเลิก</button><button class="btn pri" data-m="${ok}">ยืนยัน</button></span></div>`;
function libModal(m){
  if (m.kind==='docRename'){
    const d = docIndex().find(x => x.name===m.name);
    return `<div class="m-mod xl"><h3><span><img src="${MA}edit.svg" alt="">แก้ไขชื่อเอกสาร</span>${libX}</h3>
      <div class="lib-info"><span>Intranet URL <a class="ulink" title="${esc(decodeURI(docUrl(m.name)))}">🔗 ${esc(decodeURI(docUrl(m.name)).replace('https://',''))}</a></span><span>ชื่อเอกสารเดิม <b>${esc(m.name)}</b></span></div>
      <div class="lib-box fld${m.err?' err':''}"><span class="lab">ชื่อเอกสารใหม่<i>*</i></span><input class="fin" data-libin="val" value="${esc(m.val)}" placeholder="กรอกข้อมูล" autocomplete="off">
        <div class="emsg">${m.err||''}</div><small class="g">ชื่อนี้จะแสดงแทนชื่อเดิมในทุกประกาศด้านล่างโดยอัตโนมัติ</small></div><hr>
      ${libUses(m, d.uses)}${libFoot(m, 'แก้ไขเอกสาร', d.uses.length, 'librenameok')}</div>`;
  }
  if (m.kind==='imgReplace'){
    const it = imgIndex().find(x => x.key===m.key), u = m.up;
    return `<div class="m-mod xl"><h3><span><img src="${MA}edit.svg" alt="">แก้ไขรูปภาพ</span>${libX}</h3>
      <div class="lib-info col"><span class="lab" style="margin:0">รูปภาพเดิม</span><div class="orig">${imgThumb(it)}<div><a class="lib-link" data-libpreview="${it.key}">${esc(it.name)}</a>
        <small class="g">คงเดิม (Default) · ${esc(it.source)} · อัปเดตล่าสุด ${it.updated} · 4 MB</small></div></div></div>
      <div class="lib-box"><span class="lab" style="margin:0">อัปโหลดรูปภาพใหม่</span><small class="g">รูปภาพใหม่จะแสดงแทนรูปภาพเดิมในประกาศด้านล่างโดยอัตโนมัติ</small>
        <div class="info"><span class="d">i</span>ระบบสามารถระบุแหล่งที่มาของไฟล์ได้อัตโนมัติหากพบอยู่ในชื่อไฟล์ที่อัปโหลด โดยชื่อไฟล์ต้องมีความยาวไม่เกิน 80 ตัวอักษร</div>
        <div class="utbl"><div class="ur thd lib-ur"><span>ชื่อไฟล์</span><span>สถานะรูปภาพ <i class="req">*</i></span><span>แหล่งที่มา <i class="req">*</i></span><span>อัปเดตล่าสุด</span><span>การจัดการ</span></div>
        ${u ? `<div class="ur lib-ur"><span class="fnc"><img class="thumb" src="${u.src}" alt=""><span><a class="lib-link">${esc(u.name)}</a><small class="g">4 MB</small></span></span>
            <label class="sel"><select data-libup="status">${opts(['คงเดิม (Default)','อัปเดต'], u.status)}</select><img src="${MA}chev-down.svg" alt=""></label>
            <label class="sel"><select data-libup="source">${opts(IMG_SOURCES, u.source)}</select><img src="${MA}chev-down.svg" alt=""></label>
            <span>${TODAY}<br><small class="g">${clock()}</small></span><button class="tbtn" data-m="librmup" data-tip="ลบ"><img src="${MA}trash.svg" alt=""></button></div>`
          : `<div class="drop lib-drop" id="lib-drop">${UPLOAD_SVG}<div>เลือก หรือลากไฟล์ที่นี่</div><small>ประเภทไฟล์ที่รองรับ: jpg, png | ขนาดไฟล์ไม่เกิน: 10 MB</small>
            <button class="btn pri" data-m="libupload">อัปโหลดไฟล์</button><button class="addl" data-m="libsample" style="align-self:center;font-weight:500;font-size:13px">หรือใช้รูปตัวอย่าง</button>
            <input type="file" id="lib-file" accept="image/png,image/jpeg" hidden></div>`}</div></div><hr>
      ${libUses(m, it.uses)}${libFoot(m, 'แก้ไขรูปภาพ', it.uses.length, 'libreplaceok')}</div>`;
  }
  if (m.kind==='docCancel' || m.kind==='imgCancel'){
    const doc = m.kind==='docCancel';
    return `<div class="m-mod"><h3><span><svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="#c84341" stroke-width="1.6"/><path d="M7 7l6 6M13 7l-6 6" stroke="#c84341" stroke-width="1.6" stroke-linecap="round"/></svg>ยกเลิกใช้${doc?'เอกสาร':'รูปภาพ'}</span>${libX}</h3>
      <p>${doc?'เอกสาร':'รูปภาพ'}นี้จะถูกยกเลิกใช้ในทุกประกาศ</p>
      <label class="chk"><input type="checkbox" data-libcn ${m.notifyAll?'checked':''}>แจ้งเตือนผู้อ่านในทุกประกาศ</label>
      <div class="ft"><button class="btn out" data-m="close">ยกเลิก</button><button class="btn danger" data-m="libcancelok">ยืนยัน</button></div></div>`;
  }
  if (m.kind==='imgPreview'){
    const it = imgIndex().find(x => x.key===m.key);
    return `<div class="m-mod xl lib-prev"><h3><span>${esc(it.name)}</span>${libX}</h3><div class="pv">${it.src ? `<img src="${it.src}" alt="">` : poster(it.p, it.a)}</div></div>`;
  }
  if (m.kind==='nameMissing'){
    const doc = getP(M.form, m.path);
    return `<div class="m-mod"><h3><span><svg width="20" height="20" viewBox="0 0 16 16"><path d="M8 1l7.4 13H.6z" fill="#e3a008"/><path d="M8 6v4M8 12v.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>ไม่พบชื่อเอกสารในระบบนี้</span>${libX}</h3>
      <small class="g" style="margin-top:-10px">กรุณาตั้งชื่อเอกสารสำหรับ URL นี้</small>
      <div class="lib-info"><span>Intranet URL <a class="ulink">🔗 ${esc(doc.url.replace(/^https?:\/\//,''))}</a></span></div>
      <div class="lib-box fld${m.err?' err':''}"><span class="lab">ชื่อเอกสาร<i>*</i><i class="tip" data-tip='ไม่รองรับอักขระพิเศษ \\ / : * ? " < > |'>i</i></span>
        <input class="fin" data-libin="val" value="${esc(m.val)}" placeholder="กรอกข้อมูล" autocomplete="off"><div class="emsg">${m.err||''}</div></div>
      <div class="ft"><button class="btn out" data-m="close">ยกเลิก</button><button class="btn pri" data-m="libnameok">ยืนยัน</button></div></div>`;
  }
  return '';
}

/* ---------- Apply changes (shared with the Receiver) ---------- */
function libNotify(ids){
  ids.forEach(id => { const r = MK.rows.find(x => x.id===id), a = r && art(r); if (!a) return;
    Object.assign(a, {read:false, date:'อัปเดต '+TODAY, status: a.status==='cancel' ? 'cancel' : 'update'}); touch(r); });
}
function libNameErr(v, current){
  if (!v.trim()) return 'กรอกข้อมูล';
  if (BAD_CHARS.test(v)) return 'ชื่อเอกสารไม่รองรับอักขระพิเศษ \\ / : * ? " < > |';
  if (v.trim()!==current && docIndex().some(d => d.name===v.trim())) return 'ชื่อเอกสารซ้ำกับที่มีในระบบแล้ว';
  return '';
}
function libDone(msgs){ M.modal = null; mRender(); refreshReceiver(); msgs.forEach(t => toast(t, {type:'success'})); }

/* ---------- Events (called from maker.js) ---------- */
function libClick(e, t){
  const d = t ? t.dataset : {}, m = M.modal;
  if (!t){ if (LIB.menu && !e.target.closest('.lib-pop')){ LIB.menu = null; rerender(); return true; } return false; }
  if (d.libmenu){ LIB.menu = LIB.menu===d.libmenu ? null : d.libmenu; rerender(); return true; }
  if (d.libsort){ const [k, v] = d.libsort.split(':'); LIB[k] = v; LIB.menu = null; LIB.dpage = LIB.ipage = 1; rerender(); return true; }
  if (d.m==='libclear'){ Object.assign(LIB, {types:null, srcs:null, dsort:'upd-desc', isort:'upd-desc', menu:null, open:{}}); M.q = M.qInput = ''; mRender(); return true; }
  if (d.libtog){ LIB.open[d.libtog] = !t.closest('.lib-row').classList.contains('open'); rerender(); return true; }
  for (const pk of ['dpage','ipage']) if (d['lib'+pk]){ const v = d['lib'+pk]; LIB[pk] = v==='prev' ? LIB[pk]-1 : v==='next' ? LIB[pk]+1 : +v; rerender(); return true; }
  if (d.libdoc){ toast(`เปิดเอกสาร “${d.libdoc}” จาก Intranet`); return true; }
  if (d.librename){ M.modal = {kind:'docRename', name:d.librename, val:'', err:'', notify:[]}; rerender(); setTimeout(()=>$('#maker [data-libin]')?.focus(), 30); return true; }
  if (d.libdcancel){ M.modal = {kind:'docCancel', name:d.libdcancel, notifyAll:false}; rerender(); return true; }
  if (d.libreplace){ M.modal = {kind:'imgReplace', key:d.libreplace, up:null, notify:[]}; rerender(); return true; }
  if (d.libicancel){ M.modal = {kind:'imgCancel', key:d.libicancel, notifyAll:false}; rerender(); return true; }
  if (d.libpreview){ M.modal = {kind:'imgPreview', key:d.libpreview, back:m && m.kind==='imgReplace' ? m : null}; rerender(); return true; }
  if (d.m==='close' && m?.kind==='imgPreview' && m.back){ M.modal = m.back; rerender(); return true; }
  if (d.m==='libupload'){ $('#lib-file').click(); return true; }
  if (d.m==='libsample'){ const it = imgIndex().find(x => x.key===m.key);
    m.up = {name:'เรื่องเด่นเรื่องเด็ด 223-แนวทางการปรับปรุงข้อมูล FATCA.jpg', src:A+'info-1.png', status:'อัปเดต', source:'เรื่องเด่นเรื่องเด็ด'}; rerender(); return true; }
  if (d.m==='librmup'){ m.up = null; rerender(); return true; }
  if (d.m==='librenameok'){
    m.err = libNameErr(m.val, m.name); if (m.err){ rerender(); return true; }
    const v = m.val.trim();
    ARTICLES.forEach(a => a.groups.forEach(g => g.docs.forEach(x => { if (x.name===m.name) x.name = v; })));
    Object.values(EXTRA_DOCS).forEach(list => list.forEach((n, i) => { if (n===m.name) list[i] = v; }));
    LIB.docs[v] = {...LIB.docs[m.name], ts:100 + Date.now()/1e13}; delete LIB.docs[m.name];
    if (LIB.open['d:'+m.name] !== undefined){ LIB.open['d:'+v] = LIB.open['d:'+m.name]; }
    libNotify(m.notify);
    libDone(m.notify.length ? ['แจ้งเตือนผู้อ่านสำเร็จ', 'แก้ไขชื่อเอกสารสำเร็จ'] : ['แก้ไขชื่อเอกสารสำเร็จ']); return true;
  }
  if (d.m==='libreplaceok'){
    if (!m.up){ toast('กรุณาอัปโหลดรูปภาพใหม่'); return true; }
    LIB.imgs[m.key] = {...LIB.imgs[m.key], src:m.up.src, name:m.up.name, source:m.up.source, sdate:TODAY, updated:`${TODAY} ${clock()}`, ts:100 + Date.now()/1e13};
    libNotify(m.notify);
    libDone(m.notify.length ? ['แจ้งเตือนผู้อ่านสำเร็จ', 'แก้ไขรูปภาพสำเร็จ'] : ['แก้ไขรูปภาพสำเร็จ']); return true;
  }
  if (d.m==='libcancelok'){
    let uses;
    if (m.kind==='docCancel'){
      ARTICLES.forEach(a => a.groups.forEach(g => g.docs.forEach(x => { if (x.name===m.name) Object.assign(x, {cancelled:true, status:'ยกเลิก', sdate:TODAY}); })));
      LIB.docs[m.name] = {...LIB.docs[m.name], cancelled:true, ts:100 + Date.now()/1e13};
      uses = docIndex().find(x => x.name===m.name).uses;
    } else {
      LIB.imgs[m.key] = {...LIB.imgs[m.key], cancelled:true, sdate:TODAY, ts:100 + Date.now()/1e13};
      uses = imgIndex().find(x => x.key===m.key).uses;
    }
    const ids = m.notifyAll ? uses.filter(r => r.mstatus==='published').map(r => r.id) : [];
    libNotify(ids);
    const what = m.kind==='docCancel' ? 'เอกสาร' : 'รูปภาพ';
    libDone(ids.length ? ['แจ้งเตือนผู้อ่านสำเร็จ', `ยกเลิกใช้${what}สำเร็จ`] : [`ยกเลิกใช้${what}สำเร็จ`]); return true;
  }
  if (d.m==='libnameok'){
    m.err = libNameErr(m.val, null); if (m.err){ rerender(); return true; }
    const doc = getP(M.form, m.path); doc.name = m.val.trim(); if (!doc.dtype) doc.dtype = guessType(doc.name);
    M.form.dirty = true; M.modal = null; rerender(); toast('ตั้งชื่อเอกสารแล้ว', {type:'success'}); return true;
  }
  return false;
}
function libChange(e){
  const t = e.target, d = t.dataset, m = M.modal;
  if (d.liball){ const k = d.liball==='dtype' ? 'types' : 'srcs'; LIB[k] = t.checked ? null : []; LIB.dpage = LIB.ipage = 1; rerender(); return true; }
  if (d.libopt){ const k = d.libopt==='dtype' ? 'types' : 'srcs', all = d.libopt==='dtype' ? DOC_TYPES : IMG_SOURCES;
    let sel = LIB[k] ? [...LIB[k]] : [...all];
    sel = t.checked ? [...new Set([...sel, t.value])] : sel.filter(x => x!==t.value);
    LIB[k] = sel.length===all.length ? null : sel; LIB.dpage = LIB.ipage = 1; rerender(); return true; }
  if (d.libn !== undefined){ m.notify = t.checked ? [...new Set([...m.notify, d.libn])] : m.notify.filter(x => x!==d.libn); rerender(); return true; }
  if (d.libnall !== undefined){ const uses = m.kind==='docRename' ? docIndex().find(x => x.name===m.name).uses : imgIndex().find(x => x.key===m.key).uses;
    m.notify = t.checked ? uses.filter(r => r.mstatus==='published').map(r => r.id) : []; rerender(); return true; }
  if (d.libcn !== undefined){ m.notifyAll = t.checked; return true; }
  if (d.libup){ m.up[d.libup] = t.value; return true; }
  if (t.id==='lib-file'){ const f = t.files[0]; if (!f) return true;
    if (f.name.length > 80){ toast('ชื่อไฟล์ยาวเกิน 80 ตัวอักษร'); return true; }
    m.up = {name:f.name, src:URL.createObjectURL(f), status:'อัปเดต', source: IMG_SOURCES.find(s => f.name.toLowerCase().includes(s.split(' ')[0].toLowerCase())) || 'อื่นๆ'}; rerender(); return true; }
  return false;
}
function libInput(e){
  const t = e.target; if (!t.dataset.libin || !M.modal) return false;
  M.modal[t.dataset.libin] = t.value;
  if (M.modal.err){ M.modal.err = ''; t.closest('.fld')?.classList.remove('err'); }
  return true;
}
