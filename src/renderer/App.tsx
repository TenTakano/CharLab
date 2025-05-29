import { type FC, useCallback, useEffect, useRef, useState } from "react";
import noImage from "./assets/noimage.svg";

const App: FC = () => {
	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [index, setIndex] = useState(0);

	const wrapperRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);
	const startX = useRef(0);

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
			console.log("loaded");
		}
	}, []);

	useEffect(() => {
		window.electronAPI.onMenuItemClicked((id: string) => {
			console.log(`Menu item clicked: ${id}`);
			if (id === "select-folder") {
				handleSelectFolder();
			}
		});
	}, [handleSelectFolder]);

	const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();

		const template = [{ id: "select-folder", label: "Select Folder" }];

		window.electronAPI.showContextMenu(template, {
			x: e.clientX,
			y: e.clientY,
		});
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (images.length === 0 || isDragging.current) return;

		isDragging.current = true;
		startX.current = e.clientX;
		wrapperRef.current!.style.cursor = "grabbing";
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDragging.current) return;

		const deltaX = e.clientX - startX.current;
		const step = Math.floor(deltaX / 10);
		if (step !== 0) {
			const newIndex = (index + step + images.length) % images.length;
			setIndex(newIndex);
			startX.current = e.clientX;
		}
	};

	const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDragging.current) return;

		isDragging.current = false;
		wrapperRef.current!.style.cursor = "grab";
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
			{images.length > 0 ? (
				<img src={images[index].src} draggable={false} />
			) : (
				<img src={noImage} draggable={false} />
			)}
		</div>
	);
};

export default App;
