import { useCallback, useEffect, useRef } from "react";

import noImage from "@ui/assets/noimage.svg";

type ImageCanvasParams = {
	images: HTMLImageElement[];
	index: number;
	setIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const useImageCanvas = ({
	images,
	index,
	setIndex,
}: ImageCanvasParams) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Resizing the canvas when the window size changes
	useEffect(() => {
		window.electronAPI.onWindowSizeChange(
			(size: { width: number; height: number }) => {
				if (!canvasRef.current) return;
				canvasRef.current.width = size.width;
				canvasRef.current.height = size.height;
			},
		);
	}, []);

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
		[images, index, setIndex],
	);

	const onMouseUp = useCallback(() => {
		if (!isRotating.current) return;

		isRotating.current = false;
		if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
	}, []);

	return {
		wrapperRef,
		canvasRef,
		onMouseDown,
		onMouseMove,
		onMouseUp,
	};
};
