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
const db = new sqlite3.cached.Database("EmapiMessage.db");

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
        readFileToDatebase(event, files);
        event.sender.send("selected-directory", files);
      }
    }
  );
});

let readFileToDatebase = (event, path) => {
  let directory = String(path);
  db.serialize(() => {
    db.run("PRAGMA synchronous = OFF");
    db.run("PRAGMA journal_mode = WAL");

    db.run("begin transaction");
    db.run("DROP TABLE emapi");
    db.run("CREATE TABLE emapi (date,time,type,message)");
    db.run("commit");
  });

  fs.readdir(directory, (err, files) => {
    messageData = [];
    let itemsProcessed = 0;

    files.map((filename, index, array) => {
      let filepath = directory + "\\" + filename;

      fs.readFile(filepath, "utf8", (err, data) => {
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
            message: singleLine.trim()
          });
        });

        messageData.push(...messageObject);
        itemsProcessed++;
        console.log(parseInt(itemsProcessed / array.length * 100) + "%");

        if (itemsProcessed === array.length) {
          console.log("Read Finish.");
          let timeToInsert = new Date().getTime();
          const stmt = db.prepare("INSERT INTO emapi VALUES (?,?,?,?)");

          db.serialize(() => {
            db.run("begin transaction");

            messageData.map((data, index, array) => {
              stmt.run(data.date, data.time, data.type, data.message);

              if (index % 1000 == 0 && index != 0) {
                db.run("commit");
                console.log(parseInt(index / array.length * 100) + "%");
                event.sender.send(
                  "progress",
                  parseInt(index / array.length * 100)
                );
                messageData.splice(0, 1000);
                db.run("begin transaction");
              } else if (index == array.length - 1) {
                db.run("commit");
                console.log("100%");
                event.sender.send("progress", 100);
                messageData = [];
              }
            });
          });
          console.log(
            "Insert Finish in : " +
              (new Date().getTime() - timeToInsert) / 1000 +
              "Sec."
          );
        }
      });
    });
  });
};

let queryDatabase = (type = "") => {
  return new Promise((resolve, reject) => {
    let queryData = [];
    let sql = "SELECT * FROM emapi WHERE type = ?";

    if (type == "") {
      sql = "SELECT * FROM emapi";
    }

    db.each(
      sql,
      [type],
      (err, row) => {
        if (err) {
          reject(err);
        }
        queryData.push(row);
      },
      (err, found) => {
        resolve(queryData);
      }
    );
  });
};

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event, message) => {
  event.sender.send("message", message);
});

ipcMain.on("query-database", async (event, type) => {
  event.sender.send("executed-database", await queryDatabase(type));
});
