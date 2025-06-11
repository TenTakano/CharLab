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

const ImageSizeMap: Record<string, { width: number; height: number }> = {
	Small: { width: 300, height: 600 },
	Medium: { width: 400, height: 800 },
	Large: { width: 500, height: 1000 },
};

type ResizeSubmenuProps = {
	onResize: (size: { width: number; height: number }) => void;
};

const ResizeSubmenu: FC<ResizeSubmenuProps> = ({ onResize }) => {
	const submenuRef = useRef<HTMLDivElement>(null);
	const [leftOffset, setLeftOffset] = useState<number | string>("100%");
	const [topOffset, setTopOffset] = useState<number | string>("100%");

	useLayoutEffect(() => {
		if (!submenuRef.current || !submenuRef.current.parentElement) return;

		const submenuRect = submenuRef.current.getBoundingClientRect();
		const parentRect = submenuRef.current.parentElement.getBoundingClientRect();
		const overflowRight = Math.max(
			0,
			parentRect.left +
				parentRect.width +
				submenuRect.width -
				window.innerWidth,
		);
		let newLeftOffset = parentRect.width - overflowRight;
		newLeftOffset = Math.max(newLeftOffset, -parentRect.left);
		setLeftOffset(newLeftOffset);

		const overflowBottom = Math.max(
			0,
			parentRect.top +
				parentRect.height +
				submenuRect.height -
				window.innerHeight,
		);
		let newTopOffset = parentRect.height - overflowBottom;
		newTopOffset = Math.max(newTopOffset, -parentRect.top);
		setTopOffset(newTopOffset);
	}, []);

	return (
		<div
			ref={submenuRef}
			className="absolute top-0 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 w-40 py-2"
			style={{ left: leftOffset, top: topOffset }}
		>
			{Object.keys(ImageSizeMap).map((option) => (
				<Button key={option} onClick={() => onResize(ImageSizeMap[option])}>
					{`${option}(${ImageSizeMap[option].width}x${ImageSizeMap[option].height})`}
				</Button>
			))}
		</div>
	);
};

type Props = {
	show: boolean;
	position: { x: number; y: number };
	onSelectDirectory: () => void;
	onResize: (size: { width: number; height: number }) => void;
	onClose: () => void;
};

const ContextMenu: FC<Props> = ({
	show,
	position,
	onSelectDirectory,
	onResize,
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

	const handleResizeOption = (size: { width: number; height: number }) => {
		onResize(size);
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

			<div
				className="relative"
				onMouseEnter={() => setResizeHover(true)}
				onMouseLeave={() => setResizeHover(false)}
			>
				<Button>サイズ変更</Button>
				{resizeHover && <ResizeSubmenu onResize={handleResizeOption} />}
			</div>

			<Button onClick={handleOpenSettings}>設定</Button>
		</div>
	);
};

export default ContextMenu;
