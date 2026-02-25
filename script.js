document.addEventListener('DOMContentLoaded', () => {
  // Navigation toggle for small screens
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.style.display = open ? 'none' : 'flex';
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a.nav-link, a.btn[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
      // close mobile nav
      if (window.innerWidth < 800 && nav) { nav.style.display = 'none'; toggle.setAttribute('aria-expanded','false'); }
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Phrase button audio feedback (simple): small visual pulse
  document.querySelectorAll('.phrase').forEach(btn => btn.addEventListener('click', () => {
    btn.animate([{transform:'scale(1)'},{transform:'scale(1.03)'},{transform:'scale(1)'}],{duration:220});
  }));

  // Small parallax effect for hero blob
  const blob = document.querySelector('.hero-blob');
  window.addEventListener('mousemove', (e) => {
    if (!blob) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    blob.style.transform = `translate(${x}px, ${y}px)`;
  });

  // ---- Firebase demo logic (compat build) ----
  // Replace the config values with your Firebase project details to enable.
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  if (window.firebase && firebase.apps && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = window.firebase ? firebase.auth() : null;
  const db = window.firebase ? firebase.firestore() : null;
  const storage = window.firebase ? firebase.storage() : null;

  // Wire up auth UI
  const googleBtn = document.getElementById('google-signin');
  const signOutBtn = document.getElementById('sign-out');
  const emailFormBtn = document.getElementById('email-signin');
  const emailInput = document.getElementById('email');
  const pwInput = document.getElementById('password');
  const userInfo = document.getElementById('user-info');
  const signedOut = document.getElementById('signed-out');
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  const firestoreDemo = document.getElementById('firestore-demo');
  const saveBtn = document.getElementById('save-msg');
  const msgInput = document.getElementById('msg-input');
  const msgsList = document.getElementById('messages');

  if (auth) {
    googleBtn?.addEventListener('click', () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch(console.error);
    });
    signOutBtn?.addEventListener('click', () => auth.signOut());
    emailFormBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const email = emailInput.value;
      const pw = pwInput.value;
      auth.createUserWithEmailAndPassword(email, pw).catch(err => {
        if (err.code === 'auth/email-already-in-use') {
          auth.signInWithEmailAndPassword(email, pw).catch(console.error);
        } else console.error(err);
      });
    });

    auth.onAuthStateChanged(user => {
      if (user) {
        userInfo?.removeAttribute('hidden');
        signedOut?.setAttribute('hidden','true');
        firestoreDemo?.removeAttribute('hidden');
        if (userName) userName.textContent = user.displayName || user.uid;
        if (userEmail) userEmail.textContent = user.email || '';
        loadMessages();
      } else {
        userInfo?.setAttribute('hidden','true');
        signedOut?.removeAttribute('hidden');
        firestoreDemo?.setAttribute('hidden','true');
        if (msgsList) msgsList.innerHTML = '';
      }
    });

    saveBtn?.addEventListener('click', async () => {
      const text = msgInput.value.trim();
      if (!text) return;
      const user = auth.currentUser;
      await db.collection('messages').add({ uid: user ? user.uid : null, text, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      msgInput.value = '';
    });

    // Storage upload logic
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const progressWrap = document.getElementById('upload-progress');
    const progressBar = document.getElementById('upload-bar');
    const uploadUrl = document.getElementById('upload-url');

    uploadBtn?.addEventListener('click', async () => {
      if (!storage) return alert('Storage not initialized. Replace firebaseConfig to enable.');
      const file = fileInput?.files?.[0];
      if (!file) return alert('Choose a file first.');
      const user = auth.currentUser;
      const path = `uploads/${user ? user.uid : 'anon'}/${Date.now()}_${file.name}`;
      const storageRef = storage.ref().child(path);
      const uploadTask = storageRef.put(file);
      progressWrap.style.display = '';
      uploadTask.on('state_changed', snapshot => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = pct + '%';
      }, err => {
        console.error(err);
        alert('Upload failed');
      }, async () => {
        const url = await uploadTask.snapshot.ref.getDownloadURL();
        uploadUrl.innerHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        // Optionally save metadata to Firestore
        if (db) {
          await db.collection('uploads').add({ path, url, uid: user ? user.uid : null, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        }
      });
    });

    function loadMessages() {
      db.collection('messages').orderBy('createdAt','desc').limit(12).onSnapshot(snapshot => {
        if (!msgsList) return;
        msgsList.innerHTML = '';
        snapshot.forEach(doc => {
          const d = doc.data();
          const li = document.createElement('li');
          const time = d.createdAt && d.createdAt.toDate ? d.createdAt.toDate().toLocaleString() : '';
          li.textContent = `${d.text} — ${d.uid || 'anon'} ${time}`;
          msgsList.appendChild(li);
        });
      });
    }
  }

});
document.addEventListener('DOMContentLoaded',()=>{
  // Visa form
  const form=document.getElementById('visa-form');
  const result=document.getElementById('visa-result');
  const clearBtn=document.getElementById('clear-btn');

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const data=new FormData(form);
    const name=data.get('name');
    const nat=data.get('nationality');
    const days=data.get('days');
    const reason=data.get('reason');
    result.classList.remove('hidden');
    result.innerHTML=`<h4>Application received</h4><p>Hallo ${escapeHtml(name)} from ${escapeHtml(nat)} — your playful ${escapeHtml(reason)} application for ${escapeHtml(days)} days has been recorded. Danke!</p>`;
    // add a little success animation
    result.classList.add('success');
    setTimeout(()=>result.classList.remove('success'),2200);
    result.scrollIntoView({behavior:'smooth'});
  });

  clearBtn.addEventListener('click',()=>{form.reset(); result.classList.add('hidden')});

  // Phrases: speak using SpeechSynthesis
  document.querySelectorAll('.phrase').forEach(card=>{
    const text=card.dataset.text||card.querySelector('strong').innerText;
    const btn=card.querySelector('.speak');
    btn.addEventListener('click',()=>speak(text));
    card.addEventListener('click',(ev)=>{if(ev.target===card) speak(text)});
  });

  function speak(txt){
    if(!window.speechSynthesis) return alert('Speech synthesis not supported in this browser.');
    const utter=new SpeechSynthesisUtterance(txt);
    utter.lang='de-DE';
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  // Reveal on scroll
  const reveals=document.querySelectorAll('.card, .phrase, .city, .hero');
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        e.target.classList.remove('reveal');
      }
    });
  },{threshold:0.12});
  reveals.forEach(r=>{r.classList.add('reveal');obs.observe(r)});

  // Gallery modal for cities
  const modal=document.getElementById('gallery-modal');
  const modalImage=document.getElementById('modal-image');
  const modalCaption=document.getElementById('modal-caption');
  const modalClose=document.getElementById('modal-close');
  document.querySelectorAll('.city').forEach(card=>{
    card.addEventListener('click',()=>{
      const img=card.dataset.image || card.querySelector('img')?.src;
      if(!img) return;
      modalImage.src=img;
      modalCaption.textContent=card.querySelector('h4')?.innerText || '';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    });
  });
  modalClose.addEventListener('click',closeModal);
  modal.addEventListener('click',(e)=>{if(e.target===modal) closeModal()});
  function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');modalImage.src=''}

  // Tilt effect for .tilt cards
  document.querySelectorAll('.tilt').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const rect=el.getBoundingClientRect();
      const x=(e.clientX-rect.left)/rect.width - 0.5;
      const y=(e.clientY-rect.top)/rect.height - 0.5;
      el.style.setProperty('--rx', `${(-y*8).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x*10).toFixed(2)}deg`);
    });
    el.addEventListener('mouseleave',()=>{
      el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');
    });
  });

  // Parallax tiny movement for flag-card
  const flag=document.querySelector('.flag-card');
  if(flag){
    document.addEventListener('mousemove',e=>{
      const x=(e.clientX/window.innerWidth-0.5)*6;
      const y=(e.clientY/window.innerHeight-0.5)*6;
      flag.style.transform=`translate(${x}px,${y}px)`;
    });
  }

  // Open 'Learn more' external links in new tabs
  document.querySelectorAll('[data-ext]').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      const url=a.dataset.ext;
      window.open(url,'_blank','noopener');
    });
  });

  // Staggered entrance (extra punch on load)
  const title=document.querySelector('.home-title');
  const sub=document.querySelector('.home-sub');
  const ctas=document.querySelectorAll('.home-cta .btn');
  if(title) title.style.willChange='transform,opacity';
  if(sub) sub.style.willChange='transform,opacity';
  setTimeout(()=>{if(title) title.classList.add('visible')},80);
  setTimeout(()=>{if(sub) sub.classList.add('visible')},200);
  ctas.forEach((b,i)=>setTimeout(()=>b.classList.add('visible'),320 + i*80));

  // CTA particle burst
  function burstAt(el){
    const rect=el.getBoundingClientRect();
    for(let i=0;i<14;i++){
      const p=document.createElement('span');
      p.className='particle';
      const size = 6 + Math.floor(Math.random()*12);
      p.style.width = size+'px'; p.style.height = size+'px';
      p.style.left = (rect.left + rect.width/2 + (Math.random()-0.5)*rect.width*0.6)+'px';
      p.style.top = (rect.top + rect.height/2 + (Math.random()-0.5)*rect.height*0.4)+'px';
      p.style.background = ['#2BB2FF','#6E4CFF','#FFCC66','#FF6B6B'][Math.floor(Math.random()*4)];
      p.style.opacity = '1';
      p.style.position = 'fixed';
      const angle = Math.random()*Math.PI*2;
      const distance = 60 + Math.random()*120;
      const dx = Math.cos(angle)*distance; const dy = Math.sin(angle)*distance;
      p.style.transition = `transform 800ms cubic-bezier(.2,.9,.2,1), opacity 900ms ease`;
      document.body.appendChild(p);
      requestAnimationFrame(()=>{
        p.style.transform = `translate(${dx}px, ${dy}px) scale(${0.4 + Math.random()*0.9})`;
        p.style.opacity = '0';
      });
      setTimeout(()=>p.remove(),950);
    }
  }
  document.querySelectorAll('.btn.enter').forEach(b=>{
    b.addEventListener('click',async(e)=>{
      e.preventDefault();
      const href = b.getAttribute('href') || b.href || 'index.html';
      // immediate particle burst
      burstAt(e.currentTarget);

      // prepare overlay visuals
      const overlay = document.getElementById('multiverse-overlay');
      if(overlay){
        if(!overlay.querySelector('.stars')){ const s=document.createElement('div'); s.className='stars'; overlay.appendChild(s); }
        overlay.classList.add('play-multiverse');
        overlay.style.opacity = '1';
      }
      document.body.classList.add('multiverse-open');

      // small ripple centered on button
      const rect = b.getBoundingClientRect();
      const ripple = document.createElement('div'); ripple.className='mv-ripple';
      ripple.style.left = (rect.left + rect.width/2) + 'px'; ripple.style.top = (rect.top + rect.height/2) + 'px';
      document.body.appendChild(ripple);
      requestAnimationFrame(()=>ripple.classList.add('play'));

      // canvas particle field (more particles for dramatic effect)
      const canvas = document.createElement('canvas'); canvas.id='mv-canvas'; canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const PARTICLES = 140; const parts = [];
      for(let i=0;i<PARTICLES;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = 4 + Math.random()*10;
        parts.push({
          x: window.innerWidth/2,
          y: window.innerHeight/2,
          vx: Math.cos(angle)*speed,
          vy: Math.sin(angle)*speed,
          r: 1 + Math.random()*6,
          life: 800 + Math.random()*700,
          age: 0,
          color: ['#2BB2FF','#6E4CFF','#FFCC66','#FF6B6B','#8AFFC1'][Math.floor(Math.random()*5)]
        });
      }

      let last = performance.now();
      function frame(now){
        const dt = now - last; last = now;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        parts.forEach(p=>{
          p.age += dt;
          const t = p.age / p.life;
          p.x += p.vx * (1 + 0.6*t) * (dt/16);
          p.y += p.vy * (1 + 0.6*t) * (dt/16);
          ctx.globalAlpha = Math.max(0, 1 - t);
          const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
        });
      }

      let raf = performance.now();
      function loop(now){ frame(now); raf = requestAnimationFrame(loop); }
      raf = requestAnimationFrame(loop);

      // text scramble effect for the title
      function scrambleText(el,ms=800){
        if(!el) return;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:',.<>/?";
        const original = el.innerText; let elapsed = 0; const interval = 40;
        const iv = setInterval(()=>{
          elapsed += interval;
          let out = '';
          for(let i=0;i<original.length;i++){
            if(Math.random() < (elapsed/ms)) out += original[i]; else out += chars[Math.floor(Math.random()*chars.length)];
          }
          el.innerText = out;
          if(elapsed >= ms){ clearInterval(iv); el.innerText = original; }
        }, interval);
      }
      scrambleText(document.querySelector('.home-title'),900);

      // duration for main cinematic sequence
      const DURATION = 1200;
      await new Promise(r=>setTimeout(r, DURATION));

      // fade overlay a little and stop canvas
      if(overlay) overlay.style.opacity = '0.95';
      cancelAnimationFrame(raf);

      // fetch and replace body content from index.html in same tab
      try{
        const res = await fetch(href, {cache:'no-store'});
        if(res.ok){
          const text = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          // replace body
          document.body.innerHTML = doc.body.innerHTML;
          // re-run scripts from fetched document
          const scripts = doc.querySelectorAll('script');
          scripts.forEach(s=>{
            const ns = document.createElement('script');
            if(s.src){ ns.src = s.src; ns.async = false; document.body.appendChild(ns); }
            else{ ns.textContent = s.textContent; document.body.appendChild(ns); }
          });
        }
      }catch(err){
        console.error('Failed to load target content:', err);
        // fallback: navigate if fetch fails
        window.location.href = href;
      }

      // cleanup visuals
      ripple.remove(); canvas.remove(); if(overlay) overlay.remove();
    });
  });

  // Small accessible focus helpers: open home hero enter button in new tab when modifier pressed
  document.querySelectorAll('a[target="_blank"]').forEach(a=>a.setAttribute('rel','noopener noreferrer'));

  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
});

// Additional UI: theme toggle, flashcard practice with SpeechRecognition
document.addEventListener('DOMContentLoaded', ()=>{
  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  const body = document.body;
  const saved = localStorage.getItem('theme');
  if(saved === 'light') body.classList.add('light');
  function updateThemeUI(){ themeBtn.textContent = body.classList.contains('light') ? '☀️' : '🌙'; }
  updateThemeUI();
  themeBtn?.addEventListener('click', ()=>{
    body.classList.toggle('light');
    localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark');
    updateThemeUI();
  });

  // Build phrases list from buttons
  const phraseBtns = Array.from(document.querySelectorAll('.phrase'));
  const phrases = phraseBtns.map(b=>{
    const parts = b.textContent.split('—');
    const german = (parts[0]||b.dataset.text||b.textContent).trim();
    const english = (parts[1]||'').trim();
    return {german, english};
  }).filter(p=>p.german);

  // Flashcard modal elements
  const practiceBtn = document.getElementById('practice-phrases');
  const modal = document.getElementById('flashcard-modal');
  const closeBtn = document.getElementById('flashcard-close');
  const flashGerman = document.getElementById('flash-german');
  const flashEnglish = document.getElementById('flash-english');
  const flashPlay = document.getElementById('flash-play');
  const flashRecord = document.getElementById('flash-record');
  const flashNext = document.getElementById('flash-next');
  const flashResult = document.getElementById('flash-result');
  let idx = 0;
  function openModal(i=0){ idx = i; if(modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); show(idx); } }
  function closeModal(){ if(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); flashResult.textContent=''; } }
  practiceBtn?.addEventListener('click', ()=> openModal(0));
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

  function show(i){ const p = phrases[i]; if(!p) return; flashGerman.textContent = p.german; flashEnglish.textContent = p.english || ''; flashResult.textContent = ''; }

  // Speech synthesis helper (local to this scope)
  function speakLocal(text){ if(!window.speechSynthesis) return; const u=new SpeechSynthesisUtterance(text); u.lang='de-DE'; speechSynthesis.cancel(); speechSynthesis.speak(u); }
  flashPlay?.addEventListener('click', ()=> speakLocal(phrases[idx]?.german || ''));

  // Simple Levenshtein distance
  function levenshtein(a,b){ a = a||''; b = b||''; const m=a.length, n=b.length; if(!m) return n; if(!n) return m; const dp = Array.from({length:m+1}, ()=> new Array(n+1).fill(0)); for(let i=0;i<=m;i++) dp[i][0]=i; for(let j=0;j<=n;j++) dp[0][j]=j; for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){ const cost = a[i-1]===b[j-1] ? 0 : 1; dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost); } return dp[m][n]; }

  // Normalize text (lowercase, remove punctuation)
  function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9\s]/gi,'').trim(); }

  // SpeechRecognition wrapper returning Promise<string>
  function recognizeOnce(timeout=6000){ return new Promise((resolve,reject)=>{
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRec) return reject(new Error('SpeechRecognition not supported'));
    const r = new SpeechRec(); r.lang='de-DE'; r.interimResults = false; r.maxAlternatives = 1;
    let done=false;
    r.onresult = (ev)=>{ if(done) return; done=true; const t = ev.results[0][0].transcript || ''; resolve(t); r.stop(); };
    r.onerror = (e)=>{ if(done) return; done=true; reject(e); };
    r.onend = ()=>{ if(done) return; done=true; resolve(''); };
    try{ r.start(); }catch(err){ return reject(err); }
    setTimeout(()=>{ if(!done){ done=true; try{ r.stop(); }catch(e){} resolve(''); } }, timeout);
  }); }

  flashRecord?.addEventListener('click', async ()=>{
    flashResult.textContent = 'Listening...';
    try{
      const transcript = await recognizeOnce(7000);
      if(!transcript){ flashResult.textContent = 'No speech detected. Try again.'; return; }
      const target = norm(phrases[idx].german);
      const heard = norm(transcript);
      const dist = levenshtein(target, heard);
      const maxLen = Math.max(target.length, heard.length, 1);
      const score = Math.max(0, Math.round((1 - dist/maxLen) * 100));
      flashResult.textContent = `You said: "${transcript}" — score: ${score}%`;
      if(score > 70) flashResult.textContent += ' — Good!';
    }catch(err){ flashResult.textContent = 'Microphone unavailable or permission denied.'; }
  });

  flashNext?.addEventListener('click', ()=>{ idx = (idx + 1) % phrases.length; show(idx); });
});
