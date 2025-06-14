import { app } from "electron";
import Store from "electron-store";

export interface Settings {
	windowWidth: number;
	windowHeight: number;
	dirPath: string;
	windowPosition: {
		x: number;
		y: number;
	};
	playbackDirection: number; // 1 for forward, -1 for backward
	fps: number;
}

const defaults: Settings = {
	windowWidth: 800,
	windowHeight: 600,
	dirPath: "",
	windowPosition: {
		x: 0,
		y: 0,
	},
	playbackDirection: 1,
	fps: 30,
};

const store = new Store<Settings>({
	name: "settings",
	cwd: app.getPath("userData"),
	defaults,
});

let cache: Settings = {
	windowWidth: store.get("windowWidth"),
	windowHeight: store.get("windowHeight"),
	dirPath: store.get("dirPath"),
	windowPosition: store.get("windowPosition"),
	playbackDirection: store.get("playbackDirection"),
	fps: store.get("fps"),
};

export function getSettings(): Settings {
	return { ...cache };
}

export function setSettings(settings: Partial<Settings>): void {
	const newSettings: Settings = {
		...cache,
		...settings,
	};
	store.set(newSettings);
	cache = newSettings;
}

export function resetSettings(): void {
	store.clear();

	cache = {
		windowWidth: store.get("windowWidth"),
		windowHeight: store.get("windowHeight"),
		dirPath: store.get("dirPath"),
		windowPosition: store.get("windowPosition"),
		playbackDirection: store.get("playbackDirection"),
		fps: store.get("fps"),
	};
}

export function getWindowSize(): { width: number; height: number } {
	return {
		width: cache.windowWidth,
		height: cache.windowHeight,
	};
}

export function setWindowSize(width: number, height: number): void {
	store.set("windowWidth", width);
	store.set("windowHeight", height);
	cache.windowWidth = width;
	cache.windowHeight = height;
}

export function getWindowPosition(): { x: number; y: number } {
	return { ...cache.windowPosition };
}

export function setWindowPosition(x: number, y: number): void {
	store.set("windowPosition", { x, y });
	cache.windowPosition = { x, y };
}

export function getDirPath(): string {
	return cache.dirPath;
}
