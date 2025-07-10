const { ipcRenderer } = require('electron');

// With contextIsolation disabled, we can directly set window properties
window.electronAPI = {
  sendMessage: (message) => ipcRenderer.send('message', message),
  platform: process.platform,
  env: { NODE_ENV: process.env.NODE_ENV || 'production' },
  versions: process.versions,
  isElectron: true
};

window.process = {
  env: { NODE_ENV: process.env.NODE_ENV || 'production' },
  platform: process.platform,
  versions: process.versions
};

console.log('Preload script loaded successfully');