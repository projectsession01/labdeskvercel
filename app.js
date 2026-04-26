/* ===================== DATA ===================== */
const APPS = [
  { name: 'Chrome', icon: '🌐', url: null, action: () => showToast('Open Chrome from your taskbar!'), color: '#4285F4' },
  { name: 'YouTube', icon: '▶️', url: 'https://youtube.com', color: '#FF0000' },
  { name: 'VS Code', icon: '💙', url: '/monaco.html', color: '#007ACC' },
  { name: 'GitHub', icon: '🐙', url: 'https://github.com', color: '#6e5494' },
  { name: 'Google', icon: '🔎', url: 'https://google.com', color: '#4285F4' },
  { name: 'Drive', icon: '📁', url: 'https://drive.google.com', color: '#00AC47' },
  { name: 'Gmail', icon: '📧', url: 'https://mail.google.com', color: '#EA4335' },
  { name: 'Meet', icon: '📹', url: 'https://meet.google.com', color: '#00897B' },
  { name: 'Docs', icon: '📄', url: 'https://docs.google.com', color: '#4285F4' },
  { name: 'Sheets', icon: '📊', url: 'https://sheets.google.com', color: '#0F9D58' },
  { name: 'Slides', icon: '📑', url: 'https://slides.google.com', color: '#F4B400' },
  { name: 'Classroom', icon: '🎓', url: 'https://classroom.google.com', color: '#00BFA5' },
  { name: 'Stack Overflow', icon: '💬', url: 'https://stackoverflow.com', color: '#F48024' },
  { name: 'LeetCode', icon: '⚡', url: 'https://leetcode.com', color: '#FFA116' },
  { name: 'Compiler', icon: '🔧', url: 'https://onlinegdb.com', color: '#00d4aa' },
  { name: 'Figma', icon: '🎨', url: 'https://figma.com', color: '#F24E1E' },
  { name: 'Notion', icon: '📓', url: 'https://notion.so', color: '#ffffff' },
  { name: 'ChatGPT', icon: '🤖', url: 'https://chat.openai.com', color: '#10a37f' },
  { name: 'Overleaf', icon: '📰', url: 'https://overleaf.com', color: '#47A141' },
  { name: 'Calculator', icon: '🧮', url: null, action: () => window.open('calculator://', '_self') || showToast('Open Calculator from Start Menu'), color: '#555' },
];

const RESOURCES = [
  { name: 'GeeksforGeeks', cat: 'CS Concepts', icon: '🟩', url: 'https://geeksforgeeks.org' },
  { name: 'W3Schools', cat: 'Web Dev', icon: '🟧', url: 'https://w3schools.com' },
  { name: 'MDN Docs', cat: 'Web Reference', icon: '🔵', url: 'https://developer.mozilla.org' },
  { name: 'NumPy Docs', cat: 'Python', icon: '🐍', url: 'https://numpy.org/doc' },
  { name: 'NPTEL', cat: 'Lecture Videos', icon: '🎓', url: 'https://nptel.ac.in' },
  { name: 'MIT OCW', cat: 'Free Courses', icon: '🏛️', url: 'https://ocw.mit.edu' },
  { name: 'Coursera', cat: 'Courses', icon: '📘', url: 'https://coursera.org' },
  { name: 'Kaggle', cat: 'ML/Data', icon: '📈', url: 'https://kaggle.com' },
  { name: 'CP-Algorithms', cat: 'Competitive Prog', icon: '🏆', url: 'https://cp-algorithms.com' },
  { name: 'Wolfram Alpha', cat: 'Math Solver', icon: '∑', url: 'https://wolframalpha.com' },
  { name: 'Desmos', cat: 'Graphing Calc', icon: '📉', url: 'https://desmos.com' },
  { name: 'IEEE Xplore', cat: 'Research Papers', icon: '📚', url: 'https://ieeexplore.ieee.org' },
  { name: 'GitHub Copilot', cat: 'AI Code', icon: '🤖', url: 'https://github.com/features/copilot' },
  { name: 'Replit', cat: 'Online IDE', icon: '💻', url: 'https://replit.com' },
  { name: 'Draw.io', cat: 'Diagrams', icon: '🗂️', url: 'https://app.diagrams.net' },
  { name: 'Excalidraw', cat: 'Whiteboard', icon: '✏️', url: 'https://excalidraw.com' },
];

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  renderApps();
  renderResources();
  startClock();
  initPomodoro();
  initNotes();
  initUnitConverter();
  updateUnits();
  convert();

  // Show Sign Out button only inside Electron
  if (window.labdesk) {
    const btn = document.getElementById('signoutBtn');
    if (btn) btn.style.display = 'block';
  }
});

async function doSignOut() {
  if (!window.labdesk) return;
  if (confirm('Sign out of your Google account?')) {
    await window.labdesk.logout();
  }
}

/* ===== Apps ===== */
function renderApps() {
  const grid = document.getElementById('appsGrid');
  APPS.forEach(app => {
    const a = document.createElement('a');
    a.className = 'app-card';
    a.style.setProperty('--app-color', app.color);
    a.href = '#';
    a.innerHTML = `<span class="app-icon">${app.icon}</span><span class="app-name">${app.name}</span>`;
    a.addEventListener('click', e => {
      e.preventDefault();
      if (app.action) { app.action(); return; }
      if (app.url) openViewer(app.url, app.name, app.icon);
    });
    grid.appendChild(a);
  });
}

/* ===== Resources ===== */
function renderResources() {
  const grid = document.getElementById('resourcesGrid');
  RESOURCES.forEach(r => {
    const a = document.createElement('a');
    a.className = 'res-card';
    a.href = '#';
    a.innerHTML = `<span class="res-icon">${r.icon}</span>
      <div class="res-info">
        <span class="res-name">${r.name}</span>
        <span class="res-cat">${r.cat}</span>
      </div>`;
    a.addEventListener('click', e => { e.preventDefault(); openViewer(r.url, r.name, r.icon); });
    grid.appendChild(a);
  });
}

/* ===== Clock ===== */
function startClock() {
  const tick = () => {
    const now = new Date();
    document.getElementById('clock').textContent =
      now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('date').textContent =
      now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  tick(); setInterval(tick, 1000);
}

/* ===== Search ===== */
function handleSearch(e) {
  if (e.key === 'Enter') searchOn('google');
}
function searchOn(engine) {
  const q = document.getElementById('searchBar').value.trim();
  if (!q) return;
  if (engine === 'youtube') {
    // Open local YouTube player — user can paste the video URL there
    openViewer('/youtube.html', 'YouTube', '▶️');
    return;
  }
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  openViewer(url, `Google: ${q}`, '🔎');
}

/* ===== Pomodoro ===== */
const MODES = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
let pomoState = { mode: 'focus', total: 25 * 60, remaining: 25 * 60, running: false, timer: null, sessions: 0 };
const CIRCUMFERENCE = 2 * Math.PI * 52; // 326.7

function initPomodoro() {
  document.getElementById('ringFill').style.strokeDasharray = CIRCUMFERENCE;
  updatePomoDisplay();
}

function togglePomo() {
  if (pomoState.running) {
    clearInterval(pomoState.timer);
    pomoState.running = false;
    document.getElementById('pomoStartBtn').textContent = '▶ Resume';
  } else {
    pomoState.running = true;
    document.getElementById('pomoStartBtn').textContent = '⏸ Pause';
    pomoState.timer = setInterval(() => {
      pomoState.remaining--;
      updatePomoDisplay();
      if (pomoState.remaining <= 0) {
        clearInterval(pomoState.timer);
        pomoState.running = false;
        if (pomoState.mode === 'focus') pomoState.sessions++;
        document.getElementById('pomoCount').textContent = pomoState.sessions;
        document.getElementById('pomoStartBtn').textContent = '▶ Start';
        showToast(pomoState.mode === 'focus' ? '🎉 Session complete! Take a break.' : '⚡ Break over! Back to focus.');
        try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play(); } catch(e) {}
      }
    }, 1000);
  }
}

function resetPomo() {
  clearInterval(pomoState.timer);
  pomoState.running = false;
  pomoState.remaining = pomoState.total;
  document.getElementById('pomoStartBtn').textContent = '▶ Start';
  updatePomoDisplay();
}

function setMode(mode, btn) {
  clearInterval(pomoState.timer);
  pomoState.running = false;
  pomoState.mode = mode;
  pomoState.total = MODES[mode];
  pomoState.remaining = MODES[mode];
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('pomoLabel').textContent = mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break';
  document.getElementById('ringFill').style.stroke = mode === 'focus' ? 'var(--accent2)' : mode === 'short' ? 'var(--yellow)' : 'var(--accent)';
  document.getElementById('pomoStartBtn').textContent = '▶ Start';
  updatePomoDisplay();
}

function updatePomoDisplay() {
  const m = Math.floor(pomoState.remaining / 60).toString().padStart(2, '0');
  const s = (pomoState.remaining % 60).toString().padStart(2, '0');
  document.getElementById('pomoTime').textContent = `${m}:${s}`;
  const pct = pomoState.remaining / pomoState.total;
  document.getElementById('ringFill').style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
}

/* ===== Notes ===== */
function initNotes() {
  const area = document.getElementById('notesArea');
  area.value = localStorage.getItem('labdesk_notes') || '';
  updateCharCount();
  area.addEventListener('input', () => {
    localStorage.setItem('labdesk_notes', area.value);
    updateCharCount();
  });
}
function updateCharCount() {
  document.getElementById('charCount').textContent = document.getElementById('notesArea').value.length + ' chars';
}
function clearNotes() {
  document.getElementById('notesArea').value = '';
  localStorage.removeItem('labdesk_notes');
  updateCharCount();
  showToast('Notes cleared');
}
function copyNotes() {
  navigator.clipboard.writeText(document.getElementById('notesArea').value).then(() => showToast('Notes copied!'));
}

/* ===== Code Pad ===== */
const LANG_URLS = {
  python: 'https://www.onlinegdb.com/online_python_compiler',
  c: 'https://www.onlinegdb.com/online_c_compiler',
  java: 'https://www.onlinegdb.com/online_java_compiler',
  js: 'https://jsfiddle.net/',
};
let currentLang = 'python';
function setLang(lang, btn) {
  currentLang = lang;
  document.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function runOnline() {
  openViewer(LANG_URLS[currentLang], 'Online Compiler', '🔧');
}
function copyCode() {
  navigator.clipboard.writeText(document.getElementById('codeArea').value).then(() => showToast('Code copied!'));
}

/* ===== Iframe Viewer ===== */
let _viewerCurrentUrl = '';
let _blockTimer = null;

// In Electron (webSecurity:false), X-Frame-Options is ignored — load directly.
// In browser mode, route external sites through the local proxy.
const IS_ELECTRON = navigator.userAgent.toLowerCase().includes('electron');

// Allowed everything to route through proxy
const HARD_BLOCKED = [];

function isHardBlocked(url) {
  return false;
}

function proxyUrl(url) {
  if (IS_ELECTRON) return url;                          // Electron: direct
  if (url.startsWith('/') || url.startsWith('http://localhost')) return url;
  return '/proxy?url=' + encodeURIComponent(url);       // Browser: proxy
}

function openViewer(url, name, icon) {
  _viewerCurrentUrl = url;
  const overlay = document.getElementById('viewerOverlay');
  const frame   = document.getElementById('viewerFrame');
  const blocked = document.getElementById('viewerBlocked');

  document.getElementById('viewerIcon').textContent  = icon || '🌐';
  document.getElementById('viewerTitle').textContent = name || url;
  document.getElementById('viewerUrl').textContent   = url;
  document.getElementById('blockedLink').href        = url;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Hard-blocked: show message immediately
  if (isHardBlocked(url)) {
    frame.style.display = 'none';
    blocked.classList.add('show');
    return;
  }

  // Everything else: route through local proxy
  frame.style.display = 'block';
  blocked.classList.remove('show');
  frame.src = 'about:blank';
  clearTimeout(_blockTimer);
  setTimeout(() => { frame.src = proxyUrl(url); }, 50);
}

function showBlockedUI(frame, blocked) {
  frame.style.display = 'none';
  blocked.classList.add('show');
}

function closeViewer(e) {
  if (e && e.target !== document.getElementById('viewerOverlay')) return;
  _forceCloseViewer();
}

function _forceCloseViewer() {
  clearTimeout(_blockTimer);
  const overlay = document.getElementById('viewerOverlay');
  const frame   = document.getElementById('viewerFrame');
  const blocked = document.getElementById('viewerBlocked');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    frame.src = 'about:blank';
    frame.style.display = 'block';
    blocked.classList.remove('show');
  }, 300);
}

function reloadViewer() {
  document.getElementById('viewerFrame').src = _viewerCurrentUrl;
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('viewerOverlay').classList.contains('open')) {
    _forceCloseViewer();
  }
});


/* ===== Unit Converter ===== */
const UNIT_DATA = {
  length: {
    units: ['mm', 'cm', 'm', 'km', 'inch', 'foot', 'mile'],
    toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, foot: 0.3048, mile: 1609.34 }
  },
  mass: {
    units: ['mg', 'g', 'kg', 'tonne', 'oz', 'lb'],
    toBase: { mg: 1e-6, g: 0.001, kg: 1, tonne: 1000, oz: 0.0283495, lb: 0.453592 }
  },
  temp: { units: ['°C', '°F', 'K'], toBase: null },
  data: {
    units: ['B', 'KB', 'MB', 'GB', 'TB'],
    toBase: { B: 1, KB: 1024, MB: 1024**2, GB: 1024**3, TB: 1024**4 }
  }
};

function initUnitConverter() { updateUnits(); }

function updateUnits() {
  const type = document.getElementById('unitType').value;
  const data = UNIT_DATA[type];
  const sel1 = document.getElementById('unitFrom');
  const sel2 = document.getElementById('unitTo');
  sel1.innerHTML = sel2.innerHTML = '';
  data.units.forEach((u, i) => {
    sel1.innerHTML += `<option value="${u}" ${i===0?'selected':''}>${u}</option>`;
    sel2.innerHTML += `<option value="${u}" ${i===1?'selected':''}>${u}</option>`;
  });
  convert();
}

function convert() {
  const type = document.getElementById('unitType').value;
  const val = parseFloat(document.getElementById('convFrom').value);
  const from = document.getElementById('unitFrom').value;
  const to = document.getElementById('unitTo').value;
  if (isNaN(val)) { document.getElementById('convTo').value = ''; return; }

  let result;
  if (type === 'temp') {
    result = convertTemp(val, from, to);
  } else {
    const data = UNIT_DATA[type];
    const base = val * data.toBase[from];
    result = base / data.toBase[to];
  }
  document.getElementById('convTo').value = parseFloat(result.toPrecision(8));
}

function convertTemp(val, from, to) {
  let c;
  if (from === '°C') c = val;
  else if (from === '°F') c = (val - 32) * 5/9;
  else c = val - 273.15;
  if (to === '°C') return c;
  if (to === '°F') return c * 9/5 + 32;
  return c + 273.15;
}

/* ===== Base Converter ===== */
function convertBase() {
  const raw = document.getElementById('baseInput').value.trim();
  const base = parseInt(document.getElementById('baseFrom').value);
  if (!raw) { ['Bin','Oct','Dec','Hex'].forEach(b => document.getElementById('res'+b).textContent = '—'); return; }
  try {
    const dec = parseInt(raw, base);
    if (isNaN(dec)) throw new Error();
    document.getElementById('resBin').textContent = dec.toString(2);
    document.getElementById('resOct').textContent = dec.toString(8);
    document.getElementById('resDec').textContent = dec.toString(10);
    document.getElementById('resHex').textContent = dec.toString(16).toUpperCase();
  } catch {
    ['Bin','Oct','Dec','Hex'].forEach(b => document.getElementById('res'+b).textContent = 'Invalid');
  }
}

/* ===== ASCII ===== */
function lookupAscii() {
  const ch = document.getElementById('asciiInput').value;
  if (!ch) { document.getElementById('asciiChar').textContent = '—'; return; }
  const code = ch.charCodeAt(0);
  document.getElementById('asciiChar').textContent = ch === ' ' ? 'SPC' : ch;
  document.getElementById('asciiDec').textContent = code;
  document.getElementById('asciiHex').textContent = '0x' + code.toString(16).toUpperCase();
  document.getElementById('asciiBin').textContent = code.toString(2).padStart(8, '0');
}
function fillAscii(ch) {
  document.getElementById('asciiInput').value = ch;
  lookupAscii();
}

/* ===== Toast ===== */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
