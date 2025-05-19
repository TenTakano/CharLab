import { contextBridge, ipcRenderer } from "electron";

import { SelectFolderResult } from "@/common/type";

declare global {
  interface Window {
    widgetAPI: {
      selectFolder: () => Promise<SelectFolderResult>;
    }
  }
}

contextBridge.exposeInMainWorld("widgetAPI", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),
});
