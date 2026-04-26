// preload.js — bridges the secure IPC channel between Electron main ↔ renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('labdesk', {
  login:      ()    => ipcRenderer.invoke('do-google-login'),
  logout:     ()    => ipcRenderer.invoke('do-logout'),
  isLoggedIn: ()    => ipcRenderer.invoke('is-logged-in'),
  getPort:    ()    => ipcRenderer.invoke('get-port'),
  onLoginDone:(cb)  => ipcRenderer.on('login-done', cb),
});
