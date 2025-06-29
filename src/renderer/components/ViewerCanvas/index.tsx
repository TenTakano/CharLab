import { useEffect, useImperativeHandle, useRef, useState } from "react";

import type { Settings } from "@main/settings";
import noImage from "@ui/assets/noimage.svg";
import { useSettingsSync } from "@ui/hooks/useSettingsSync";
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

	// Animation Logic
	const [fps, setFps] = useState(30);
	const [playing, setPlaying] = useState(false);
	const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

	useEffect(() => {
		if (!playing || images.length === 0) return;

		let frameId: number;
		let lastFrameTime = performance.now();

		const animate = (time: number) => {
			const elapsed = time - lastFrameTime;
			if (elapsed > 1000 / fps) {
				setIndex((prev) => (prev + direction + images.length) % images.length);
				lastFrameTime = time;
			}
			frameId = requestAnimationFrame(animate);
		};

		frameId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(frameId);
		};
	}, [playing, images.length, fps, direction]);

	// Settings Loading
	useSettingsSync((settings: Partial<Settings>) => {
		if (settings.autoPlay !== undefined) {
			setPlaying(settings.autoPlay);
		}
		if (settings.playbackDirection) {
			setDirection(settings.playbackDirection);
		}
		if (settings.fps) {
			setFps(settings.fps);
		}
	});

	// Mouse Controls
	const isManualRotating = useRef(false);
	const startX = useRef(0);

	useImperativeHandle(ref, () => ({
		onMouseDown: (e) => {
			if (e.shiftKey || images.length === 0) return;

			isManualRotating.current = true;
			startX.current = e.clientX;
			handleCursorChange?.("grabbing");
		},
		onMouseMove: (e) => {
			if (!isManualRotating.current || images.length === 0) return;

			const deltaX = e.clientX - startX.current;
			const step = Math.floor(deltaX / 10);
			if (step !== 0) {
				const next = (index + step + images.length) % images.length;
				setIndex(next);
				startX.current = e.clientX;
			}
		},
		onMouseUp: () => {
			if (!isManualRotating.current) return;

			isManualRotating.current = false;
			handleCursorChange?.("grab");
		},
	}));

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
