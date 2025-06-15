import { useLayoutEffect, useRef } from "react";

import style from "./style.module.css";

const App: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);

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
		// To be implemented: Handle auto-play functionality
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
				自動再生する
			</button>
			<button type="button" onClick={handleSettings}>
				設定
			</button>
		</div>
	);
};

export default App;
