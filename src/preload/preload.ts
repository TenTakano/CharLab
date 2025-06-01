import { contextBridge, ipcRenderer } from "electron";

import type { SelectFolderResult } from "@/common/type";

declare global {
	interface Window {
		electronAPI: {
			onInitialState: (callback: (images: string[]) => void) => void;
			selectFolder: () => Promise<SelectFolderResult>;
			moveWindow: (delta: { dx: number; dy: number }) => void;
		};
	}
}

contextBridge.exposeInMainWorld("electronAPI", {
	onInitialState: (callback: (images: string[]) => void) => {
		ipcRenderer.on("cached-images", (_event, state) => {
			callback(state);
		});
	},

	selectFolder: () => ipcRenderer.invoke("select-folder"),

	moveWindow: (delta: { dx: number; dy: number }) => {
		ipcRenderer.send("move-window", delta);
	},
});
