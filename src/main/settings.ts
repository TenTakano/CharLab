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
}

const defaults: Settings = {
	windowWidth: 800,
	windowHeight: 600,
	dirPath: "",
	windowPosition: {
		x: 0,
		y: 0,
	},
};

const store = new Store<Settings>({
	name: "settings",
	cwd: app.getPath("userData"),
	defaults,
});

export function getSettings(): Settings {
	return {
		windowWidth: store.get("windowWidth"),
		windowHeight: store.get("windowHeight"),
		dirPath: store.get("dirPath"),
		windowPosition: store.get("windowPosition"),
	};
}

export function resetSettings(): void {
	store.clear();
}

export function getWindowSize(): { width: number; height: number } {
	return {
		width: store.get("windowWidth"),
		height: store.get("windowHeight"),
	};
}

export function getWindowPosition(): { x: number; y: number } {
	return store.get("windowPosition");
}

export function setWindowPosition(x: number, y: number): void {
	store.set("windowPosition", { x, y });
}

export function getDirPath(): string {
	return store.get("dirPath");
}
