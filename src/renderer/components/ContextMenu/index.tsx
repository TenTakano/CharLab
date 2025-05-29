import type { FC } from "react";

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
			<button
				type="button"
				className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
			>
				Refresh Widget
			</button>
			<button
				type="button"
				className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
			>
				Resize Widget
			</button>
			<button
				type="button"
				className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
			>
				Change Theme
			</button>
			<button
				type="button"
				className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
			>
				Widget Settings
			</button>
		</div>
	);
};

export default ContextMenu;
