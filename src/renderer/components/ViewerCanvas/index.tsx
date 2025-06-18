import { useEffect, useRef } from "react";
import style from "./style.module.css";

interface Props {
	onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
	onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
	onMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

const ViewerCanvas: React.FC<Props> = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (canvas) {
			const context = canvas.getContext("2d");
			if (context) {
				context.fillStyle = "white"; // for debugging
				context.fillRect(0, 0, canvas.width, canvas.height);
			}
		}
	}, []);

	return <canvas ref={canvasRef} className={style.canvas} />;
};

export default ViewerCanvas;
