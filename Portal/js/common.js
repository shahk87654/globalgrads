// ======= CONFIG =======
const MODE = 'supabase'; // 'local' | 'firebase' | 'supabase'

// Admin credentials for LOCAL mode only (change these!)
const ADMIN_EMAIL = 'admin@globalgrads.us';
const ADMIN_PASSWORD = 'admin123';

// Firebase placeholders (see README to enable)
const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'SENDER_ID',
  appId: 'APP_ID'
};
// Supabase placeholders
const SUPABASE_URL = 'https://zlevudgmhdrjxarwxwtg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZXZ1ZGdtaGRyanhhcnd4d3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Njc2MTYsImV4cCI6MjA3MjA0MzYxNn0.zgJGcUjQt5QHvQY3wLaER_pTNBSC5m9bEDp8q-z0Ijc';

// ======= UTIL =======
const q = (sel, el=document) => el.querySelector(sel);
const qa = (sel, el=document) => Array.from(el.querySelectorAll(sel));

function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg;
  t.className = 'fixed top-5 right-5 z-[999] bg-black text-white text-sm px-3 py-2 rounded shadow';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(), 2200);
}

function uid(){ return 'id_'+Math.random().toString(36).slice(2)+Date.now().toString(36); }

function saveLocal(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function loadLocal(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch(e){ return fallback; }}

function setBadge(){
  const isLocal = MODE === 'local';
  const badge1 = q('#portalModeBadge');
  const badge2 = q('#adminModeBadge');
  [badge1, badge2].filter(Boolean).forEach(b=>{
    if(isLocal){ b.textContent='Local mode'; b.className='px-3 py-1 rounded-full bg-yellow-100 text-yellow-800'; }
    else{ b.textContent=MODE+' connected'; b.className='px-3 py-1 rounded-full bg-green-100 text-green-800'; }
  });
}
document.addEventListener('DOMContentLoaded', setBadge);

// ======= EXPORT HELPERS =======
function toCSV(rows){
  if(!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = v => '"'+String(v??'').replaceAll('"','""')+'"';
  const lines = [headers.map(esc).join(',')];
  rows.forEach(r => lines.push(headers.map(h=>esc(r[h])).join(',')));
  return lines.join('\n');
}
function download(filename, content, type='text/plain'){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
