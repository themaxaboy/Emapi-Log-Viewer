// Native
const { join } = require("path");
const { format } = require("url");

// Packages
const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");
const fs = require("fs");

// Database Sqlite3
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("EmapiMessage.db");

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
  db.close();
  app.quit;
});

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event, message) => {
  event.sender.send("message", message);
});

ipcMain.on("open-file-dialog", function(event) {
  dialog.showOpenDialog(
    {
      properties: ["openFile", "openDirectory"]
    },
    function(files) {
      if (files) {
        //event.sender.send("selected-directory", files);
        readFileToDatebase(files);
      }
    }
  );
});

ipcMain.on("database-insert", function(event) {
  db.serialize(function() {
    db.run("DROP TABLE emapi");
    db.run("CREATE TABLE emapi (msg TEXT)");

    var stmt = db.prepare("INSERT INTO emapi VALUES (?)");
    for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, msg FROM emapi", function(err, row) {
      console.log(row.id + ": " + row.msg);
      event.sender.send("database-query", row);
    });
  });

  db.close();
});

let readFileToDatebase = path => {
  let directory = String(path);

  fs.readdir(directory, (err, files) => {
    messageData = [];
    let itemsProcessed = 0;

    files.map((filename, index, array) => {
      let filepath = directory + "\\" + filename;

      fs.readFile(filepath, "utf8", (err, data) => {
        if (err) {
          return console.log(err);
        }

        let dataPack = data.trim().split(/\n/);
        let messageObject = [];

        dataPack.map((singleLine, index) => {
          messageObject.push({
            date: singleLine.substring(0, 8),
            time: singleLine.substring(9, 21),
            type: singleLine.substring(
              singleLine.indexOf("[") + 1,
              singleLine.indexOf("]")
            ),
            message: singleLine.substring(singleLine.indexOf("]") + 1).trim()
          });
        });
        messageData = messageData.concat(messageObject);
        itemsProcessed++;
        console.log(itemsProcessed);
        if (itemsProcessed === array.length) {
          //Save to data base
          db.serialize(function() {
            db.run("CREATE TABLE emapi (msg TEXT)");
            db.run("begin transaction");

            const stmt = db.prepare("INSERT INTO emapi VALUES (?)");

            messageData.map(data => {
              stmt.run(data.message);
              messageData.splice(0, 1);
            });
            db.run("commit");

            stmt.finalize();
          });
          messageData = [];
          db.close();
          console.log("Finish.");
        }
      });
    });
  });
};
