import { useEffect, useRef, useState } from "react";

// import { useImageCanvas } from "@ui/hooks/useImageCanvas";
import ViewerCanvas from "@ui/components/ViewerCanvas";
import type { ViewerCanvasHandle } from "@ui/components/ViewerCanvas/types";
import style from "./style.module.css";

const App: React.FC = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<ViewerCanvasHandle>(null);
	const isMovingWindow = useRef(false);
	const lastScreen = useRef({ x: 0, y: 0 });

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = window.electronAPI.onError((error: string) => {
			setError(error);
		});

		return () => {
			unsubscribe();
		};
	}, []);

	const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		window.electronAPI.openContextWindow({ x: e.clientX, y: e.clientY });
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		canvasRef.current?.onMouseDown(e);
		if (!e.shiftKey) return;

		isMovingWindow.current = true;
		lastScreen.current = { x: e.screenX, y: e.screenY };
		wrapperRef.current!.style.cursor = "move";
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		canvasRef.current?.onMouseMove(e);
		if (!isMovingWindow.current) return;

		const dx = e.screenX - lastScreen.current.x;
		const dy = e.screenY - lastScreen.current.y;
		lastScreen.current = { x: e.screenX, y: e.screenY };
		window.electronAPI.moveWindow({ dx, dy });
	};

	const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
		canvasRef.current?.onMouseUp(e);
		if (!isMovingWindow.current) return;

		isMovingWindow.current = false;
		wrapperRef.current!.style.cursor = "grab";
	};

	return (
		<div
			className={style.container}
			ref={wrapperRef}
			onContextMenu={handleContextMenu}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			<ViewerCanvas
				ref={canvasRef}
				handleCursorChange={(cursor: string) => {
					wrapperRef.current!.style.cursor = cursor;
				}}
			/>
			{error && <div className={style.errorBox}>{error}</div>}
		</div>
	);
};

export default App;
