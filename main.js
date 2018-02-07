const electron = require('electron')
// Module to control application life.
const app = electron.app
const Menu = electron.Menu
const globalShortcut = electron.globalShortcut
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let windowList = []
let menu

function createWindow () {
  var protocol = electron.protocol;

  // Create the browser window.
  let thisWindow = new BrowserWindow({show: false, width: 1280, height: 720, fullscreenable: true, webPreferences: {sandbox: false, contextIsolation: true, partition:'persist:'+windowList.length, devTools: true, nodeIntegration: true, webSecurity: false, allowRunningInsecureContent: true, allowDisplayingInsecureContent: true} });
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
        { label: 'New Window', click() { createWindow(); } },
      ]
    },
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
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createWindow();

  globalShortcut.register('CommandOrControl+N', () => {
    createWindow()
  });
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
