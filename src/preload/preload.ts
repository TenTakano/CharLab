import { contextBridge, ipcRenderer } from "electron";

import type { SelectFolderResult } from "@/common/type";

declare global {
	interface Window {
		electronAPI: {
			selectFolder: () => Promise<SelectFolderResult>;
			showContextMenu: (
				template: Electron.MenuItemConstructorOptions[],
				position: Electron.Point,
			) => void;
			onMenuItemClicked: (callback: (id: string) => void) => void;
			moveWindow: (delta: { dx: number; dy: number }) => void;
		};
	}
}

contextBridge.exposeInMainWorld("electronAPI", {
	selectFolder: () => ipcRenderer.invoke("select-folder"),

	showContextMenu: (
		template: Electron.MenuItemConstructorOptions[],
		position: Electron.Point,
	) => ipcRenderer.send("show-context-menu", template, position),

	onMenuItemClicked: (callback: (id: string) => void) => {
		ipcRenderer.on("context-menu-command", (_event, id) => callback(id));
	},

	moveWindow: (delta: { dx: number; dy: number }) => {
		ipcRenderer.send("move-window", delta);
	},
});
