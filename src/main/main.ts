import { app, BrowserWindow, dialog, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";

import { SelectFolderResult } from "@/common/type";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 400,
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

app.commandLine.appendSwitch("enable-logging");
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
