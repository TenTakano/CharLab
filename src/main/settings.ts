import { app } from "electron";
import Store from "electron-store";

export interface Settings {
	windowSize: { width: number; height: number };
	windowPosition: { x: number; y: number };
	dirPath: string;
	autoPlay: boolean;
	playbackDirection: number; // 1 for forward, -1 for backward
	fps: number;
}

const defaults: Settings = {
	windowSize: { width: 800, height: 600 },
	windowPosition: { x: 0, y: 0 },
	dirPath: "",
	autoPlay: false,
	playbackDirection: 1,
	fps: 30,
};

const store = new Store<Settings>({
	name: "settings",
	cwd: app.getPath("userData"),
	defaults,
});

let cache: Settings = {
	windowSize: store.get("windowSize"),
	windowPosition: store.get("windowPosition"),
	dirPath: store.get("dirPath"),
	autoPlay: store.get("autoPlay"),
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
		windowSize: store.get("windowSize"),
		windowPosition: store.get("windowPosition"),
		dirPath: store.get("dirPath"),
		autoPlay: store.get("autoPlay"),
		playbackDirection: store.get("playbackDirection"),
		fps: store.get("fps"),
	};
}

export function getWindowSize(): { width: number; height: number } {
	return {
		width: cache.windowSize.width,
		height: cache.windowSize.height,
	};
}

export function setWindowSize(width: number, height: number): void {
	store.set("windowSize", { width, height });
	cache.windowSize = { width, height };
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
