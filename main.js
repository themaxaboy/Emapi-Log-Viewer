"use strict";

// Import parts of electron to use
const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const electron = require("electron");
const path = require("path");
const url = require("url");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a reference for dev mode
let dev = false;
if (
  process.defaultApp ||
  /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
  /[\\/]electron[\\/]/.test(process.execPath)
) {
  dev = true;
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false
  });

  // and load the index.html of the app.
  let indexPath;
  if (dev && process.argv.indexOf("--noDevServer") === -1) {
    indexPath = url.format({
      protocol: "http:",
      host: "localhost:8080",
      pathname: "index.html",
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "dist", "index.html"),
      slashes: true
    });
  }
  mainWindow.loadURL(indexPath);

  // Don't show until we are ready and loaded
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("open-directory-dialog", event => {
  dialog.showOpenDialog(
    {
      properties: ["openDirectory"]
    },
    path => {
      if (path) {
        event.sender.send("selected-directory", path);
      }
    }
  );
});

ipcMain.on("open-file-dialog", event => {
  dialog.showOpenDialog(
    {
      properties: ["openFile", "multiSelections"],
      filters: [
        {name: 'Log', extensions: ['log']},
      ]
    },
    files => {
      if (files) {
        event.sender.send("selected-files", files);
      }
    }
  );
});

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event, message) => {
  event.sender.send("message", message);
});

let template = [
  {
    label: "Edit",
    submenu: [
      {
        label: "Undo",
        accelerator: "CmdOrCtrl+Z",
        role: "undo"
      },
      {
        label: "Redo",
        accelerator: "Shift+CmdOrCtrl+Z",
        role: "redo"
      },
      {
        type: "separator"
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        role: "cut"
      },
      {
        label: "Copy",
        accelerator: "CmdOrCtrl+C",
        role: "copy"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste"
      },
      {
        label: "Select All",
        accelerator: "CmdOrCtrl+A",
        role: "selectall"
      }
    ]
  },
  {
    label: "View",
    submenu: [
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach(function(win) {
                if (win.id > 1) {
                  win.close();
                }
              });
            }
            focusedWindow.reload();
          }
        }
      },
      {
        label: "Toggle Full Screen",
        accelerator: (function() {
          if (process.platform === "darwin") {
            return "Ctrl+Command+F";
          } else {
            return "F11";
          }
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        }
      },
      {
        label: "Toggle Developer Tools",
        accelerator: (function() {
          if (process.platform === "darwin") {
            return "Alt+Command+I";
          } else {
            return "Ctrl+Shift+I";
          }
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        }
      },
      {
        type: "separator"
      },
      {
        label: "App Menu Demo",
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            const options = {
              type: "info",
              title: "Application Menu Demo",
              buttons: ["Ok"],
              message:
                "This demo is for the Menu section, showing how to create a clickable menu item in the application menu."
            };
            electron.dialog.showMessageBox(
              focusedWindow,
              options,
              function() {}
            );
          }
        }
      }
    ]
  },
  {
    label: "Window",
    role: "window",
    submenu: [
      {
        label: "Minimize",
        accelerator: "CmdOrCtrl+M",
        role: "minimize"
      },
      {
        label: "Close",
        accelerator: "CmdOrCtrl+W",
        role: "close"
      },
      {
        type: "separator"
      },
      {
        label: "Reopen Window",
        accelerator: "CmdOrCtrl+Shift+T",
        enabled: false,
        key: "reopenMenuItem",
        click: function() {
          app.emit("activate");
        }
      }
    ]
  },
  {
    label: "Help",
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: function() {
          electron.shell.openExternal("http://electron.atom.io");
        }
      }
    ]
  }
];

function addUpdateMenuItems(items, position) {
  if (process.mas) return;

  const version = electron.app.getVersion();
  let updateItems = [
    {
      label: `Version ${version}`,
      enabled: false
    },
    {
      label: "Checking for Update",
      enabled: false,
      key: "checkingForUpdate"
    },
    {
      label: "Check for Update",
      visible: false,
      key: "checkForUpdate",
      click: function() {
        require("electron").autoUpdater.checkForUpdates();
      }
    },
    {
      label: "Restart and Install Update",
      enabled: true,
      visible: false,
      key: "restartToUpdate",
      click: function() {
        require("electron").autoUpdater.quitAndInstall();
      }
    }
  ];

  items.splice.apply(items, [position, 0].concat(updateItems));
}

function findReopenMenuItem() {
  const menu = Menu.getApplicationMenu();
  if (!menu) return;

  let reopenMenuItem;
  menu.items.forEach(function(item) {
    if (item.submenu) {
      item.submenu.items.forEach(function(item) {
        if (item.key === "reopenMenuItem") {
          reopenMenuItem = item;
        }
      });
    }
  });
  return reopenMenuItem;
}

if (process.platform === "darwin") {
  const name = electron.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: "about"
      },
      {
        type: "separator"
      },
      {
        label: "Services",
        role: "services",
        submenu: []
      },
      {
        type: "separator"
      },
      {
        label: `Hide ${name}`,
        accelerator: "Command+H",
        role: "hide"
      },
      {
        label: "Hide Others",
        accelerator: "Command+Alt+H",
        role: "hideothers"
      },
      {
        label: "Show All",
        role: "unhide"
      },
      {
        type: "separator"
      },
      {
        label: "Quit",
        accelerator: "Command+Q",
        click: function() {
          app.quit();
        }
      }
    ]
  });

  // Window menu.
  template[3].submenu.push(
    {
      type: "separator"
    },
    {
      label: "Bring All to Front",
      role: "front"
    }
  );

  addUpdateMenuItems(template[0].submenu, 1);
}

if (process.platform === "win32") {
  const helpMenu = template[template.length - 1].submenu;
  addUpdateMenuItems(helpMenu, 0);
}

app.on("ready", function() {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

app.on("browser-window-created", function() {
  let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem) reopenMenuItem.enabled = false;
});

app.on("window-all-closed", function() {
  let reopenMenuItem = findReopenMenuItem();
  if (reopenMenuItem) reopenMenuItem.enabled = true;
});
