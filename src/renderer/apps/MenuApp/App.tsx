import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Settings } from "@main/settings";
import { useSettingsSync } from "@ui/hooks/useSettingsSync";
import style from "./style.module.css";

const App: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);

	const [autoPlayback, setAutoPlayback] = useState(false);

	useSettingsSync((settings: Partial<Settings>) => {
		if (settings.autoPlay !== undefined) {
			setAutoPlayback(settings.autoPlay);
		}
	});

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const rect = el.getBoundingClientRect();
		window.electronAPI.syncWindowSizeToComponent({
			width: rect.width,
			height: rect.height,
		});
	}, []);

	const handleSelectFolder = () => {
		// To be implemented: Handle folder selection
		window.electronAPI.closeContextWindow();
	};

	const handleAutoPlay = () => {
		setAutoPlayback(!autoPlayback);
		window.electronAPI.setSettings({ autoPlay: !autoPlayback });
		window.electronAPI.closeContextWindow();
	};

	const handleSettings = () => {
		window.electronAPI.openSettingsWindow();
		window.electronAPI.closeContextWindow();
	};

	return (
		<div ref={containerRef} className={style.container}>
			<button type="button" onClick={handleSelectFolder}>
				フォルダを選択
			</button>
			<button type="button" onClick={handleAutoPlay}>
				{autoPlayback ? "自動再生を停止する" : "自動再生する"}
			</button>
			<button type="button" onClick={handleSettings}>
				設定
			</button>
		</div>
	);
};

export default App;
