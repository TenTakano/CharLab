import { useEffect, useRef, useState } from "react";

type Props = {
	playing: boolean;
	fps: number;
	direction: 1 | -1;
	imagesLength: number;
	startIndex?: number;
};

export const useAutoPlayIndex = ({
	playing,
	fps,
	direction,
	imagesLength,
	startIndex = 0,
}: Props) => {
	const [index, setIndex] = useState(startIndex);

	const rafId = useRef<number | null>(null);
	const start = useRef<number>(performance.now());
	const baseIx = useRef<number>(startIndex);

	useEffect(() => {
		if (!playing) {
			if (rafId.current) cancelAnimationFrame(rafId.current);
			return;
		}

		start.current = performance.now();
		baseIx.current = index;
		const interval = 1000 / fps;

		const animate = (now: number) => {
			const passed = Math.floor((now - start.current) / interval);
			const nextIndex =
				(baseIx.current + passed * direction + imagesLength) % imagesLength;
			setIndex((prev) => (prev === nextIndex ? prev : nextIndex));

			rafId.current = requestAnimationFrame(animate);
		};

		rafId.current = requestAnimationFrame(animate);

		return () => {
			if (rafId.current) cancelAnimationFrame(rafId.current);
		};
	}, [playing, fps, direction, imagesLength]); // index is not included to avoid unnecessary re-renders

	return index;
};
