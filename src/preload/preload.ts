import { contextBridge, ipcRenderer } from "electron";

import type { Settings } from "@main/settings";

declare global {
	interface Window {
		electronAPI: {
			// common
			getSettings: () => Promise<Settings>;
			setSettings: (settings: Partial<Settings>) => void;
			onSettingsUpdates: (callback: (settings: Settings) => void) => () => void;
			syncWindowSizeToComponent: (size: {
				width: number;
				height: number;
			}) => void;

			// Main window
			onImagesReady: (callback: (images: string[]) => void) => () => void;
			onStartToGenerateCache: (callback: () => void) => () => void;
			moveWindow: (delta: { dx: number; dy: number }) => void;
			onError: (callback: (error: string) => void) => () => void;

			// Context window
			openContextWindow: (cursorPosition: { x: number; y: number }) => void;
			closeContextWindow: () => void;
			changeSource: () => void;
			quitApp: () => void;

			// Settings window
			openSettingsWindow: () => void;
			closeSettingsWindow: () => void;
		};
	}
}

contextBridge.exposeInMainWorld("electronAPI", {
	// Common
	getSettings: () => ipcRenderer.invoke("settings:getAll"),

	setSettings: (settings: Partial<Settings>) => {
		ipcRenderer.send("settings:set", settings);
	},

	onSettingsUpdates: (callback: (settings: Settings) => void) => {
		const listener = (
			_event: Electron.IpcRendererEvent,
			settings: Settings,
		) => {
			callback(settings);
		};
		ipcRenderer.on("onSettingsUpdates", listener);

		return () => {
			ipcRenderer.removeListener("onSettingsUpdates", listener);
		};
	},

	syncWindowSizeToComponent: (size: { width: number; height: number }) => {
		ipcRenderer.send("syncWindowSizeToComponent", size);
	},

	// Main window
	onImagesReady: (callback: (images: string[]) => void) => {
		const listener = (_event: Electron.IpcRendererEvent, images: string[]) => {
			callback(images);
		};
		ipcRenderer.on("images:ready", listener);

		return () => {
			ipcRenderer.removeListener("images:ready", listener);
		};
	},

	onStartToGenerateCache: (callback: () => void) => {
		const listener = (_event: Electron.IpcRendererEvent) => {
			callback();
		};
		ipcRenderer.on("images:startToGenerateCache", listener);

		return () => {
			ipcRenderer.removeListener("images:startToGenerateCache", listener);
		};
	},

	moveWindow: (delta: { dx: number; dy: number }) => {
		ipcRenderer.send("move-window", delta);
	},

	onError: (callback: (error: string) => void) => {
		const listener = (_event: Electron.IpcRendererEvent, error: string) => {
			callback(error);
		};
		ipcRenderer.on("onError", listener);

		return () => {
			ipcRenderer.removeListener("onError", listener);
		};
	},

	// Context window related APIs
	openContextWindow: (cursorPosition: { x: number; y: number }) =>
		ipcRenderer.send("openWindow:context", cursorPosition),

	closeContextWindow: () => ipcRenderer.send("closeWindow:context"),

	changeSource: () => ipcRenderer.send("images:changeSource"),

	quitApp: () => ipcRenderer.send("app:quit"),

	// Settings window related APIs
	openSettingsWindow: () => ipcRenderer.send("openWindow:settings"),

	closeSettingsWindow: () => ipcRenderer.send("closeWindow:settings"),
});
