# Globalgrads — Frontend Student Portal (No Backend by Default)

This is a **pure front-end** student portal that matches your site's aesthetic: Student Info form, Meeting booking, Document upload, Contact, and an Admin dashboard. By default it saves everything in the **browser (localStorage)** for demo/testing.

> ⚠️ LocalStorage is **not secure** and is limited in size. For production, enable a free backend: **Firebase** (easiest) or **Supabase** (SQL-based). Steps below.

---

## Quick Start

1. Download the ZIP and extract.
2. Open `index.html` in your browser to preview.
3. Click **Student Portal** to submit data.
4. Open **Admin** and login with:
   - Email: `admin@globalgrads.us`
   - Password: `admin123`
5. Change these in `js/common.js`.

To deploy free:
- **Netlify**: drag the folder into Netlify app → it gives you a URL.
- **Vercel**: `vercel` CLI or drag-drop in dashboard.
- **GitHub Pages**: push to a repo → Settings → Pages → `main` branch `/root`.

---

## Files

- `index.html` — landing.
- `portal.html` — student experience.
- `admin.html` — admin login + dashboard.
- `js/common.js` — mode + configs + helpers.
- `js/portal.js` — portal logic.
- `js/admin.js` — admin logic.

Set `MODE` inside `js/common.js`:
```js
const MODE = 'local'; // 'local' | 'firebase' | 'supabase'
```

---

## Free Backend Option A — Firebase (recommended, easiest)

**What you get:** Auth, Firestore DB, Storage for files, and secure rules.

### A.1 Create project & web app
1. Go to Firebase Console → **Add project** → create.
2. In **Build → Authentication**, click **Get started**, enable **Email/Password**.
3. In **Build → Firestore Database**, create database (Start in test mode for development).
4. In **Build → Storage**, get started.
5. In **Project settings → General → Your apps**, click **Web**, register app, **copy config**.

Paste config in `js/common.js`:
```js
const FIREBASE_CONFIG = { ... };
const MODE = 'firebase';
```

### A.2 Add SDKs to HTML
Add this at the end of `portal.html` and `admin.html` just **before** your JS:
```html
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
  import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
  import { getFirestore, collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';
  import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js';
  window.__fb = { initializeApp, getAuth, signInWithEmailAndPassword, getFirestore, collection, addDoc, getDocs, query, where, getStorage, ref, uploadBytes, getDownloadURL };
  window.__fbApp = initializeApp(FIREBASE_CONFIG);
</script>
```

### A.3 Minimal Firestore usage (replace local saves)
```js
// Example (inside submit handler)
const db = __fb.getFirestore(__fbApp);
await __fb.addDoc(__fb.collection(db, 'students'), payload);
```
For documents:
```js
const storage = __fb.getStorage(__fbApp);
const fileRef = __fb.ref(storage, `docs/${payload.email}/${payload.id}-${payload.fileName}`);
await __fb.uploadBytes(fileRef, file); // use File object instead of dataUrl
payload.url = await __fb.getDownloadURL(fileRef);
// store payload (without dataUrl) in Firestore 'documents' collection
await __fb.addDoc(__fb.collection(db, 'documents'), {
  email: payload.email, docType: payload.docType, fileName: payload.fileName,
  url: payload.url, size: payload.size, createdAt: new Date().toISOString()
});
```

### A.4 Secure Rules (starter; tighten later)
**Firestore**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
**Storage**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### A.5 Admin login
- Create an admin user in **Authentication**.
- Replace local login with Firebase `signInWithEmailAndPassword` and then show dashboard.
- (Optional) Store roles in Firestore, e.g., `roles.admin = true` and check before showing data.

---

## Free Backend Option B — Supabase (Postgres + Storage)

1. Create project at supabase.com → copy **Project URL** and **anon key**.
2. In `js/common.js` set:
```js
const MODE = 'supabase';
const SUPABASE_URL = 'https://YOUR.supabase.co';
const SUPABASE_ANON_KEY = '...';
```
3. Include client:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
</script>
```
4. Create tables (`SQL Editor`):
```sql
create table students (id uuid primary key default gen_random_uuid(), data jsonb, created_at timestamp default now());
create table meetings (id uuid primary key default gen_random_uuid(), data jsonb, created_at timestamp default now());
create table contacts (id uuid primary key default gen_random_uuid(), data jsonb, created_at timestamp default now());
create table documents (id uuid primary key default gen_random_uuid(), email text, doc_type text, file_name text, url text, size int, created_at timestamp default now());
```
5. Use **Storage** bucket `docs` for file uploads.

---

## Optional: Email from Contact Form (EmailJS)

1. Go to emailjs.com → create account → add email service → create template.
2. Include SDK:
```html
<script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>
<script> emailjs.init('YOUR_PUBLIC_KEY'); </script>
```
3. In `portal.js` contact submit, call:
```js
emailjs.send('service_id','template_id', { from_name: name, from_email: email, message });
```

---

## Step-by-step You Can Follow

1. **Test locally**: open `portal.html`, submit sample data.
2. **Deploy** (Netlify easiest): New site → Drag the folder → done.
3. **Pick a backend** (Firebase recommended).
4. **Switch MODE** in `js/common.js` to `firebase` or `supabase` and fill keys.
5. **Replace local save** blocks with DB/Storage calls (snippets above).
6. **Use real auth** for admin, then tighten security rules.
7. **(Optional)** hook Calendly link or Google Calendar API in Meeting tab.

---

## Notes

- Local mode cannot share data across different browsers/devices and may hit size limits for big PDFs. For real usage, move to Firebase/Supabase quickly.
- Styling matches the Globalgrads palette.
