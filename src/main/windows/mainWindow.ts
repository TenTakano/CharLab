import path from "node:path";
import { BrowserWindow, screen } from "electron";

import { getWindowPosition, getWindowSize } from "@main/settings";

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

export const createMainWindow = () => {
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
		resizable: false,
		maximizable: false,
		minimizable: true,
		transparent: true,
		alwaysOnTop: true,
		frame: false,
		skipTaskbar: true,
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
	return win;
};
