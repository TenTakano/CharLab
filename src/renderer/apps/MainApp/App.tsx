import { useRef } from "react";

// import { useImageCanvas } from "@ui/hooks/useImageCanvas";
import ViewerCanvas from "@ui/components/ViewerCanvas";
import type { ViewerCanvasHandle } from "@ui/components/ViewerCanvas/types";
import style from "./style.module.css";

const App: React.FC = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<ViewerCanvasHandle>(null);
	const isMovingWindow = useRef(false);
	const lastScreen = useRef({ x: 0, y: 0 });

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
			{/* <canvas ref={canvasRef} className="w-full h-full block" />
			{loading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center">
					<div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
				</div>
			)} */}
			<ViewerCanvas
				ref={canvasRef}
				handleCursorChange={(cursor: string) => {
					wrapperRef.current!.style.cursor = cursor;
				}}
			/>
		</div>
	);
};

export default App;
