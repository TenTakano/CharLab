import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import type { Settings } from "@main/settings";
import style from "./style.module.css";

enum Direction {
	Forward = 1,
	Reverse = -1,
}

const App: React.FC = () => {
	const [width, setWidth] = useState<number>(0);
	const [height, setHeight] = useState<number>(0);
	const [playbackDirection, setPlaybackDirection] = useState<Direction>(
		Direction.Forward,
	);
	const [fps, setFps] = useState<number>(30);

	const [originalWidth, setOriginalWidth] = useState<number>(0);
	const [originalHeight, setOriginalHeight] = useState<number>(0);
	const [originalPlaybackDirection, setOriginalPlaybackDirection] =
		useState<Direction>(Direction.Forward);
	const [originalFps, setOriginalFps] = useState<number>(30);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchSettings = async () => {
			const settings = await window.electronAPI.getSettings();
			setWidth(settings.windowSize.width);
			setOriginalWidth(settings.windowSize.width);
			setHeight(settings.windowSize.height);
			setOriginalHeight(settings.windowSize.height);
			setPlaybackDirection(settings.playbackDirection);
			setOriginalPlaybackDirection(settings.playbackDirection);
			setFps(settings.fps);
			setOriginalFps(settings.fps);
		};

		fetchSettings();

		const handleFocus = () => {
			fetchSettings();
		};

		window.addEventListener("focus", handleFocus);
		return () => window.removeEventListener("focus", handleFocus);
	}, []);

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const rect = el.getBoundingClientRect();
		window.electronAPI.syncWindowSizeToComponent({
			width: rect.width,
			height: rect.height,
		});
	}, []);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const changes: Partial<Settings> = {};
		if (width !== originalWidth || height !== originalHeight)
			changes.windowSize = { width, height };
		if (playbackDirection !== originalPlaybackDirection)
			changes.playbackDirection = playbackDirection;
		if (fps !== originalFps) changes.fps = fps;

		window.electronAPI.setSettings(changes);
		window.electronAPI.closeSettingsWindow();
	};

	return (
		<div ref={containerRef} className={style.container}>
			<Form onSubmit={handleSubmit} className={style.form}>
				<section>
					<h1>表示設定</h1>
					<Form.Group controlId="size">
						<Form.Label>最大サイズ(px)</Form.Label>
						<Row>
							<Form.Label as={Col} xs="auto" className={style.alignCenterLabel}>
								高さ
							</Form.Label>
							<Col>
								<Form.Control
									type="number"
									name="height"
									value={height}
									onChange={(e) => setHeight(Number(e.target.value))}
								/>
							</Col>
							<Form.Label as={Col} xs="auto" className={style.alignCenterLabel}>
								幅
							</Form.Label>
							<Col>
								<Form.Control
									type="number"
									name="width"
									value={width}
									onChange={(e) => setWidth(Number(e.target.value))}
								/>
							</Col>
						</Row>
					</Form.Group>
				</section>
				<section>
					<h1>アニメーション設定</h1>
					<Form.Group controlId="animation-direction">
						<Row>
							<Form.Label as={Col} xs="auto" className={style.alignCenterLabel}>
								再生方向
							</Form.Label>
							<Col>
								<Form.Check
									inline
									label="順再生"
									name="playbackDirection"
									type="radio"
									id="forward"
									checked={playbackDirection === Direction.Forward}
									onChange={() => setPlaybackDirection(Direction.Forward)}
								/>
							</Col>
							<Col>
								<Form.Check
									inline
									label="逆再生"
									name="playbackDirection"
									type="radio"
									id="reverse"
									checked={playbackDirection === Direction.Reverse}
									onChange={() => setPlaybackDirection(Direction.Reverse)}
								/>
							</Col>
						</Row>
					</Form.Group>
					<Form.Group controlId="animation-speed">
						<Row>
							<Form.Label as={Col} className={style.alignCenterLabel}>
								再生速度 (fps)
							</Form.Label>
							<Col>
								<Form.Control
									type="number"
									name="fps"
									value={fps}
									onChange={(e) => setFps(Number(e.target.value))}
								/>
							</Col>
						</Row>
					</Form.Group>
				</section>
				<Button variant="primary" type="submit">
					保存
				</Button>
			</Form>
		</div>
	);
};

export default App;
