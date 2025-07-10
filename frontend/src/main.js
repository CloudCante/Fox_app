const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('node:path');
const fs = require('fs');

if (require('electron-squirrel-startup')) {
  app.quit();
}

autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = false;

let logFile;

// Check if running in development
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Logging function
function logToFile(message) {
  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  if (logFile) {
    try {
      fs.appendFileSync(logFile, logEntry);
    } catch (err) {
      console.error('Failed to write log:', err);
    }
  } else {
    console.warn('logFile not initialized yet:', message);
  }
}

// Set up update events early
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  logToFile('Checking for update...');
});

autoUpdater.on('update-available', () => {
  console.log('Update available');
  logToFile('Update available');
});

autoUpdater.on('update-not-available', () => {
  console.log('No update available – app is up to date.');
  logToFile('No update available – app is up to date.');
});

autoUpdater.on('update-downloaded', () => {
  console.log('Update downloaded');
  logToFile('Update downloaded – quitting and installing');
  autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (err) => {
  console.error('AutoUpdater error:', err);
  logToFile(`AutoUpdater error: ${err.message}`);
});

// Create main window
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname,'preload.js'),
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
    },
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e3a5f',
      symbolColor: '#ffffff',
      height: 30,
    },
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src * 'unsafe-inline' 'unsafe-eval'; connect-src * data:"],
      },
    });
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Add process polyfill to renderer
  mainWindow.webContents.executeJavaScript(`
    if (typeof process === 'undefined') {
      window.process = {
        env: {
          NODE_ENV: '${isDev ? 'development' : 'production'}'
        },
        platform: '${process.platform}',
        versions: ${JSON.stringify(process.versions)}
      };
    }
  `);
  
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => {
    // Only check for updates in production
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
};

// Initialize everything when app is ready
app.whenReady().then(() => {
  // Initialize logging first
  logFile = path.join(app.getPath('userData'), 'updater.log');
  logToFile('Updater log started...');

  // Now safe to log preload check
  const preloadPath = path.join(__dirname,'preload.js');
  console.log('Preload exists:', fs.existsSync(preloadPath), preloadPath);
  logToFile(`Preload script path: ${preloadPath}`);

  // Set up dev update config if needed
  if (isDev) {
    // Option 1: Disable auto-updater in development
    logToFile('Development mode: Auto-updater disabled');
    // Don't call autoUpdater.checkForUpdatesAndNotify() in dev
  } else {
    // Only check for updates in production
    logToFile('Production mode: Auto-updater enabled');
  }

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