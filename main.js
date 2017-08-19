const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const ipc = require('electron').ipcMain;
var region;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

var windows = {
  'main': {
    'obj': null,
    'properties': { // defaults
      width: 500,
      height: 350,
      show: false
    },
    'content': {
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    },
    'onboot': function() {
      this.obj.once('ready-to-show', () => {this.obj.show()});
    }
  },
  'screenshot': {
    'obj': null,
    'properties': {
      width: 400,
      height: 400,
      transparent: true,
      frame: false,
      show: false,
      skipTaskbar: true
    },
    'content': {
      pathname: path.join(__dirname, 'screenshot.html'),
      protocol: 'file:',
      slashes: true
    },
    'onboot': function() {
      this.obj.once('ready-to-show', () => {
        this.obj.maximize();
        this.obj.show();
      }).on('blur', () => {
        this.obj.close();
        this.obj = null;
      });
    }
  }
};

function createWindow(window) {
  var w = windows[window];
  w.obj = new BrowserWindow(w.properties);
  w.obj.loadURL(url.format(w.content));
  if ('onboot' in w) w.onboot();
  w.obj.on('closed', () => {w.obj = null});
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {createWindow('main');});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  };
});

app.on('activate', () => {
  if (windows.main.obj === null) {
    createWindow('main')
  };
});

ipc.on('setRegion', () => {
  createWindow('screenshot');
});

ipc.on('return', () => {windows.main.obj.focus();});

ipc.on('regionSet', (e, rect) => {
  region = rect;
  windows.main.obj.focus();
});
