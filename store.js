// Online storage for real articles (Supabase): maker and receiver sign-in, articles, infographic images.
// Only active when supabase-config.js is filled in; otherwise the prototype runs on the sample data in data.js.
// Maker and Receiver keep separate sessions, so one computer can be signed in as both.
// The database rules (tools/supabase-setup.sql) decide who may read or write.
const BUCKET = 'infographics';
const DEMO = ARTICLES.slice();            // sample articles, shown until real ones exist
const PATH_OF = {};                       // image src (blob or signed URL) → storage path
const URLS = {};                          // storage path → {url, exp}
const PENDING = new Set();                // image uploads still running
let SB = null, readerEmail = null, lastReader = '', saving = 0;

const toEmail = (id, domain) => (id.includes('@') ? id : `${id}@${domain}`).trim().toLowerCase();
const stampOf = iso => { const d = new Date(iso); return `${beOf(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const tsOf = iso => 100 + new Date(iso).getTime()/1e13;   // same scale as touch()
const errText = e => /invalid.*credentials|invalid login/i.test(e?.message||'') ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'เชื่อมต่อระบบไม่ได้ กรุณาลองอีกครั้ง';
function newRef(){
  const [d, m, y] = TODAY.split('/'), base = y.slice(2) + m + d;
  let ref; do ref = `${base}-D${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`; while (MK.rows.some(r => r.ref.replace('-D','-')===ref.replace('-D','-')));
  return ref;
}
function loginErr(fieldId, text){
  const f = $('#'+fieldId); if (!f) return;
  const msg = f.querySelector('.msg'); msg.dataset.def ??= msg.textContent;
  msg.textContent = text; f.classList.add('err');
  f.querySelector('input').addEventListener('input', () => { f.classList.remove('err'); msg.textContent = msg.dataset.def; }, {once:true});
}
function busy(btn, on){
  if (!btn) return;
  if (on){ btn.dataset.html = btn.innerHTML; btn.innerHTML = '<span class="spin"></span>'; btn.disabled = true; }
  else { btn.innerHTML = btn.dataset.html; btn.disabled = false; }
}

/* ---------- Images ---------- */
function uploadImage(file, src){
  const path = `${new Date().toISOString().slice(0,7)}/${crypto.randomUUID()}.${file.type==='image/png' ? 'png' : 'jpg'}`;
  const p = SB.maker.storage.from(BUCKET).upload(path, file, {contentType:file.type})
    .then(({error}) => { if (error) throw error; PATH_OF[src] = path; })
    .catch(e => toast('อัปโหลดรูปภาพไม่สำเร็จ', {type:'error', desc:`${file.name}: ${e.message}`}))
    .finally(() => PENDING.delete(p));
  PENDING.add(p);
}
// Images are private: swap storage paths for signed links (valid 1 day, reused while fresh)
async function signPaths(client, paths){
  const need = [...new Set(paths)].filter(p => !(URLS[p]?.exp > Date.now() + 36e5));
  if (need.length){
    const {data} = await client.storage.from(BUCKET).createSignedUrls(need, 86400);
    (data||[]).forEach(x => { if (x.signedUrl){ URLS[x.path] = {url:x.signedUrl, exp:Date.now() + 864e5}; PATH_OF[x.signedUrl] = x.path; } });
  }
  return p => URLS[p]?.url || '';
}
async function signArticles(client, list){
  const paths = list.flatMap(a => (a.images||[]).filter(s => s.startsWith('sb:')).map(s => s.slice(3)));
  if (!paths.length) return;
  const url = await signPaths(client, paths);
  list.forEach(a => { if (a.images) a.images = a.images.map(s => s.startsWith('sb:') ? url(s.slice(3)) : s); });
}
async function signForms(client, forms){
  const paths = forms.flatMap(f => (f?.uploads||[]).filter(u => u.path).map(u => u.path));
  if (!paths.length) return;
  const url = await signPaths(client, paths);
  forms.forEach(f => (f?.uploads||[]).forEach(u => { if (u.path) u.src = url(u.path); }));
}

/* ---------- Maker ---------- */
async function makerName(email){
  const {data} = await SB.maker.from('makers').select('name').eq('email', email).maybeSingle();
  return data?.name || null;
}
async function makerLogin(id, pw){
  const btn = $('#m-login-btn'); busy(btn, true);
  const email = toEmail(id, 'krungthai.com');
  const {error} = await SB.maker.auth.signInWithPassword({email, password:pw});
  const who = !error && await makerName(email);
  if (!who){
    if (!error) await SB.maker.auth.signOut();
    busy(btn, false);
    return loginErr('mf-pw', error ? errText(error) : 'บัญชีนี้ไม่มีสิทธิ์ใช้งานระบบสร้างประกาศ');
  }
  ME = who; await loadMaker();
  M.loggedIn = true; M.view = 'list'; mRender();
}
function makerLogout(){ SB.maker.auth.signOut(); MK.rows = []; }
function rowOf(d){
  const f = d.form || {};
  return {id:'db'+d.id, dbid:d.id, ref:d.ref, mstatus:d.mstatus, sched:d.sched,
    createdBy:d.created_by, created:stampOf(d.created_at), updatedBy:d.updated_by, updated:stampOf(d.updated_at), ts:tsOf(d.updated_at),
    type:f.type||'practice', title:f.title||'(ยังไม่มีหัวข้อประกาศ)', start:f.start||'', end:f.end||'',
    _form:{...f, uploads:f.uploads||[]}, dbArt: d.article ? {...d.article, id:1e5 + d.id} : null};
}
async function loadMaker(){
  const [arts, makers] = await Promise.all([
    SB.maker.from('articles').select('*').order('updated_at', {ascending:false}),
    SB.maker.from('makers').select('name')]);
  if (arts.error) return toast('โหลดประกาศไม่สำเร็จ', {type:'error', desc:arts.error.message});
  if (makers.data) AUTHORS.splice(0, AUTHORS.length, ...makers.data.map(m => m.name));
  const rows = arts.data.map(rowOf);
  await Promise.all([signArticles(SB.maker, rows.map(r => r.dbArt).filter(Boolean)), signForms(SB.maker, rows.map(r => r._form))]);
  if (!saving) MK.rows = rows;   // never drop a row that is still being saved
}
// What gets stored: no blob links, no on-screen flags; images by storage path
function packForm(f){
  const c = JSON.parse(JSON.stringify({...f, uploads:[]}));
  ['rowId', 'ref', 'mstatus', 'showErr', '_e', 'dirty', 'groupMenu'].forEach(k => delete c[k]);
  c.uploads = (f.uploads||[]).map(({src, file, ...u}) => { const path = u.path || PATH_OF[src]; return path ? {...u, path} : {...u, src}; });
  return c;
}
function packArt(a){
  const c = JSON.parse(JSON.stringify(a));
  ['id', 'read', '_seen'].forEach(k => delete c[k]);
  if (c.images) c.images = c.images.map(s => PATH_OF[s] ? 'sb:' + PATH_OF[s] : s);
  return c;
}
// After an article goes out, its อัปเดต / ยกเลิก picks become the "previous" state for the next edit
function settledForm(f){
  const c = JSON.parse(JSON.stringify({...f, uploads:[]}));
  c.uploads = (f.uploads||[]).map(u => ({...u}));
  const settle = x => { const st = resolveSt(x.status, x.prev); x.prev = prevOf(st); x.status = KEEP; };
  c.sections.forEach(s => s.docs.forEach(d => { settle(d); d.rows.forEach(settle); }));
  c.uploads.forEach(settle);
  return c;
}
function dbSaveRow(r){
  saving++;
  r._saving = (r._saving || Promise.resolve()).then(() => saveNow(r))
    .catch(e => toast('บันทึกไม่สำเร็จ', {type:'error', desc:e.message || String(e)}))
    .finally(() => saving--);
  return r._saving;
}
async function saveNow(r){
  await Promise.all([...PENDING]);
  const rec = {ref:r.ref, mstatus:r.mstatus, sched:r.sched||null, recipient_groups:r._form?.groups||[],
    form:packForm(r._form||{}), article:r.dbArt ? packArt(r.dbArt) : null, updated_by:ME, updated_at:new Date().toISOString()};
  const q = r.dbid ? SB.maker.from('articles').update(rec).eq('id', r.dbid) : SB.maker.from('articles').insert({...rec, created_by:ME});
  const {data, error} = await q.select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('ไม่มีสิทธิ์บันทึก กรุณาเข้าสู่ระบบใหม่');
  r.dbid = data[0].id;
  if (r.dbArt){ r.dbArt.id = 1e5 + r.dbid; loadReader(); }
}
async function dbDeleteRow(r){
  await r._saving;
  if (!r.dbid) return;
  const {error} = await SB.maker.from('articles').delete().eq('id', r.dbid);
  if (error) toast('ลบไม่สำเร็จ', {type:'error', desc:error.message});
}

/* ---------- Receiver ---------- */
const readKey = () => 'ms-read:' + (readerEmail || '');
function readMap(){ try { return JSON.parse(localStorage.getItem(readKey())) || {}; } catch { return {}; } }
// Read marks are kept per receiver on this browser; a "notify" edit bumps rev, so the article turns unread again
function markRead(a){
  if (!readerEmail || a.id < 1e5) return;
  const m = readMap(); m[a.id] = a.rev || 0;
  try { localStorage.setItem(readKey(), JSON.stringify(m)); } catch {}
}
async function readerLogin(id, pw){
  const btn = $('#login-form button[type=submit]'); busy(btn, true);
  const {error} = await SB.reader.auth.signInWithPassword({email:toEmail(id, 'morningspark.test'), password:pw});
  if (error){ busy(btn, false); return loginErr('f-pw', errText(error)); }
  await loadReader();
  state.loggedIn = true;
  const n = state.next; state.next = null;
  n && ARTICLES.some(a => a.id===n) ? openArticle(n) : go('feed');
}
// Which receiver group this login belongs to (tools/supabase-ms13-receivers.sql); null if not set up
async function readerGroup(email){
  const {data, error} = await SB.reader.from('receivers').select('grp').eq('email', email).maybeSingle();
  return error ? undefined : data?.grp || null;   // undefined = table not created yet
}
async function loadReader(){
  const {data:{session}} = await SB.reader.auth.getSession();
  readerEmail = session?.user?.email || null;
  if (!session) return;
  if (readerEmail !== state.whoEmail){
    const grp = await readerGroup(readerEmail);
    Object.assign(state, {whoEmail:readerEmail, who:readerEmail.split('@')[0], group:grp ?? null, groupDb:grp !== undefined});
  }
  // The database only returns this login's group's articles (or all, before MS-13 is set up)
  const [{data, error}, any] = await Promise.all([
    SB.reader.from('articles').select('id, article, updated_at')
      .in('mstatus', ['published', 'recalled']).not('article', 'is', null).order('updated_at', {ascending:false}),
    state.groupDb ? SB.reader.rpc('any_delivered') : {data:null}]);
  if (error) return console.warn('Morning Spark: could not load articles', error.message);
  const key = JSON.stringify([readerEmail, any.data, data.map(d => [d.id, d.updated_at])]);
  if (key===lastReader) return;
  lastReader = key;
  const seen = readMap(), old = new Map(ARTICLES.map(a => [a.id, a]));
  const list = data.map(d => ({...d.article, id:1e5 + d.id, _seen:old.get(1e5 + d.id)?._seen}));
  list.forEach(a => { a.read = seen[a.id] === (a.rev||0); });
  await signArticles(SB.reader, list);
  // Sample articles only until real ones exist (for anyone, not just this group); never on the branch link
  ARTICLES.splice(0, ARTICLES.length, ...(list.length || any.data || FOR==='branch' ? list : DEMO));
  renderWidget(); updateTaskbar();
  const app = $('#app');
  if (app && !app.classList.contains('hidden') && state.screen!=='login'){
    if (state.screen==='detail'){ const a = ARTICLES.find(x => x.id===state.article?.id); if (!a) return go('feed'); state.article = a; }
    render();
  }
}

/* ---------- Start ---------- */
if (ONLINE){
  const {url, key} = window.MS_SUPABASE;
  SB = {maker: supabase.createClient(url, key, {auth:{storageKey:'ms-maker'}}),
        reader: supabase.createClient(url, key, {auth:{storageKey:'ms-reader'}})};
  (async () => {
    const {data:{session}} = FOR==='branch' ? {data:{}} : await SB.maker.auth.getSession();   // branch link: no Maker
    const who = session && await makerName(session.user.email);
    if (who){ ME = who; await loadMaker(); Object.assign(M, {loggedIn:true, view:'list'}); mRender(); }
    await loadReader();
  })();
  // Pick up articles published from other computers
  const refresh = () => {
    loadReader();
    if (M.loggedIn && M.view==='list' && !M.modal && $('#maker:not(.hidden)')) loadMaker().then(rerender);
  };
  setInterval(refresh, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
}
