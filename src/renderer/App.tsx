import { type FC, useCallback, useEffect, useRef, useState } from "react";

import ContextMenu from "@ui/components/ContextMenu";
import { useImageCanvas } from "@ui/hooks/useImageCanvas";

const App: FC = () => {
	const [showContextMenu, setShowContextMenu] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({
		x: 0,
		y: 0,
	});

	const isMovingWindow = useRef(false);
	const lastScreen = useRef({ x: 0, y: 0 });

	const {
		wrapperRef,
		canvasRef,
		onMouseDown: onCanvasMouseDown,
		onMouseMove: onCanvasMouseMove,
		onMouseUp: onCanvasMouseUp,
		loadFolder,
	} = useImageCanvas();

	// Set initial canvas size based on wrapper dimensions
	useEffect(() => {
		if (!wrapperRef.current || !canvasRef.current) return;
		const { clientWidth, clientHeight } = wrapperRef.current;
		canvasRef.current.width = clientWidth;
		canvasRef.current.height = clientHeight;
	}, [wrapperRef, canvasRef]);

	const handleSizeChange = useCallback(
		(size: { width: number; height: number }) => {
			window.electronAPI.changeImageSize(size);
		},
		[],
	);

	const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		setContextMenuPosition({ x: e.clientX, y: e.clientY });
		setShowContextMenu(true);
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		onCanvasMouseDown(e);
		if (!e.shiftKey) return;

		isMovingWindow.current = true;
		lastScreen.current = { x: e.screenX, y: e.screenY };
		wrapperRef.current!.style.cursor = "move";
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		onCanvasMouseMove(e);
		if (!isMovingWindow.current) return;

		const dx = e.screenX - lastScreen.current.x;
		const dy = e.screenY - lastScreen.current.y;
		lastScreen.current = { x: e.screenX, y: e.screenY };
		window.electronAPI.moveWindow({ dx, dy });
	};

	const handleMouseUp = () => {
		onCanvasMouseUp();
		if (!isMovingWindow.current) return;

		isMovingWindow.current = false;
		wrapperRef.current!.style.cursor = "grab";
	};

	return (
		<div
			ref={wrapperRef}
			className="w-screen h-screen cursor-grab"
			onContextMenu={handleContextMenu}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			<ContextMenu
				show={showContextMenu}
				position={contextMenuPosition}
				onSelectDirectory={async () => {
					await loadFolder();
				}}
				onResize={handleSizeChange}
				onClose={() => setShowContextMenu(false)}
			/>
			<canvas ref={canvasRef} className="w-full h-full block" />
		</div>
	);
};

export default App;
