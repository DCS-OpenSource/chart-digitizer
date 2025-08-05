const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Read version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
const appVersion = packageJson.version;

function createWindow() {
  const win = new BrowserWindow({
    width: 1500,
    height: 800,
    title: `Chart Digitizer v${appVersion}`,
    icon: path.join(__dirname, '..', 'public', 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    win.setMenu(null);
  }
}

app.whenReady().then(createWindow);
