import type { SelectFolderResult } from "@/common/type";
import { createMainWindow } from "@main/windows/mainWindow";
import { createSettingsWindow } from "@main/windows/settingsWindow";
import { BrowserWindow, app, dialog, ipcMain } from "electron";
import {
	cacheFiles,
	generateResizedCache,
	loadCachedImages,
} from "./image_loader";
import { getWindowSize, setWindowPosition, setWindowSize } from "./settings";

let mainWindow: BrowserWindow | null = null;
let settingsWin: BrowserWindow | null = null;

const changeWindowSize = (
	win: BrowserWindow,
	size: { width: number; height: number },
) => {
	win.setResizable(true);
	win.setSize(size.width, size.height);
	win.setResizable(false);
	win.webContents.send("window-size-change", size);
};

ipcMain.handle("select-folder", async (): Promise<SelectFolderResult> => {
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
	if (canceled || filePaths.length === 0) {
		return { canceled: true };
	}

	const win = BrowserWindow.getAllWindows()[0];
	win.webContents.send("folder-changed");
	const folder = filePaths[0];
	await cacheFiles(folder);
	const { width, height } = getWindowSize();
	await generateResizedCache(width, height);
	return { canceled: false, files: await loadCachedImages() };
});

ipcMain.on(
	"change-image-size",
	async (event, size: { width: number; height: number }) => {
		await generateResizedCache(size.width, size.height);
		setWindowSize(size.width, size.height);
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) {
			win.webContents.send("images-ready", await loadCachedImages());
			changeWindowSize(win, size);
		}
	},
);

ipcMain.on("move-window", (event, delta: { dx: number; dy: number }) => {
	const win = BrowserWindow.fromWebContents(event.sender);
	if (win) {
		const [x, y] = win.getPosition();
		const newX = x + delta.dx;
		const newY = y + delta.dy;
		win.setPosition(newX, newY);
		setWindowPosition(newX, newY);
	}
});

ipcMain.on("open-settings-window", () => {
	if (!mainWindow) return;

	if (settingsWin && !settingsWin.isDestroyed()) {
		settingsWin.show();
		settingsWin.focus();
		return;
	}

	settingsWin = createSettingsWindow(mainWindow);
});

app.commandLine.appendSwitch("enable-logging");
app.whenReady().then(async () => {
	mainWindow = createMainWindow();
	mainWindow!.webContents.once("did-finish-load", async () => {
		mainWindow!.webContents.send("images-ready", await loadCachedImages());
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
