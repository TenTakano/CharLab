import { type FC, useEffect, useLayoutEffect, useRef, useState } from "react";

type ContextMenuButtonProps = {
	onClick: (item: string) => void;
	children: React.ReactNode;
};

const ContextMenuButton: FC<ContextMenuButtonProps> = ({
	onClick,
	children,
}) => {
	const handleClick = () => {
		onClick(children as string);
	};

	return (
		<button
			type="button"
			className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
			onClick={handleClick}
		>
			{children}
		</button>
	);
};

type Props = {
	show: boolean;
	position: { x: number; y: number };
	onSelectDirectory: () => void;
	onClose: () => void;
};

const ContextMenu: FC<Props> = ({
	show,
	position,
	onSelectDirectory,
	onClose,
}) => {
	const contextMenuRef = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState(position);

	useLayoutEffect(() => {
		if (!show || !contextMenuRef.current) return;

		const { innerWidth, innerHeight } = window;
		const { width: menuWidth, height: menuHeight } =
			contextMenuRef.current.getBoundingClientRect();
		let x = position.x;
		let y = position.y;

		if (x + menuWidth > innerWidth) {
			x = Math.max(0, innerWidth - menuWidth - 10);
		}
		if (y + menuHeight > innerHeight) {
			y = Math.max(0, innerHeight - menuHeight - 10);
		}
		setPos({ x, y });
	}, [show, position]);

	useEffect(() => {
		if (!show) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				contextMenuRef.current &&
				!contextMenuRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [show, onClose]);

	const handleClickMenuButton = (item: string) => {
		switch (item) {
			case "Select Folder":
				onSelectDirectory();
				break;
			default:
				break;
		}

		onClose();
	};

	if (!show) return null;
	return (
		<div
			className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md ring-1 ring-black ring-opacity-5 w-48 py-2"
			style={{ left: pos.x, top: pos.y }}
			ref={contextMenuRef}
		>
			<ContextMenuButton onClick={handleClickMenuButton}>
				Select Folder
			</ContextMenuButton>
		</div>
	);
};

export default ContextMenu;
