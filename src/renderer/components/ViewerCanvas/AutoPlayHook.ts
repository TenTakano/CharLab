import type { Settings } from "@main/settings";
import { useSettingsSync } from "@ui/hooks/useSettingsSync";
import { useCallback, useEffect, useRef, useState } from "react";

const safeMod = (a: number, b: number): number => ((a % b) + b) % b;

type Props = {
	imagesLength: number;
	index: number;
	setIndex: React.Dispatch<React.SetStateAction<number>>;
	isManualRotating: boolean;
};

export const useAutoPlayIndex = ({
	imagesLength,
	index,
	setIndex,
	isManualRotating,
}: Props) => {
	const [playing, setPlaying] = useState(false);
	const [direction, setDirection] = useState<1 | -1>(1); // 1 for forward, -1 for backward
	const [fps, setFps] = useState(30);

	const rafId = useRef<number | null>(null);
	const start = useRef<number>(performance.now());
	const baseIx = useRef<number>(index);

	const handleSettingsUpdate = useCallback((settings: Partial<Settings>) => {
		console.log("AutoPlayHook received settings:", JSON.stringify(settings));
		if (settings.autoPlay !== undefined) {
			setPlaying(settings.autoPlay);
		}
		if (settings.playbackDirection !== undefined) {
			console.log("Setting direction to:", settings.playbackDirection);
			setDirection(settings.playbackDirection);
		}
		if (settings.fps !== undefined) {
			setFps(settings.fps);
		}
	}, []);

	useSettingsSync(handleSettingsUpdate);

	const isAutoPlaying = playing && !isManualRotating;

	useEffect(() => {
		if (!isAutoPlaying) {
			if (rafId.current) cancelAnimationFrame(rafId.current);
			return;
		}

		start.current = performance.now();
		baseIx.current = index;
		const interval = fps > 0 ? 1000 / fps : 1000 / 30;

		const animate = (now: number) => {
			const passed = Math.floor((now - start.current) / interval);
			const nextIndex = safeMod(
				baseIx.current + passed * direction,
				imagesLength,
			);
			setIndex((prev: number) => (prev === nextIndex ? prev : nextIndex));

			rafId.current = requestAnimationFrame(animate);
		};

		rafId.current = requestAnimationFrame(animate);

		return () => {
			if (rafId.current) cancelAnimationFrame(rafId.current);
		};
	}, [isAutoPlaying, fps, direction, imagesLength]); // index is not included to avoid unnecessary re-renders
};
