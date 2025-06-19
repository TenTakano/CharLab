import { BrowserWindow, app, dialog, ipcMain } from "electron";

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
} from "./settings";

let mainWindow: BrowserWindow | null = null;
let contextWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

const updateImageSet = async () => {
	const images = await loadCachedImages();
	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.webContents.send("images:ready", images);
	}
};

ipcMain.handle("settings:getAll", () => getSettings());

ipcMain.on("settings:set", (_event, settings: Partial<Settings>) => {
	setSettings(settings);
	if (settings.windowSize) {
		(async () => {
			mainWindow?.webContents.send("images:startToGenerateCache");
			const windowSize = settings.windowSize!;
			try {
				await generateResizedCache(windowSize.width, windowSize.height);
				await updateImageSet();
			} catch (error) {
				console.error("Error generating resized cache:", error);
				mainWindow?.webContents.send(
					"onError",
					"画像のリサイズに失敗しました。",
				);
			}
		})();
	}
	mainWindow?.webContents.send("onSettingsUpdates", settings);
});

ipcMain.on(
	"syncWindowSizeToComponent",
	(event, size: { width: number; height: number }) => {
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

		const winPos = mainWindow.getPosition();
		const globalPosition = {
			x: cursorPosition.x + winPos[0],
			y: cursorPosition.y + winPos[1],
		};

		if (contextWindow && !contextWindow.isDestroyed()) {
			changeWindowPosition(contextWindow, globalPosition);
			contextWindow.show();
			contextWindow.focus();
			return;
		}

		contextWindow = createContextWindow(mainWindow, globalPosition);
	},
);

ipcMain.on("closeWindow:context", () => {
	if (contextWindow && !contextWindow.isDestroyed()) {
		contextWindow.hide();
	}
});

ipcMain.on("images:changeSource", async () => {
	try {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			properties: ["openDirectory"],
		});
		if (canceled || filePaths.length === 0) return;

		mainWindow?.webContents.send("images:startToGenerateCache");
		const folder = filePaths[0];
		await cacheFiles(folder);
		const { width, height } = getWindowSize();
		await generateResizedCache(width, height);
		await updateImageSet();
	} catch (error) {
		console.error("Error changing source folder:", error);
		mainWindow?.webContents.send("onError", "画像の読み込みに失敗しました。");
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
		await updateImageSet();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
