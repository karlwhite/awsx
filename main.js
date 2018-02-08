const electron = require('electron')
// Module to control application life.
const app = electron.app
const Menu = electron.Menu
const globalShortcut = electron.globalShortcut
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path');
const url = require('url')
const Store = require('./store.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let windowList = []
let menu

const prefs = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: { width: 1280, height: 720 }
  }
});

function guid() {
  function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function createWindow() {
  var protocol = electron.protocol;
  let { width, height } = prefs.get('windowBounds');
  
  // Create the browser window.
  let thisWindow = new BrowserWindow({show: false, width: width, height: height, fullscreenable: true, webPreferences: {/*sandbox: false, contextIsolation: true,*/ partition:'persist:'+windowList.length, devTools: true, nodeIntegration: true, webSecurity: false, allowRunningInsecureContent: true, allowDisplayingInsecureContent: true} });
  thisWindow.once('ready-to-show', () => {
    thisWindow.show();
  });
  windowList.push(thisWindow);

  if ( !mainWindow ) mainWindow = thisWindow;

  // Fix for security error
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    event.preventDefault()
    callback(true);
  });

  var template = [
    {
      label: 'AWSX',
      submenu: [
        {role: 'quit'}
      ]
    },
    {
      label: 'File',
      submenu: [
        //{ label: 'New Window', accelerator: "CommandOrControl+N", click() { createWindow(); } },
        { label: 'New tab', accelerator: "CommandOrControl+T", click() { thisWindow.webContents.send('message', {'action': 'newTab'}); } },
        { type: "separator" },
        { label: 'Close tab', accelerator: "CommandOrControl+W", click() { mainWindow.webContents.send('message', {'action': 'closeTab'}); } },
      ]
    },
    {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select all", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      label: "Accounts",
      submenu: [
          { label: "Add account", accelerator: "Cmd+N", click() { thisWindow.webContents.send('message', {'action': 'addAccount'}); } },
          { type: "separator" },
          { label: "Switch to 1", accelerator: "Cmd+1", click() { thisWindow.webContents.send('message', {'action': 'setAccount1'}); } },
          { label: "Switch to 2", accelerator: "Cmd+2", click() { thisWindow.webContents.send('message', {'action': 'setAccount2'}); } },
          { label: "Switch to 3", accelerator: "Cmd+3", click() { thisWindow.webContents.send('message', {'action': 'setAccount3'}); } },
          { label: "Switch to 4", accelerator: "Cmd+4", click() { thisWindow.webContents.send('message', {'action': 'setAccount4'}); } },
          { label: "Switch to 5", accelerator: "Cmd+5", click() { thisWindow.webContents.send('message', {'action': 'setAccount5'}); } },
          { label: "Switch to 6", accelerator: "Cmd+6", click() { thisWindow.webContents.send('message', {'action': 'setAccount6'}); } },
          { label: "Switch to 7", accelerator: "Cmd+7", click() { thisWindow.webContents.send('message', {'action': 'setAccount7'}); } },
          { label: "Switch to 8", accelerator: "Cmd+8", click() { thisWindow.webContents.send('message', {'action': 'setAccount8'}); } },
          { label: "Switch to 9", accelerator: "Cmd+9", click() { thisWindow.webContents.send('message', {'action': 'setAccount9'}); } },
      ]
    }
  ];
  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  //thisWindow.loadURL('https://signin.aws.amazon.com/signin?client_id=arn%3Aaws%3Aiam%3A%3A015428540659%3Auser%2Fhomepage&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3Fstate%3DhashArgs%2523%26isauthcode%3Dtrue&page=resolve');
  thisWindow.loadURL('file://' + __dirname + '/index.html');

  /*const TabGroup = require("electron-tabs");
  let tabGroup = new TabGroup();
  let tab = tabGroup.addTab({
      title: "AWS",
      src: 'https://signin.aws.amazon.com/signin?client_id=arn%3Aaws%3Aiam%3A%3A015428540659%3Auser%2Fhomepage&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3Fstate%3DhashArgs%2523%26isauthcode%3Dtrue&page=resolve',
      visible: true
  });*/
  
  // Open the DevTools.
  //thisWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  thisWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if ( thisWindow == mainWindow ) mainWindow = null;
    thisWindow = null
  });
  thisWindow.webContents.on('did-finish-load', () => {
    //thisWindow.webContents.send('message', {'action': 'newTab'});
  });

  // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
  // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    prefs.set('windowBounds', { width, height });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();

  /*globalShortcut.register('CommandOrControl+N', () => {
    createWindow();
  });
  globalShortcut.register('CommandOrControl+T', () => {
    mainWindow.webContents.send('message', {'action': 'newTab'});
  });
  globalShortcut.register('CommandOrControl+W', () => {
    mainWindow.webContents.send('message', {'action': 'closeTab'});
  });*/
  globalShortcut.register('CommandOrControl+D', () => {
    mainWindow.webContents.openDevTools();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    app.quit()
  //}
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
