import { contextBridge, ipcRenderer } from "electron";

import type { SelectFolderResult } from "@/common/type";

declare global {
	interface Window {
		electronAPI: {
			onImagesReady: (callback: (images: string[]) => void) => void;
			selectFolder: () => Promise<SelectFolderResult>;
			changeImageSize: (size: { width: number; height: number }) => void;
			moveWindow: (delta: { dx: number; dy: number }) => void;
		};
	}
}

contextBridge.exposeInMainWorld("electronAPI", {
	onImagesReady: (callback: (images: string[]) => void) => {
		ipcRenderer.on("images-ready", (_event, state) => {
			callback(state);
		});
	},

	selectFolder: () => ipcRenderer.invoke("select-folder"),

	changeImageSize: (size: { width: number; height: number }) => {
		ipcRenderer.send("change-image-size", size);
	},

	moveWindow: (delta: { dx: number; dy: number }) => {
		ipcRenderer.send("move-window", delta);
	},
});
