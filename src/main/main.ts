import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import * as path from "path";
import * as fs from "fs";

import { SelectFolderResult } from "@/common/type";
import { getWindowSize } from "./settings";

ipcMain.handle("select-folder", async (): Promise<SelectFolderResult> => {
  const { canceled, filePaths } = await dialog.showOpenDialog(
    { properties: ["openDirectory"] }
  );
  if (canceled || filePaths.length === 0) {
    return { canceled: true };
  }
  const folder = filePaths[0];
  const files = await fs.promises.readdir(folder);
  return { canceled: false, folder, files };
});

ipcMain.on("show-context-menu", (event: Electron.IpcMainEvent, template: Electron.MenuItemConstructorOptions[], position: Electron.Point) => {
  const menuTemplate = template.map((item) => {
    if (item.id) {
      return {
        ...item,
        click: () => {event.sender.send("context-menu-command", item.id)},
      }
    } else {
      return item;
    }
  })
  const menu = Menu.buildFromTemplate(menuTemplate);
  menu.popup({
    window: BrowserWindow.fromWebContents(event.sender) || undefined,
    x: position.x,
    y: position.y
  });
});

const createWindow = () => {
  const { width, height } = getWindowSize();
  const win = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.commandLine.appendSwitch("enable-logging");
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
