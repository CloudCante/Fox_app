// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge } = require('electron');
const { version } = require('../package.json'); // adjust path as needed

contextBridge.exposeInMainWorld('electronApp', {
  getVersion: () => version
});
