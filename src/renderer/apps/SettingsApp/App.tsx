import { Container, Form, Row, Col } from "react-bootstrap";

const App: React.FC = () => {
	const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		console.log("サイズ変更:", e.target.name, e.target.value);
	};

	const handleAnimationChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		console.log("アニメーション設定変更:", e.target.name, e.target.value);
	};

	return (
		<Container>
			<h1>設定画面</h1>
			<Form>
				<fieldset>
					<legend>表示サイズ(px)</legend>
					<Row>
						<Col>
							<Form.Group controlId="formHeight">
								<Form.Label>高さ</Form.Label>
								<Form.Control
									type="number"
									name="height"
									placeholder="高さ"
									onChange={handleSizeChange}
								/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId="formWidth">
								<Form.Label>幅</Form.Label>
								<Form.Control
									type="number"
									name="width"
									placeholder="幅"
									onChange={handleSizeChange}
								/>
							</Form.Group>
						</Col>
					</Row>
				</fieldset>
				<fieldset className="mt-3">
					<legend>アニメーション設定</legend>
					<Form.Group controlId="formPlaybackDirection">
						<Form.Label>再生方向</Form.Label>
						<div>
							<Form.Check
								inline
								label="順再生"
								name="playbackDirection"
								type="radio"
								id="forward"
								value="forward"
								onChange={handleAnimationChange}
							/>
							<Form.Check
								inline
								label="逆再生"
								name="playbackDirection"
								type="radio"
								id="reverse"
								value="reverse"
								onChange={handleAnimationChange}
							/>
						</div>
					</Form.Group>
					<Form.Group controlId="formFps" className="mt-2">
						<Form.Label>再生速度 (fps)</Form.Label>
						<Form.Control
							type="number"
							name="fps"
							placeholder="fps"
							onChange={handleAnimationChange}
						/>
					</Form.Group>
				</fieldset>
			</Form>
		</Container>
	);
};

export default App;
