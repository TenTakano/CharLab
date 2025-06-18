import style from "./style.module.css";

interface Props {
	onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
	onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
	onMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

const ViewerCanvas: React.FC<Props> = () => {
	return <canvas className={style.canvas} />;
};

export default ViewerCanvas;
