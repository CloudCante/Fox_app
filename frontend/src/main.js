const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

console.log('[main] Starting application...');

if (require('electron-squirrel-startup')) {
  console.log('[main] Squirrel startup detected. Quitting...');
  app.quit();
}

autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = false;

let logFile;

function logToFile(message) {
  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  if (logFile) {
    try {
      fs.appendFileSync(logFile, logEntry);
    } catch (err) {
      console.error('[log] Failed to write log:', err);
    }
  } else {
    console.warn('[log] logFile not initialized yet:', message);
  }
}

// AutoUpdater logs
autoUpdater.on('checking-for-update', () => {
  console.log('[updater] Checking for update...');
  logToFile('Checking for update...');
});
autoUpdater.on('update-available', () => {
  console.log('[updater] Update available');
  logToFile('Update available');
});
autoUpdater.on('update-not-available', () => {
  console.log('[updater] No update available');
  logToFile('No update available');
});
autoUpdater.on('update-downloaded', () => {
  console.log('[updater] Update downloaded');
  logToFile('Update downloaded – quitting and installing');
  autoUpdater.quitAndInstall();
});
autoUpdater.on('error', (err) => {
  console.error('[updater] Error:', err);
  logToFile(`AutoUpdater error: ${err.message}`);
});

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 🔹 Main window creation
function createWindow() {
  console.log('[main] Creating browser window...');
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      nodeIntegration: true,          // Enable Node.js in renderer
      contextIsolation: false,        // Disable context isolation
      enableRemoteModule: true
    },
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e3a5f',
      symbolColor: '#ffffff',
      height: 30,
    }
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval'; connect-src * data:"],
      },
    });
  });

  const indexPath = path.join(__dirname, 'index.html');
  console.log('[main] Loading file:', indexPath);
  
  mainWindow.loadFile(indexPath).then(() => {
    console.log('[main] index.html loaded successfully');
  }).catch(err => {
    console.error('[main] Failed to load index.html:', err);
  });

  mainWindow.webContents.openDevTools();

  // Add more detailed logging
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[main] Page finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[main] Page failed to load:', errorCode, errorDescription);
  });

  mainWindow.once('ready-to-show', () => {
    console.log('[main] Window ready to show');
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
}

// 🔹 App ready event
app.whenReady().then(() => {
  console.log('[main] App is ready');
  logFile = path.join(app.getPath('userData'), 'updater.log');
  logToFile('Updater log started...');

  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[main] Checking preload path:', preloadPath);
  logToFile(`Preload exists: ${fs.existsSync(preloadPath)} at ${preloadPath}`);

  if (isDev) {
    logToFile('Running in development mode. Skipping update checks.');
  } else {
    logToFile('Running in production mode.');
  }

  createWindow();

  app.on('activate', () => {
    console.log('[main] App activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 🔹 All windows closed
app.on('window-all-closed', () => {
  console.log('[main] All windows closed');
  if (process.platform !== 'darwin') {
    console.log('[main] Quitting app');
    app.quit();
  }
});