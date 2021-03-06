const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const windowStateKeeper = require('./window-state-manager');

module.exports = {
  initialise
};

function initialise() {
  const monitor = electron.screen.getPrimaryDisplay();
  const mainWindowState = windowStateKeeper({
    file: 'window-state-main.json',
    defaultWidth: monitor.size.width / 2,
    defaultHeight: monitor.size.height,
  });

  mainWindow = mainWindowState.manage(new BrowserWindow({
    show: false,
    x: mainWindowState.x === undefined ? 0 : mainWindowState.x,
    y: mainWindowState.y === undefined ? 0 : mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    icon: path.join(__dirname, '../../assets/icons/png/64x64.png'),
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
    },
  }));

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);

  mainWindow.on('page-title-updated', e => {
    // alow the app to change the title
    e.preventDefault();
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.once('closed', () => electron.app.quit());

  return mainWindow;
}
