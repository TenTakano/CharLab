import * as fs from "node:fs";
import * as path from "node:path";
import { BrowserWindow, Menu, app, dialog, ipcMain } from "electron";

import type { SelectFolderResult } from "@/common/type";
import { getWindowSize } from "./settings";

ipcMain.handle("select-folder", async (): Promise<SelectFolderResult> => {
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
	if (canceled || filePaths.length === 0) {
		return { canceled: true };
	}
	const folder = filePaths[0];
	const files = await fs.promises.readdir(folder);
	return { canceled: false, folder, files };
});

ipcMain.on(
	"show-context-menu",
	(
		event: Electron.IpcMainEvent,
		template: Electron.MenuItemConstructorOptions[],
		position: Electron.Point,
	) => {
		const menuTemplate = template.map((item) => {
			if (item.id) {
				return {
					...item,
					click: () => {
						event.sender.send("context-menu-command", item.id);
					},
				};
			}
			return item;
		});
		const menu = Menu.buildFromTemplate(menuTemplate);
		menu.popup({
			window: BrowserWindow.fromWebContents(event.sender) || undefined,
			x: position.x,
			y: position.y,
		});
	},
);

ipcMain.on("move-window", (event, delta: { dx: number; dy: number }) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (win) {
		const [x, y] = win.getPosition();
		win.setPosition(x + delta.dx, y + delta.dy);
	}
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
			preload: path.join(__dirname, "preload.js"),
		},
	});
	win.loadFile(path.join(__dirname, "index.html"));
};

app.commandLine.appendSwitch("enable-logging");
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
