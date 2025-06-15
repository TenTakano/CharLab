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

	return (
		<div ref={containerRef} className={style.container}>
			<button type="button">フォルダを選択</button>
			<button type="button">自動再生する</button>
			<button type="button">設定</button>
		</div>
	);
};

export default App;
