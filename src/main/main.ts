import * as path from "node:path";
import type { SelectFolderResult } from "@/common/type";
import { BrowserWindow, app, dialog, ipcMain, screen } from "electron";
import { cacheFiles, loadCachedImages } from "./image_loader";
import {
	getWindowPosition,
	getWindowSize,
	setWindowPosition,
} from "./settings";

function getIntersectionArea(
	rectA: Electron.Rectangle,
	rectB: { x: number; y: number; width: number; height: number },
): number {
	const x1 = Math.max(rectA.x, rectB.x);
	const y1 = Math.max(rectA.y, rectB.y);
	const x2 = Math.min(rectA.x + rectA.width, rectB.x + rectB.width);
	const y2 = Math.min(rectA.y + rectA.height, rectB.y + rectB.height);
	// Return 0 if there is no intersection.
	if (x2 <= x1 || y2 <= y1) {
		return 0;
	}
	const width = x2 - x1;
	const height = y2 - y1;
	return width * height;
}

ipcMain.handle("select-folder", async (): Promise<SelectFolderResult> => {
	const { canceled, filePaths } = await dialog.showOpenDialog({
		properties: ["openDirectory"],
	});
	if (canceled || filePaths.length === 0) {
		return { canceled: true };
	}
	const folder = filePaths[0];
	const files = await cacheFiles(folder);
	return { canceled: false, files };
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

const createWindow = () => {
	const { width, height } = getWindowSize();
	const savedPos = getWindowPosition();

	let useSavedPos = false;
	if (savedPos) {
		const windowRect = { x: savedPos.x, y: savedPos.y, width, height };
		const display = screen.getDisplayMatching(windowRect);
		const workArea = display.workArea;

		const visibleArea = getIntersectionArea(workArea, windowRect);
		const windowArea = width * height;
		// If less than 1/3 of the window is visible, ignore savedPos.
		if (visibleArea >= windowArea / 3) {
			useSavedPos = true;
		}
	}

	const browserWindowOptions: Electron.BrowserWindowConstructorOptions = {
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
	};
	if (useSavedPos && savedPos) {
		browserWindowOptions.x = savedPos.x;
		browserWindowOptions.y = savedPos.y;
	}

	const win = new BrowserWindow(browserWindowOptions);
	win.loadFile(path.join(__dirname, "index.html"));
};

app.commandLine.appendSwitch("enable-logging");
app.whenReady().then(async () => {
	createWindow();
	const win = BrowserWindow.getAllWindows()[0];
	win.webContents.once("did-finish-load", async () => {
		win.webContents.send("cached-images", await loadCachedImages());
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
