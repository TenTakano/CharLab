import type { FC } from "react";

type Props = {
	show: boolean;
	position: { x: number; y: number };
};

const ContextMenu: FC<Props> = ({ show, position }) => {
	return (
		<div
			style={{
				display: show ? "block" : "none",
				position: "absolute",
				left: position.x,
				top: position.y,
			}}
		>
			Context menu content goes here
		</div>
	);
};

export default ContextMenu;
