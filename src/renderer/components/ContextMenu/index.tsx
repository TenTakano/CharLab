import { on } from "node:events";
import { type FC, useEffect, useLayoutEffect, useRef, useState } from "react";

const Button: FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
	children,
	...props
}) => {
	return (
		<button
			type="button"
			className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-200"
			{...props}
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
	const [resizeHover, setResizeHover] = useState(false);

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

	const closeContextMenu = () => {
		setResizeHover(false);
		onClose();
	};

	const handleSelectFolder = () => {
		onSelectDirectory();
		closeContextMenu();
	};

	const handleOpenSettings = () => {
		window.electronAPI.openSettingsWindow();
		closeContextMenu();
	};

	if (!show) return null;
	return (
		<div
			className="absolute bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 w-48 py-2"
			style={{ left: pos.x, top: pos.y }}
			ref={contextMenuRef}
		>
			<Button onClick={handleSelectFolder}>フォルダを選択</Button>
			<Button onClick={handleOpenSettings}>設定</Button>
		</div>
	);
};

export default ContextMenu;
