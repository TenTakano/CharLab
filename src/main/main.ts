import fs from "node:fs";

import { BrowserWindow, app, dialog, ipcMain } from "electron";
import { imageSize } from "image-size";

import type { SelectFolderResult } from "@/common/type";
import { createContextWindow } from "@main/windows/contextWindow";
import { createMainWindow } from "@main/windows/mainWindow";
import { createSettingsWindow } from "@main/windows/settingsWindow";
import { changeWindowPosition, changeWindowSize } from "@main/windows/utils";
import {
	cacheFiles,
	generateResizedCache,
	loadCachedImages,
} from "./image_loader";
import {
	type Settings,
	getSettings,
	getWindowSize,
	setSettings,
	setWindowPosition,
	setWindowSize,
} from "./settings";

let mainWindow: BrowserWindow | null = null;
let contextWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const updateImageSet = async () => {
	const images = await loadCachedImages();
	if (mainWindow && !mainWindow.isDestroyed()) {
		const buffer = fs.readFileSync(images[0]);
		const size = imageSize(buffer);
		changeWindowSize(mainWindow, { width: size.width, height: size.height });
		mainWindow.webContents.send("images:ready", images);
	}
};

ipcMain.handle("settings:getAll", () => getSettings());

ipcMain.on("settings:set", (_event, settings: Partial<Settings>) => {
	setSettings(settings);
	if (settings.windowSize) {
		(async () => {
			const windowSize = settings.windowSize!;
			await generateResizedCache(windowSize.width, windowSize.height);
			setWindowSize(windowSize.width, windowSize.height);
		})();
	}
	mainWindow?.webContents.send("onSettingsUpdates", settings);
});

ipcMain.on(
	"syncWindowToComponent",
	(event, size: { width: number; height: number }) => {
		if (!mainWindow || mainWindow.isDestroyed()) return;

		const senderWin = BrowserWindow.fromWebContents(event.sender);
		if (senderWin) {
			changeWindowSize(senderWin, size);
			const currentPosition = senderWin.getPosition();
			changeWindowPosition(senderWin, {
				x: currentPosition[0],
				y: currentPosition[1],
			});
		}
	},
);

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

ipcMain.on(
	"openWindow:context",
	(_event, cursorPosition: { x: number; y: number }) => {
		if (!mainWindow) return;

		if (contextWindow && !contextWindow.isDestroyed()) {
			contextWindow.show();
			contextWindow.focus();
			return;
		}

		contextWindow = createContextWindow(mainWindow, cursorPosition);
	},
);

ipcMain.on("closeWindow:context", () => {
	if (contextWindow && !contextWindow.isDestroyed()) {
		contextWindow.hide();
	}
});

ipcMain.on("openWindow:settings", () => {
	if (!mainWindow) return;

	if (settingsWindow && !settingsWindow.isDestroyed()) {
		settingsWindow.show();
		settingsWindow.focus();
		return;
	}

	settingsWindow = createSettingsWindow(mainWindow);
});

ipcMain.on("closeWindow:settings", () => {
	if (settingsWindow && !settingsWindow.isDestroyed()) {
		settingsWindow.hide();
	}
});

ipcMain.on("set-settings-window-size", (_event, size) => {
	if (!settingsWindow || settingsWindow.isDestroyed()) return;
	changeWindowSize(settingsWindow, size);
});

app.commandLine.appendSwitch("enable-logging");
app.whenReady().then(async () => {
	mainWindow = createMainWindow();
	mainWindow!.webContents.once("did-finish-load", async () => {
		mainWindow!.webContents.send("images:ready", await updateImageSet());
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
