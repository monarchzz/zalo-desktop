import { app, BrowserWindow, Tray, nativeImage, Menu } from "electron";
import * as path from "path";
import MenuBuilder from "./menu";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuiting = false;

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, "assets")
  : path.join(__dirname, "../assets");

const icon = nativeImage.createFromPath(path.join(RESOURCES_PATH, "icon.png"));

function createTray() {
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Toggle",
      click: () => {
        mainWindow?.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: icon,
  });

  mainWindow.loadURL("https://chat.zalo.me/");

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  // mainWindow.on("closed", () => {});
  mainWindow.on("close", function (event) {
    if (!isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.setTitle("Zalo");
  });
  // build menu
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createTray();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    isQuiting = true;
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
