const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('node:path');
const { updateElectronApp, UpdateSourceType } = require('update-electron-app');
const { autoUpdater } = require('electron-updater');

// updateElectronApp({
//   updateSource: {
//     type: UpdateSourceType.ElectronPublicUpdateService,
//     repo: 'CloudCante/Fox_app'
//   },
//   updateInterval: '1 hour',
//   logger: require('electron-log')
// });


if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
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

  mainWindow.webContents.openDevTools();
};


app.whenReady().then(() => {
  createWindow();

  autoUpdater.on('checking-for-update', () => log.info('Checking for update...'));
  autoUpdater.on('update-not-available', () => log.info('No updates available.'));
  autoUpdater.on('error', (err) => log.error('Update error:', err));

  autoUpdater.on('update-available', () => {
    const result = dialog.showMessageBoxSync({
      type: 'info',
      title: 'Update available',
      message: 'A new version of Fox App is available. Would you like to download it now?',
      buttons: ['Yes', 'Later']
    });

    if (result === 0) { // "Yes"
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-downloaded', () => {
    const result = dialog.showMessageBoxSync({
      type: 'question',
      title: 'Update ready',
      message: 'The update has been downloaded. Restart the app to apply it now?',
      buttons: ['Restart', 'Later']
    });

    if (result === 0) { // "Restart"
      autoUpdater.quitAndInstall();
    }
  });

  const log = require('electron-log');
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';

  if(app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  } else {
    console.log('Running in development mode, skipping auto-update check.');
  }

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


