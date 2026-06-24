const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');

let mainWindow;
let serverProcess;

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 950,
    backgroundColor: '#ffffff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle('Cell Browser');

    });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const serverScript = path.join(__dirname, 'server.js');
  serverProcess = fork(serverScript, [], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });

  serverProcess.on('message', (msg) => {
    if (msg && msg.port) {
      createWindow(msg.port);
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill();
});
