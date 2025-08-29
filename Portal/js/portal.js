// ======= Student Portal Logic (LOCAL default) =======
const LS_KEYS = {
  students: 'gg_students',
  meetings: 'gg_meetings',
  contacts: 'gg_contacts',
  documents: 'gg_documents'
};

// Tabs
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tab-btn'); if(!btn) return;
  qa('.tab-btn').forEach(b=>b.classList.remove('active-tab'));
  btn.classList.add('active-tab');
  const id = btn.dataset.tab;
  qa('.tab-panel').forEach(p=>p.classList.add('hidden'));
  q('#'+id).classList.remove('hidden');
});

// Clear local data (for quick testing)
q('#btnClearLocal')?.addEventListener('click', ()=>{
  Object.values(LS_KEYS).forEach(k=>localStorage.removeItem(k));
  toast('Local data cleared');
  renderMyDocs();
  renderStatus();
});

// Student Info
q('#formStudent')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.id = uid();
  payload.createdAt = new Date().toISOString();

  const arr = loadLocal(LS_KEYS.students, []);
  arr.push(payload); saveLocal(LS_KEYS.students, arr);
  toast('Student info saved');
  e.target.reset();
  renderStatus();
});

// Meeting
q('#formMeeting')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.id = uid();
  payload.createdAt = new Date().toISOString();

  const arr = loadLocal(LS_KEYS.meetings, []);
  arr.push(payload); saveLocal(LS_KEYS.meetings, arr);
  toast('Meeting requested');
  e.target.reset();
  renderStatus();
});

// Contact
q('#formContact')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.id = uid();
  payload.createdAt = new Date().toISOString();

  const arr = loadLocal(LS_KEYS.contacts, []);
  arr.push(payload); saveLocal(LS_KEYS.contacts, arr);
  toast('Message saved');
  e.target.reset();
  renderStatus();
});

// Docs
q('#formDocs')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email');
  const docType = fd.get('docType');
  const file = fd.get('file');
  if(!file || !email){ toast('Please choose a file and enter email'); return; }

  const dataUrl = await new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

  const payload = {
    id: uid(),
    email, docType,
    fileName: file.name,
    size: file.size,
    type: file.type,
    dataUrl, // WARNING: big files may exceed localStorage limits
    createdAt: new Date().toISOString()
  };
  const arr = loadLocal(LS_KEYS.documents, []);
  arr.push(payload); saveLocal(LS_KEYS.documents, arr);
  toast('Document stored locally');
  e.target.reset();
  renderMyDocs();
  renderStatus();
});

function renderMyDocs(){
  const email = q('#formDocs input[name="email"]').value || '';
  const docs = loadLocal(LS_KEYS.documents, []).filter(d=> !email || d.email===email);
  const wrap = q('#myDocs'); if(!wrap) return;
  wrap.innerHTML = docs.map(d=>`<div class="bg-white border rounded-lg p-3 text-sm">
    <div class="font-semibold">${d.docType}</div>
    <div class="text-xs text-gray-500 break-words">${d.fileName} · ${(d.size/1024).toFixed(1)} KB</div>
    <div class="mt-2 flex gap-2">
      <a download="${d.fileName}" href="${d.dataUrl}" class="px-2 py-1 border rounded text-xs hover:bg-gray-50"><i class="fa-solid fa-download mr-1"></i>Download</a>
      <button data-id="${d.id}" class="btnDelDoc px-2 py-1 border rounded text-xs hover:bg-gray-50 text-red-600"><i class="fa-solid fa-trash mr-1"></i>Delete</button>
    </div>
  </div>`).join('') || '<div class="text-sm text-gray-500">No documents yet.</div>';
}
document.addEventListener('click', (e)=>{
  const b = e.target.closest('.btnDelDoc'); if(!b) return;
  const id = b.dataset.id;
  const docs = loadLocal(LS_KEYS.documents, []);
  saveLocal(LS_KEYS.documents, docs.filter(d=>d.id!==id));
  renderMyDocs();
  renderStatus();
});

// Status
function renderStatus(){
  const infoDiv = q('#statusInfo'), meetDiv = q('#statusMeetings'), contDiv = q('#statusContacts');
  if(!infoDiv) return;
  const students = loadLocal(LS_KEYS.students, []);
  const meetings = loadLocal(LS_KEYS.meetings, []);
  const contacts = loadLocal(LS_KEYS.contacts, []);

  infoDiv.innerHTML = students.length? `<ul class="space-y-1">${students.map(s=>`<li><b>${s.firstName} ${s.lastName}</b> — ${s.email} (${s.program})</li>`).join('')}</ul>` : '<div class="text-gray-500">No info yet.</div>';
  meetDiv.innerHTML = meetings.length? `<ul class="space-y-1">${meetings.map(m=>`<li>${m.date} ${m.time} — ${m.email} (${m.reason||'—'})</li>`).join('')}</ul>` : '<div class="text-gray-500">No meetings yet.</div>';
  contDiv.innerHTML = contacts.length? `<ul class="space-y-1">${contacts.map(c=>`<li><b>${c.name}</b> — ${c.email}: ${c.message}</li>`).join('')}</ul>` : '<div class="text-gray-500">No messages yet.</div>';
}
renderMyDocs();
renderStatus();

q('#btnExportMyData')?.addEventListener('click', ()=>{
  const bundle = {
    students: loadLocal(LS_KEYS.students, []),
    meetings: loadLocal(LS_KEYS.meetings, []),
    contacts: loadLocal(LS_KEYS.contacts, []),
    documents: loadLocal(LS_KEYS.documents, []).map(d=>({ ...d, dataUrl: '(omitted in export to save size)' }))
  };
  download('my-globalgrads-data.json', JSON.stringify(bundle, null, 2), 'application/json');
});
