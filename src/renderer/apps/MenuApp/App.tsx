import { useLayoutEffect, useRef } from "react";

const App: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const rect = el.getBoundingClientRect();
		window.electronAPI.syncWindowToComponent({
			width: rect.width,
			height: rect.height,
		});
	}, []);

	return <div ref={containerRef}>Implement me</div>;
};

export default App;
