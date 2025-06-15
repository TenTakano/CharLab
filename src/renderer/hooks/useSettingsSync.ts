import { useEffect } from "react";

import type { Settings } from "@main/settings";

export const useSettingsSync = (
	applySettings: (settings: Partial<Settings>) => void,
) => {
	useEffect(() => {
		(async () => {
			const settings = await window.electronAPI.getSettings();
			applySettings(settings);
		})();

		const unsubscribe = window.electronAPI.onSettingsUpdates(applySettings);
		return () => unsubscribe();
	}, [applySettings]);
};
