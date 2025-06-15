import path from "node:path";
import { BrowserWindow, screen } from "electron";

export function createContextWindow(
	parent: BrowserWindow,
	cursorPosition: { x: number; y: number },
): BrowserWindow {
	const win = new BrowserWindow({
		parent,
		width: 400, // Temporary width, should be adjusted later
		height: 300, // Temporary height, should be adjusted later
		x: cursorPosition.x,
		y: cursorPosition.y,
		resizable: false,
		maximizable: false,
		minimizable: false,
		alwaysOnTop: true,
		show: false,
		frame: false,
		skipTaskbar: true,
		backgroundColor: "#00000000", // Transparent background
		transparent: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.removeMenu();
	win.once("ready-to-show", () => win.show());
	win.loadFile(path.join(__dirname, "menu.html"));
	win.on("close", (event) => {
		event.preventDefault();
		win.hide();
	});
	win.on("blur", () => {
		win.hide();
	});

	return win;
}
