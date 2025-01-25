const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const passwordManager = require('./passwordManager');

function createWindow() {
  const win = new BrowserWindow({
    width: 700,
    height: 900,
    resizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      contextIsolation: false,
      nodeIntegration: true
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#2e2c29',
  });

  win.setMenu(null);
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  passwordManager.init(app.getPath('userData'));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-password', async (event, data) => {
  return passwordManager.savePassword(data);
});

ipcMain.handle('load-passwords', async () => {
  return passwordManager.loadPasswords();
});

ipcMain.handle('delete-password', async (event, index) => {
  passwordManager.deletePassword(index);
});
