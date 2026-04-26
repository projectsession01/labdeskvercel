const { app, BrowserWindow, Menu, shell, ipcMain, session } = require('electron');
const path = require('path');
const net  = require('path');
const netMod = require('net');

let mainWindow;
let serverPort = 5050;

/* ── User-Agent: spoof pure Chrome so Google allows sign-in ─────────────── */
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function findFreePort(port) {
  return new Promise(resolve => {
    const s = netMod.createServer();
    s.listen(port, () => s.close(() => resolve(port)));
    s.on('error', () => resolve(findFreePort(port + 1)));
  });
}

async function isGoogleLoggedIn() {
  try {
    const cookies = await session.defaultSession.cookies.get({ domain: '.google.com' });
    return cookies.some(c => c.name === 'SID' && c.value.length > 0);
  } catch { return false; }
}

/* ── Create main window ──────────────────────────────────────────────────── */
async function createWindow() {
  serverPort = await findFreePort(5050);
  const { startServer } = require('./server');
  await startServer(serverPort);

  mainWindow = new BrowserWindow({
    width: 1440, height: 900,
    minWidth: 1024, minHeight: 680,
    title: 'LabDesk — Engineering Lab Dashboard',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#0a0b0f',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,           // bypasses X-Frame-Options in iframes
      preload: path.join(__dirname, 'preload.js'),
      session: session.defaultSession,
    },
  });

  Menu.setApplicationMenu(null);

  // Override user-agent on every request so Google sees Chrome, not Electron
  mainWindow.webContents.setUserAgent(CHROME_UA);

  // Also patch at the session level (covers iframe sub-requests)
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = CHROME_UA;
    callback({ requestHeaders: details.requestHeaders });
  });

  const loggedIn = await isGoogleLoggedIn();
  if (loggedIn) {
    mainWindow.loadURL(`http://localhost:${serverPort}/`);
  } else {
    mainWindow.loadURL(`http://localhost:${serverPort}/login.html`);
  }

  mainWindow.once('ready-to-show', () => { mainWindow.show(); mainWindow.focus(); });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

/* ── IPC handlers ────────────────────────────────────────────────────────── */
ipcMain.handle('is-logged-in', () => isGoogleLoggedIn());
ipcMain.handle('get-port',     () => serverPort);

// Navigate the MAIN WINDOW to Google sign-in (not a popup — that's what Google blocks)
ipcMain.handle('do-google-login', () => {
  mainWindow.loadURL('https://accounts.google.com/signin/v2/identifier?hl=en&flowName=GlifWebSignIn&flowEntry=ServiceLogin');

  // Detect successful login via cookie polling (every 1.5 s)
  const poll = setInterval(async () => {
    try {
      const cookies = await session.defaultSession.cookies.get({ domain: '.google.com' });
      const hasSID  = cookies.some(c => c.name === 'SID' && c.value.length > 0);
      if (hasSID) {
        clearInterval(poll);
        clearTimeout(timeout);
        // Give Google a moment to finish its post-login redirects
        setTimeout(() => {
          mainWindow.loadURL(`http://localhost:${serverPort}/`);
        }, 1200);
      }
    } catch { /* ignore */ }
  }, 1500);

  // Give up after 10 minutes (user closed or abandoned)
  const timeout = setTimeout(() => {
    clearInterval(poll);
    mainWindow.loadURL(`http://localhost:${serverPort}/login.html`);
  }, 10 * 60 * 1000);

  return true; // renderer navigates away immediately, response is not awaited
});

// Sign out — clear ALL storage so next launch shows login
ipcMain.handle('do-logout', async () => {
  await session.defaultSession.clearStorageData({
    storages: ['cookies', 'localstorage', 'sessionstorage', 'cachestorage', 'serviceworkers'],
  });
  if (mainWindow) mainWindow.loadURL(`http://localhost:${serverPort}/login.html`);
});

/* ── Lifecycle ───────────────────────────────────────────────────────────── */
app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
