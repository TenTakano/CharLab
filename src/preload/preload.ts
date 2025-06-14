import { contextBridge, ipcRenderer } from "electron";

import type { SelectFolderResult } from "@/common/type";
import type { Settings } from "@main/settings";

declare global {
	interface Window {
		electronAPI: {
			getSettings: () => Settings;
			onImagesReady: (callback: (images: string[]) => void) => void;
			onFolderChanged: (callback: () => void) => void;
			onWindowSizeChange: (
				callback: (size: { width: number; height: number }) => void,
			) => void;
			selectFolder: () => Promise<SelectFolderResult>;
			changeImageSize: (size: { width: number; height: number }) => void;
			moveWindow: (delta: { dx: number; dy: number }) => void;

			// Settings window
			openSettingsWindow: () => void;
			setSettingsWindowSize: (size: { width: number; height: number }) => void;
		};
	}
}

contextBridge.exposeInMainWorld("electronAPI", {
	getSettings: () => ipcRenderer.invoke("settings:getAll"),

	onImagesReady: (callback: (images: string[]) => void) => {
		ipcRenderer.on("images-ready", (_event, state) => {
			callback(state);
		});
	},

	onFolderChanged: (callback: () => void) => {
		ipcRenderer.on("folder-changed", () => {
			callback();
		});
	},

	onWindowSizeChange: (
		callback: (size: { width: number; height: number }) => void,
	) => {
		ipcRenderer.on("window-size-change", (_event, size) => {
			callback(size);
		});
	},

	selectFolder: () => ipcRenderer.invoke("select-folder"),

	changeImageSize: (size: { width: number; height: number }) => {
		ipcRenderer.send("change-image-size", size);
	},

	moveWindow: (delta: { dx: number; dy: number }) => {
		ipcRenderer.send("move-window", delta);
	},

	// Settings window related APIs
	openSettingsWindow: () => ipcRenderer.send("open-settings-window"),

	setSettingsWindowSize: (size: { width: number; height: number }) => {
		ipcRenderer.send("set-settings-window-size", size);
	},
});
