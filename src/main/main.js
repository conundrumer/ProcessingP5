const electron = require('electron');

const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
} = electron;

const fs = require('fs');
const path = require('path');
const url = require('url');
const windowStateKeeper = require('electron-window-state');
const settings = require('electron-settings');

if (process.env.ELECTRON_START_URL) {
  require('electron-reload')(
    path.join(__dirname, '../../dist'), {
      // this enables hard resets, don't know if I need it
      //electron: '../../dist'
    });
}

let mainWindow;

function createWindow() {
  const monitor = electron.screen.getPrimaryDisplay();
  const mainWindowState = windowStateKeeper({
    file: 'mainWindow.json',
    defaultWidth: monitor.size.width / 2,
    defaultHeight: monitor.size.height,
  });

  mainWindow = new BrowserWindow({
    show: false,
    x: mainWindowState.x === undefined ? 0 : mainWindowState.x,
    y: mainWindowState.y === undefined ? 0 : mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
    },
  });
  mainWindowState.manage(mainWindow);

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => mainWindow.showInactive());
}

const template = [{
  label: 'File',
  submenu: [{
    label: 'New Sketch',
    accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
    click: () => mainWindow.webContents.send('new-sketch'),
  }, {
    label: 'Save Sketch as ...',
    accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
    click: () => mainWindow.webContents.send('save-sketch-as'),
  }, {
    label: 'Open Sketch',
    accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
    click: () => mainWindow.webContents.send('open-sketch'),
  }, {
    type: 'separator'
  }, {
    label: 'Preferences',
    accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
    click: () => mainWindow.webContents.send('open-preferences'),
  }]
}, {
  label: 'View',
  submenu: [{
    role: 'toggledevtools'
  }, {
    type: 'separator'
  }, {
    role: 'resetzoom'
  }, {
    role: 'zoomin'
  }, {
    role: 'zoomout'
  }]
}, ];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('window-all-closed', app.quit);
app.on('ready', () => {
  createWindow();
  intialiseSettings();
});

function intialiseSettings() {
  settings.deleteAll();

  // first time opening the app
  if (!settings.has('base-sketches-path')) {
    const basePath = path.join(app.getPath('documents'), 'ProcessingP5/');

    settings.set('base-sketches-path', basePath);

    const sketchPath = path.join(basePath + 'my-first-sketch/');
    fs.mkdirSync(sketchPath, {
      recursive: true
    });
    fs.writeFileSync(path.join(sketchPath, 'main.js'), '');

    settings.set('current-sketch-path', sketchPath);
  }
}
