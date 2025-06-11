import { useState } from "react";
import { Button, Form } from "react-bootstrap";

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

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Implement me
	};

	return (
		<div>
			<Form onSubmit={handleSubmit}>
				<Form.Group controlId="size">
					<h2>表示サイズ(px)</h2>
					<Form.Label>高さ</Form.Label>
					<Form.Control
						type="number"
						name="height"
						value={height}
						onChange={(e) => setHeight(Number(e.target.value))}
					/>
					<Form.Label>幅</Form.Label>
					<Form.Control
						type="number"
						name="width"
						value={width}
						onChange={(e) => setWidth(Number(e.target.value))}
					/>
				</Form.Group>
				<Form.Group controlId="animation-direction">
					<h2>アニメーション設定</h2>
					<Form.Label>再生方向</Form.Label>
					<Form.Check
						inline
						label="順再生"
						name="playbackDirection"
						type="radio"
						id="forward"
						checked={playbackDirection === Direction.Forward}
						onChange={() => setPlaybackDirection(Direction.Forward)}
					/>
					<Form.Check
						inline
						label="逆再生"
						name="playbackDirection"
						type="radio"
						id="reverse"
						checked={playbackDirection === Direction.Reverse}
						onChange={() => setPlaybackDirection(Direction.Reverse)}
					/>
				</Form.Group>
				<Form.Group controlId="animation-speed">
					<Form.Label>再生速度 (fps)</Form.Label>
					<Form.Control
						type="number"
						name="fps"
						value={fps}
						onChange={(e) => setFps(Number(e.target.value))}
					/>
				</Form.Group>
				<Button variant="primary" type="submit">
					保存
				</Button>
			</Form>
		</div>
	);
};

export default App;
