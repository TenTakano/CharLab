import type { FC } from "react";

type ContextMenuButtonProps = {
	onClick: () => void;
	children: React.ReactNode;
};

const ContextMenuButton: FC<ContextMenuButtonProps> = ({
	onClick,
	children,
}) => {
	return (
		<button
			type="button"
			className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
			onClick={onClick}
		>
			{children}
		</button>
	);
};

type Props = {
	show: boolean;
	position: { x: number; y: number };
};

const ContextMenu: FC<Props> = ({ show, position }) => {
	return (
		<div
			className={`${show ? "block" : "hidden"} absolute bg-white dark:bg-gray-800 shadow-lg rounded-md ring-1 ring-black ring-opacity-5 w-48 py-2`}
			style={{ left: position.x, top: position.y }}
		>
			<ContextMenuButton onClick={() => {}}>Refresh Widget</ContextMenuButton>
			<ContextMenuButton onClick={() => {}}>Resize Widget</ContextMenuButton>
			<ContextMenuButton onClick={() => {}}>Change Theme</ContextMenuButton>
			<ContextMenuButton onClick={() => {}}>Widget Settings</ContextMenuButton>
		</div>
	);
};

export default ContextMenu;
