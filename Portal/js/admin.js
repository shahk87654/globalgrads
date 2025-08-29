// ======= Admin Logic (SUPABASE mode) =======
async function fetchTable(table) {
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) { toast('Error loading '+table); return []; }
  return data;
}

async function renderAll() {
  // Students
  const students = await fetchTable('students');
  renderTable('#tblStudents', students.map(s => ({ ...s.data, createdAt: s.created_at })), [
    {key:'createdAt', label:'Created'},
    {key:'firstName', label:'First'},
    {key:'lastName', label:'Last'},
    {key:'email', label:'Email'},
    {key:'phone', label:'Phone'},
    {key:'program', label:'Program'},
    {key:'gpa', label:'GPA'},
    {key:'englishTest', label:'IELTS/TOEFL'},
    {key:'targetCountry', label:'Target'}
  ]);
  // Meetings
  const meetings = await fetchTable('meetings');
  renderTable('#tblMeetings', meetings.map(m => ({ ...m.data, createdAt: m.created_at })), [
    {key:'createdAt', label:'Created'},
    {key:'email', label:'Email'},
    {key:'date', label:'Date'},
    {key:'time', label:'Time'},
    {key:'reason', label:'Reason'},
    {key:'notes', label:'Notes'}
  ]);
  // Contacts
  const contacts = await fetchTable('contacts');
  renderTable('#tblContacts', contacts.map(c => ({ ...c.data, createdAt: c.created_at })), [
    {key:'createdAt', label:'Created'},
    {key:'name', label:'Name'},
    {key:'email', label:'Email'},
    {key:'message', label:'Message'}
  ]);
  // Documents
  const docs = await fetchTable('documents');
  renderDocs(docs);
}

function renderTable(targetSel, rows, columns){
  const wrap = q(targetSel);
  if(!rows?.length){ wrap.innerHTML = '<div class="text-gray-500 text-sm">No records.</div>'; return; }
  const thead = '<thead><tr>'+columns.map(c=>`<th class="px-2 py-1 text-left border-b">${c.label}</th>`).join('')+'</tr></thead>';
  const tbody = '<tbody>'+rows.map(r=>'<tr>'+columns.map(c=>`<td class="px-2 py-1 border-b align-top">${(r[c.key]??'')}</td>`).join('')+'</tr>').join('')+'</tbody>';
  wrap.innerHTML = `<table class="w-full text-xs">${thead}${tbody}</table>`;
}

function renderDocs(docs){
  const wrap = q('#tblDocs');
  wrap.innerHTML = docs.map(d=>`<div class="bg-white border rounded-lg p-3 text-sm">
    <div class="font-semibold">${d.doc_type} — ${d.email}</div>
    <div class="text-xs text-gray-500 break-words">${d.file_name} · ${(d.size/1024).toFixed(1)} KB</div>
    <div class="mt-2 flex gap-2">
      <a href="https://zlevudgmhdrjxarwxwtg.supabase.co/storage/v1/object/public/docs/${d.url}" target="_blank" class="px-2 py-1 border rounded text-xs hover:bg-gray-50"><i class="fa-solid fa-download mr-1"></i>Download</a>
      <button data-id="${d.id}" class="btnDelDoc px-2 py-1 border rounded text-xs hover:bg-gray-50 text-red-600"><i class="fa-solid fa-trash mr-1"></i>Delete</button>
    </div>
  </div>`).join('') || '<div class="text-sm text-gray-500">No documents uploaded.</div>';
}

document.addEventListener('click', async (e)=>{
  const b = e.target.closest('.btnDelDoc'); if(!b) return;
  const id = b.dataset.id;
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if(error) toast('Delete failed');
  await renderAll();
});

window.addEventListener('DOMContentLoaded', renderAll);

// Export & Clear
q('#btnExportAll')?.addEventListener('click', ()=>{
  const bundle = {
    students: loadLocal(LS_KEYS.students, []),
    meetings: loadLocal(LS_KEYS.meetings, []),
    contacts: loadLocal(LS_KEYS.contacts, []),
    documents: loadLocal(LS_KEYS.documents, []).map(d=>({ ...d, dataUrl: '(omitted in export to save size)' }))
  };
  download('globalgrads-all-data.json', JSON.stringify(bundle, null, 2), 'application/json');
});

q('#btnClearAll')?.addEventListener('click', ()=>{
  if(!confirm('This removes local demo data for everyone on this browser. Continue?')) return;
  Object.values(LS_KEYS).forEach(k=>localStorage.removeItem(k));
  renderAll();
});

// CSV exports
qa('.btnCsv').forEach(btn=>btn.addEventListener('click', ()=>{
  const table = btn.dataset.table;
  const map = {
    students: loadLocal(LS_KEYS.students, []),
    meetings: loadLocal(LS_KEYS.meetings, []),
    contacts: loadLocal(LS_KEYS.contacts, [])
  };
  const rows = map[table] || [];
  if(!rows.length){ toast('No rows'); return; }
  const csv = toCSV(rows);
  download(`${table}.csv`, csv, 'text/csv');
}));

function renderTable(targetSel, rows, columns){
  const wrap = q(targetSel);
  if(!rows?.length){ wrap.innerHTML = '<div class="text-gray-500 text-sm">No records.</div>'; return; }
  const thead = '<thead><tr>'+columns.map(c=>`<th class="px-2 py-1 text-left border-b">${c.label}</th>`).join('')+'</tr></thead>';
  const tbody = '<tbody>'+rows.map(r=>'<tr>'+columns.map(c=>`<td class="px-2 py-1 border-b align-top">${(r[c.key]??'')}</td>`).join('')+'</tr>').join('')+'</tbody>';
  wrap.innerHTML = `<table class="w-full text-xs">${thead}${tbody}</table>`;
}

function renderDocs(){
  const docs = loadLocal(LS_KEYS.documents, []);
  const wrap = q('#tblDocs');
  wrap.innerHTML = docs.map(d=>`<div class="bg-white border rounded-lg p-3 text-sm">
    <div class="font-semibold">${d.docType} — ${d.email}</div>
    <div class="text-xs text-gray-500 break-words">${d.fileName} · ${(d.size/1024).toFixed(1)} KB</div>
    <div class="mt-2 flex gap-2">
      <a download="${d.fileName}" href="${d.dataUrl}" class="px-2 py-1 border rounded text-xs hover:bg-gray-50"><i class="fa-solid fa-download mr-1"></i>Download</a>
      <button data-id="${d.id}" class="btnDelDoc px-2 py-1 border rounded text-xs hover:bg-gray-50 text-red-600"><i class="fa-solid fa-trash mr-1"></i>Delete</button>
    </div>
  </div>`).join('') || '<div class="text-sm text-gray-500">No documents uploaded.</div>';
}
document.addEventListener('click', (e)=>{
  const b = e.target.closest('.btnDelDoc'); if(!b) return;
  const id = b.dataset.id;
  const docs = loadLocal(LS_KEYS.documents, []);
  saveLocal(LS_KEYS.documents, docs.filter(d=>d.id!==id));
  renderDocs();
});

function renderAll(){
  renderTable('#tblStudents', loadLocal(LS_KEYS.students, []), [
    {key:'createdAt', label:'Created'},
    {key:'firstName', label:'First'},
    {key:'lastName', label:'Last'},
    {key:'email', label:'Email'},
    {key:'phone', label:'Phone'},
    {key:'program', label:'Program'},
    {key:'gpa', label:'GPA'},
    {key:'englishTest', label:'IELTS/TOEFL'},
    {key:'targetCountry', label:'Target'}
  ]);
  renderTable('#tblMeetings', loadLocal(LS_KEYS.meetings, []), [
    {key:'createdAt', label:'Created'},
    {key:'email', label:'Email'},
    {key:'date', label:'Date'},
    {key:'time', label:'Time'},
    {key:'reason', label:'Reason'},
    {key:'notes', label:'Notes'}
  ]);
  renderTable('#tblContacts', loadLocal(LS_KEYS.contacts, []), [
    {key:'createdAt', label:'Created'},
    {key:'name', label:'Name'},
    {key:'email', label:'Email'},
    {key:'message', label:'Message'}
  ]);
  renderDocs();
}

async function uploadDoc(file) {
  // unique path per user or global admin folder
  const path = `admin/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('docs').upload(path, file);
  if (error) throw error;

  // save a record in documents table (optional, for listing)
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('documents').insert([{
    user_id: user?.id,
    email: user?.email,
    doc_type: 'admin_upload',
    file_name: file.name,
    url: data.path,
    size: file.size
  }]);

  // if you made the bucket public, you can get a public URL:
  // const { data: pub } = supabase.storage.from('docs').getPublicUrl(data.path);
  // return pub.publicUrl;

  return data.path;
}
