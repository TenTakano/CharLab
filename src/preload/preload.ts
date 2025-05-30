import { contextBridge, ipcRenderer } from "electron";

import type { SelectFolderResult } from "@/common/type";

declare global {
	interface Window {
		electronAPI: {
			selectFolder: () => Promise<SelectFolderResult>;
			moveWindow: (delta: { dx: number; dy: number }) => void;
		};
	}
}

contextBridge.exposeInMainWorld("electronAPI", {
	selectFolder: () => ipcRenderer.invoke("select-folder"),

	moveWindow: (delta: { dx: number; dy: number }) => {
		ipcRenderer.send("move-window", delta);
	},
});
