const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  onMessage: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  
  // Expose process information safely
  platform: process.platform,
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production',
    // Add other env variables you need
  },
  
  // Add other process properties you need
  versions: process.versions,
  
  // Safe way to check if running in Electron
  isElectron: true
});

// Optional: Log successful load
console.log('Preload script loaded successfully');