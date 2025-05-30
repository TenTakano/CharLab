import { type FC, useEffect, useRef, useState } from "react";

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
			style={{ left: position.x, top: position.y }}
			ref={contextMenuRef}
		>
			<ContextMenuButton onClick={handleClickMenuButton}>
				Select Folder
			</ContextMenuButton>
			<ContextMenuButton onClick={() => {}}>Resize Widget</ContextMenuButton>
			<ContextMenuButton onClick={() => {}}>Change Theme</ContextMenuButton>
			<ContextMenuButton onClick={() => {}}>Widget Settings</ContextMenuButton>
		</div>
	);
};

export default ContextMenu;
