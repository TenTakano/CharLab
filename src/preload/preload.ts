import { contextBridge, ipcRenderer } from "electron";

import type { SelectFolderResult } from "@/common/type";
import type { Settings } from "@main/settings";

declare global {
	interface Window {
		electronAPI: {
			// common
			getSettings: () => Settings;
			setSettings: (settings: Partial<Settings>) => void;
			onSettingsUpdates: (callback: (settings: Settings) => void) => () => void;
			syncWindowToComponent: (size: { width: number; height: number }) => void;

			// main window
			onImagesReady: (callback: (images: string[]) => void) => () => void;
			onFolderChanged: (callback: () => void) => void;
			selectFolder: () => Promise<SelectFolderResult>;
			moveWindow: (delta: { dx: number; dy: number }) => void;

			// Context window
			openContextWindow: (cursorPosition: { x: number; y: number }) => void;
			closeContextWindow: () => void;

			// Settings window
			openSettingsWindow: () => void;
			closeSettingsWindow: () => void;
			setSettingsWindowSize: (size: { width: number; height: number }) => void;
		};
	}
}

contextBridge.exposeInMainWorld("electronAPI", {
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

	syncWindowToComponent: (size: { width: number; height: number }) => {
		ipcRenderer.send("syncWindowToComponent", size);
	},

	onImagesReady: (callback: (images: string[]) => void) => {
		const listener = (_event: Electron.IpcRendererEvent, images: string[]) => {
			callback(images);
		};
		ipcRenderer.on("images:ready", listener);

		return () => {
			ipcRenderer.removeListener("images:ready", listener);
		};
	},

	onFolderChanged: (callback: () => void) => {
		ipcRenderer.on("folder-changed", () => {
			callback();
		});
	},

	selectFolder: () => ipcRenderer.invoke("select-folder"),

	moveWindow: (delta: { dx: number; dy: number }) => {
		ipcRenderer.send("move-window", delta);
	},

	// Context window related APIs
	openContextWindow: (cursorPosition: { x: number; y: number }) =>
		ipcRenderer.send("openWindow:context", cursorPosition),

	closeContextWindow: () => ipcRenderer.send("closeWindow:context"),

	// Settings window related APIs
	openSettingsWindow: () => ipcRenderer.send("openWindow:settings"),

	closeSettingsWindow: () => ipcRenderer.send("closeWindow:settings"),

	setSettingsWindowSize: (size: { width: number; height: number }) => {
		ipcRenderer.send("set-settings-window-size", size);
	},
});
