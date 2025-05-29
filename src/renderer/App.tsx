import { type FC, useCallback, useEffect, useRef, useState } from "react";

import noImage from "./assets/noimage.svg";
import ContextMenu from "./components/ContextMenu";

const App: FC = () => {
	const [showContextMenu, setShowContextMenu] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({
		x: 0,
		y: 0,
	});

	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [index, setIndex] = useState(0);

	const wrapperRef = useRef<HTMLDivElement>(null);

	const isRotating = useRef(false);
	const isMovingWindow = useRef(false);
	const startX = useRef(0);
	const lastScreen = useRef({ x: 0, y: 0 });

	const handleSelectFolder = useCallback(async () => {
		const result = await window.electronAPI.selectFolder();
		if (result.canceled || !result.folder || !result.files) return;

		const newImages = result.files
			.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
			.map((file) => {
				const img = new Image();
				img.src = `file://${result.folder}/${file}`;
				return img;
			});

		if (newImages.length > 0) {
			setImages(newImages);
		}
	}, []);

	useEffect(() => {
		window.electronAPI.onMenuItemClicked((id: string) => {
			if (id === "select-folder") {
				handleSelectFolder();
			}
		});
	}, [handleSelectFolder]);

	const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		setContextMenuPosition({ x: e.clientX, y: e.clientY });
		setShowContextMenu(true);
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.shiftKey) {
			isMovingWindow.current = true;
			lastScreen.current = { x: e.screenX, y: e.screenY };
			wrapperRef.current!.style.cursor = "move";
			return;
		}

		if (images.length === 0) return;

		isRotating.current = true;
		startX.current = e.clientX;
		wrapperRef.current!.style.cursor = "grabbing";
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isMovingWindow.current) {
			const dx = e.screenX - lastScreen.current.x;
			const dy = e.screenY - lastScreen.current.y;
			lastScreen.current = { x: e.screenX, y: e.screenY };
			window.electronAPI.moveWindow({ dx, dy });
			return;
		}

		if (isRotating.current) {
			const deltaX = e.clientX - startX.current;
			const step = Math.floor(deltaX / 10);
			if (step !== 0) {
				const newIndex = (index + step + images.length) % images.length;
				setIndex(newIndex);
				startX.current = e.clientX;
			}
		}
	};

	const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isMovingWindow.current || isRotating.current) {
			isMovingWindow.current = false;
			isRotating.current = false;
			wrapperRef.current!.style.cursor = "grab";
		}
	};

	return (
		<div
			ref={wrapperRef}
			onContextMenu={handleContextMenu}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			<ContextMenu show={showContextMenu} position={contextMenuPosition} />
			{images.length > 0 ? (
				<img src={images[index].src} draggable={false} />
			) : (
				<img src={noImage} draggable={false} />
			)}
		</div>
	);
};

export default App;
