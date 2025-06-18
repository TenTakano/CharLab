export interface ViewerCanvasHandle {
	onMouseDown: (e: React.MouseEvent<Element>) => void;
	onMouseMove: (e: React.MouseEvent<Element>) => void;
	onMouseUp: (e: React.MouseEvent<Element>) => void;
}
