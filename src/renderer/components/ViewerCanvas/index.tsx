import { useEffect, useImperativeHandle, useRef, useState } from "react";

import noImage from "@ui/assets/noimage.svg";
import { useAutoPlayIndex } from "./AutoPlayHook";
import style from "./style.module.css";
import type { ViewerCanvasHandle } from "./types";

interface Props {
	ref: React.Ref<ViewerCanvasHandle>;
	handleCursorChange?: (cursor: string) => void;
}

const ViewerCanvas: React.FC<Props> = ({ ref, handleCursorChange }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [index, setIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	// Set Images Loading Callback
	useEffect(() => {
		const unsubscribeReady = window.electronAPI.onImagesReady(
			(cachedFiles: string[]) => {
				setLoading(true);

				let newImages: HTMLImageElement[];
				if (cachedFiles.length > 0) {
					newImages = cachedFiles
						.sort((a, b) => a.localeCompare(b))
						.map((file) => {
							const img = new Image();
							img.src = `file://${file}`;
							return img;
						});
				} else {
					const img = new Image();
					img.src = noImage;
					newImages = [img];
				}

				setImages(newImages);
				setIndex(0);
				setLoading(false);
			},
		);

		const unsubscribeStartToGenerateCache =
			window.electronAPI.onStartToGenerateCache(() => {
				setLoading(true);
			});

		return () => {
			unsubscribeReady();
			unsubscribeStartToGenerateCache();
		};
	}, []);

	// Canvas/Window Size Adjustment
	useEffect(() => {
		if (images.length === 0) return;
		const canvas = canvasRef.current;
		if (!canvas) return;

		const img = images[index];
		if (img.naturalWidth && img.naturalHeight) {
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			window.electronAPI.syncWindowSizeToComponent({
				width: img.naturalWidth,
				height: img.naturalHeight,
			});
		}
	}, [images, index]);

	// Drawing Logic
	useEffect(() => {
		if (!canvasRef.current) return;
		if (images.length === 0) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		const img = images[index];

		const draw = () => {
			if (!canvasRef.current) return;
			const cw = canvasRef.current.width;
			const ch = canvasRef.current.height;
			const imgW = img.naturalWidth || img.width;
			const imgH = img.naturalHeight || img.height;
			const x = (cw - imgW) / 2;
			const y = (ch - imgH) / 2;
			ctx.clearRect(0, 0, cw, ch);
			ctx.drawImage(img, x, y);
		};

		if (img.complete) {
			draw();
		} else {
			img.onload = draw;
		}
	}, [images, index]);

	// Mouse Controls
	const [isManualRotating, setIsManualRotating] = useState(false);
	const startX = useRef(0);

	useImperativeHandle(ref, () => ({
		onMouseDown: (e) => {
			if (e.shiftKey || images.length === 0) return;

			setIsManualRotating(true);
			startX.current = e.clientX;
			handleCursorChange?.("grabbing");
		},
		onMouseMove: (e) => {
			if (!isManualRotating || images.length === 0) return;

			const deltaX = e.clientX - startX.current;
			const step = Math.floor(deltaX / 10);
			if (step !== 0) {
				const next = (index + step + images.length) % images.length;
				setIndex(next);
				startX.current = e.clientX;
			}
		},
		onMouseUp: () => {
			if (!isManualRotating) return;

			setIsManualRotating(false);
			handleCursorChange?.("grab");
		},
	}));

	// Auto Play Hook
	useAutoPlayIndex({
		imagesLength: images.length,
		index,
		setIndex,
		isManualRotating,
	});

	return (
		<>
			<canvas ref={canvasRef} />
			{loading && (
				<div className={style.loadingOverlay}>
					<div className={style.loadingSpinner} />
				</div>
			)}
		</>
	);
};

export default ViewerCanvas;
