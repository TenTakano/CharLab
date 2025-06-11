import path from "node:path";
import { BrowserWindow, screen } from "electron";

export function createSettingsWindow(parent: BrowserWindow): BrowserWindow {
	const sw = 400;
	const sh = 300;
	const { x, y, width, height } = parent.getBounds();

	let xx = Math.round(x + (width - sw) / 2);
	let yy = Math.round(y + (height - sh) / 2);

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

	win.once("ready-to-show", () => win.show());
	win.loadFile(path.join(__dirname, "settings.html"));
	return win;
}
