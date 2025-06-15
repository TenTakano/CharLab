import path from "node:path";
import { BrowserWindow, screen } from "electron";

export function createContextWindow(
	parent: BrowserWindow,
	cursorPosition: { x: number; y: number },
): BrowserWindow {
	const sw = 400;
	const sh = 300;

	let xx = cursorPosition.x;
	let yy = cursorPosition.y;

	const wa = screen.getDisplayMatching(parent.getBounds()).workArea;
	xx = Math.min(Math.max(xx, wa.x), wa.x + wa.width - sw);
	yy = Math.min(Math.max(yy, wa.y), wa.y + wa.height - sh);

	const win = new BrowserWindow({
		parent,
		width: sw,
		height: sh,
		x: xx,
		y: yy,
		resizable: false,
		maximizable: false,
		minimizable: false,
		alwaysOnTop: true,
		show: false,
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

	return win;
}
