import { useCallback, useEffect, useRef, useState } from "react";

import noImage from "@ui/assets/noimage.svg";

export const useImageCanvas = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [index, setIndex] = useState(0);

	const [loading, setLoading] = useState(true);

	// Resizing the canvas when the window size changes
	useEffect(() => {
		window.electronAPI.onWindowSizeChange(
			(size: { width: number; height: number }) => {
				if (!canvasRef.current) return;
				canvasRef.current.width = size.width;
				canvasRef.current.height = size.height;
			},
		);

		window.electronAPI.onFolderChanged(() => {
			setLoading(true);
		});
	}, []);

	// Image Loading
	const prepareImages = useCallback((files: string[]) => {
		setLoading(true);

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

		setLoading(false);
	}, []);

	useEffect(() => {
		window.electronAPI.onImagesReady((cachedFiles: string[]) => {
			prepareImages(cachedFiles);

			if (!wrapperRef.current || !canvasRef.current) return;
			const { clientWidth, clientHeight } = wrapperRef.current;
			canvasRef.current.width = clientWidth;
			canvasRef.current.height = clientHeight;
		});
	}, [prepareImages]);

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
	const [playing, setPlaying] = useState(true);
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

	// Mouse Controls
	const isRotating = useRef(false);
	const startX = useRef(0);

	const onMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (e.shiftKey || images.length === 0) return;

			isRotating.current = true;
			startX.current = e.clientX;
			if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
		},
		[images],
	);

	const onMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!isRotating.current || images.length === 0) return;

			const deltaX = e.clientX - startX.current;
			const step = Math.floor(deltaX / 10);
			if (step !== 0) {
				const next = (index + step + images.length) % images.length;
				setIndex(next);
				startX.current = e.clientX;
			}
		},
		[images, index],
	);

	const onMouseUp = useCallback(() => {
		if (!isRotating.current) return;

		isRotating.current = false;
		if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
	}, []);

	const loadFolder = useCallback(async () => {
		const result = await window.electronAPI.selectFolder();
		if (result.canceled || !result.files) return;
		prepareImages(result.files);
	}, [prepareImages]);

	const changeSize = useCallback(
		async (size: { width: number; height: number }) => {
			setLoading(true);
			await window.electronAPI.changeImageSize(size);
		},
		[],
	);

	return {
		wrapperRef,
		canvasRef,
		onMouseDown,
		onMouseMove,
		onMouseUp,
		setFps,
		setPlaying,
		setDirection,
		loadFolder,
		changeSize,
		loading,
	};
};
