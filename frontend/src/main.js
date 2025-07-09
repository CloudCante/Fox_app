const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('node:path');


if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      webSecurity: false,
    },
    frame: false,  
    titleBarStyle: 'hidden', 
    titleBarOverlay: {
      color: '#1e3a5f',
      symbolColor: '#ffffff',
      height: 30
    },
  });
//DO NOTE REMOVE THIS, IDK WHY BUT IF YOU DO THE APP REFUSES TO RUN DURING LIVE SESSION (NPM START etc...)
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval'; connect-src * data:"]
      }
    });
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show',()=>{
    autoUpdater.allowPrerelease = true;
    autoUpdater.autoDownload= false;
    autoUpdater.checkForUpdatesAndNotify();
  })
};


app.whenReady().then(() => {
  createWindow();


  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

autoUpdater.on('update-available',()=>{
  console.log('Update available');
});

autoUpdater.on('update-downloaded',()=>{
  console.log('Update downloaded');
  autoUpdater.quitAndInstall();
});
