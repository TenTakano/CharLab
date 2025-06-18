import { useCallback, useEffect, useRef, useState } from "react";

import type { Settings } from "@main/settings";
import noImage from "@ui/assets/noimage.svg";
import { useSettingsSync } from "@ui/hooks/useSettingsSync";
import style from "./style.module.css";

interface Props {
	onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
	onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
	onMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

const ViewerCanvas: React.FC<Props> = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [index, setIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	// Initialize Logic
	const loadImages = useCallback((files: string[]) => {
		const newImages = files
			.sort((a, b) => a.localeCompare(b))
			.map((file) => {
				const img = new Image();
				img.src = `file://${file}`;
				return img;
			});

		if (newImages.length > 0) {
			setImages(newImages);
			setIndex(0);
		}
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			const context = canvas.getContext("2d");
			if (context) {
				context.fillStyle = "white"; // for debugging
				context.fillRect(0, 0, canvas.width, canvas.height);
			}
		}

		const unsubscribe = window.electronAPI.onImagesReady(
			(cachedFiles: string[]) => {
				setLoading(true);
				loadImages(cachedFiles);
				setLoading(false);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [loadImages]);

	// Drawing Logic
	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext("2d");
		if (!ctx) return;

		let img: HTMLImageElement;
		if (images.length > 0) {
			img = images[index];
		} else {
			img = new Image();
			img.src = noImage;
		}

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

	return (
		<>
			<canvas ref={canvasRef} className={style.canvas} />
			{loading && (
				<div className={style.loadingOverlay}>
					<div className={style.loadingSpinner} />
				</div>
			)}
		</>
	);
};

export default ViewerCanvas;
