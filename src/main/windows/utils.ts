import { screen } from "electron";

export function changeWindowSize(
	win: Electron.BrowserWindow,
	size: { width: number; height: number },
): void {
	const allowResize = win.isResizable();
	if (!allowResize) win.setResizable(true);
	win.setSize(size.width, size.height);
	if (!allowResize) win.setResizable(false);
}

export function changeWindowPosition(
	win: Electron.BrowserWindow,
	position: { x: number; y: number },
): { x: number; y: number } {
	const { x, y } = position;
	win.setPosition(x, y);

	const [winWidth, winHeight] = win.getSize();
	const display = screen.getDisplayMatching({
		x,
		y,
		width: winWidth,
		height: winHeight,
	});
	const {
		x: areaX,
		y: areaY,
		width: areaWidth,
		height: areaHeight,
	} = display.workArea;

	const clampedX = Math.min(Math.max(x, areaX), areaX + areaWidth - winWidth);
	const clampedY = Math.min(Math.max(y, areaY), areaY + areaHeight - winHeight);
	win.setPosition(clampedX, clampedY);
	return { x, y };
}
