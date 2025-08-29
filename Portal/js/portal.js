// ======= Student Portal Logic (SUPABASE mode) =======
// Tabs
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tab-btn'); if(!btn) return;
  qa('.tab-btn').forEach(b=>b.classList.remove('active-tab'));
  btn.classList.add('active-tab');
  const id = btn.dataset.tab;
  qa('.tab-panel').forEach(p=>p.classList.add('hidden'));
  q('#'+id).classList.remove('hidden');
});

// Student Info
q('#formStudent')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.createdAt = new Date().toISOString();
  const { error } = await supabase.from('students').insert({ data: payload });
  if(error) toast('Error saving info'); else toast('Student info saved');
  e.target.reset();
  await renderStatus();
});

// Meeting
q('#formMeeting')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.createdAt = new Date().toISOString();
  const { error } = await supabase.from('meetings').insert({ data: payload });
  if(error) toast('Error booking meeting'); else toast('Meeting requested');
  e.target.reset();
  await renderStatus();
});

// Contact
q('#formContact')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.createdAt = new Date().toISOString();
  const { error } = await supabase.from('contacts').insert({ data: payload });
  if(error) toast('Error sending message'); else toast('Message saved');
  e.target.reset();
  await renderStatus();
});

// Docs
q('#formDocs')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const email = fd.get('email');
  const docType = fd.get('docType');
  const file = fd.get('file');
  if(!file || !email){ toast('Please choose a file and enter email'); return; }
  const path = `docs/${email}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('docs').upload(path, file);
  if(error){ toast('Upload failed'); return; }
  await supabase.from('documents').insert({
    email,
    doc_type: docType,
    file_name: file.name,
    url: data.path,
    size: file.size
  });
  toast('Document uploaded');
  e.target.reset();
  await renderMyDocs();
  await renderStatus();
});

async function renderMyDocs(){
  const email = q('#formDocs input[name="email"]').value || '';
  let docs = [];
  if(email){
    const { data, error } = await supabase.from('documents').select('*').eq('email', email).order('created_at', { ascending: false });
    docs = data || [];
  } else {
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    docs = data || [];
  }
  const wrap = q('#myDocs'); if(!wrap) return;
  wrap.innerHTML = docs.map(d=>`<div class="bg-white border rounded-lg p-3 text-sm">
    <div class="font-semibold">${d.doc_type}</div>
    <div class="text-xs text-gray-500 break-words">${d.file_name} · ${(d.size/1024).toFixed(1)} KB</div>
    <div class="mt-2 flex gap-2">
      <a href="https://zlevudgmhdrjxarwxwtg.supabase.co/storage/v1/object/public/docs/${d.url}" target="_blank" class="px-2 py-1 border rounded text-xs hover:bg-gray-50"><i class="fa-solid fa-download mr-1"></i>Download</a>
      <button data-id="${d.id}" class="btnDelDoc px-2 py-1 border rounded text-xs hover:bg-gray-50 text-red-600"><i class="fa-solid fa-trash mr-1"></i>Delete</button>
    </div>
  </div>`).join('') || '<div class="text-sm text-gray-500">No documents yet.</div>';
}

document.addEventListener('click', async (e)=>{
  const b = e.target.closest('.btnDelDoc'); if(!b) return;
  const id = b.dataset.id;
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if(error) toast('Delete failed');
  await renderMyDocs();
  await renderStatus();
});

async function renderStatus(){
  const infoDiv = q('#statusInfo'), meetDiv = q('#statusMeetings'), contDiv = q('#statusContacts');
  if(!infoDiv) return;
  const { data: students } = await supabase.from('students').select('*').order('created_at', { ascending: false });
  const { data: meetings } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });
  const { data: contacts } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
  infoDiv.innerHTML = students?.length? `<ul class="space-y-1">${students.map(s=>`<li><b>${s.data.firstName} ${s.data.lastName}</b> — ${s.data.email} (${s.data.program})</li>`).join('')}</ul>` : '<div class="text-gray-500">No info yet.</div>';
  meetDiv.innerHTML = meetings?.length? `<ul class="space-y-1">${meetings.map(m=>`<li>${m.data.date} ${m.data.time} — ${m.data.email} (${m.data.reason||'—'})</li>`).join('')}</ul>` : '<div class="text-gray-500">No meetings yet.</div>';
  contDiv.innerHTML = contacts?.length? `<ul class="space-y-1">${contacts.map(c=>`<li><b>${c.data.name}</b> — ${c.data.email}: ${c.data.message}</li>`).join('')}</ul>` : '<div class="text-gray-500">No messages yet.</div>';
}

window.addEventListener('DOMContentLoaded', async ()=>{
  await renderMyDocs();
  await renderStatus();
});
