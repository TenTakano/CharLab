import { app } from "electron";
import Store from "electron-store";

export interface Settings {
  dirPath: string;
  windowWidth: number;
  windowHeight: number;
}

const defaults: Settings = {
  dirPath: "",
  windowWidth: 800,
  windowHeight: 600,
};

const store = new Store<Settings>({
  name: "settings",
  cwd: app.getPath("userData"),
  defaults,
});

export function getSettings(): Settings {
  return {
    dirPath: store.get("dirPath"),
    windowWidth: store.get("windowWidth"),
    windowHeight: store.get("windowHeight"),
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
