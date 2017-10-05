// Native
const { join } = require("path");
const { format } = require("url");

// Packages
const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");
const fs = require("fs");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });

  const url = isDev
    ? "http://localhost:8000/start"
    : format({
        pathname: join(__dirname, "../renderer/start/index.html"),
        protocol: "file:",
        slashes: true
      });

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on("window-all-closed", () => {
  app.quit;
});

ipcMain.on("open-file-dialog", event => {
  dialog.showOpenDialog(
    {
      properties: ["openFile", "openDirectory"]
    },
    files => {
      if (files) {
        event.sender.send("selected-directory", files);
      }
    }
  );
});

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event, message) => {
  event.sender.send("message", message);
});
