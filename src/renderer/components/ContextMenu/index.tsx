import { type FC, useEffect, useLayoutEffect, useRef, useState } from "react";

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

	const handleResizeOption = (option: string) => {
		closeContextMenu();
	};

	const handleClickMenuButton = (item: string) => {
		switch (item) {
			case "Select Folder":
				onSelectDirectory();
				closeContextMenu();
				break;
			default:
				// Other menu items are handled separately.
				break;
		}
	};

	if (!show) return null;
	return (
		<div
			className="absolute bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 w-48 py-2"
			style={{ left: pos.x, top: pos.y }}
			ref={contextMenuRef}
		>
			<button
				type="button"
				className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-200"
				onClick={() => handleClickMenuButton("Select Folder")}
			>
				Select Folder
			</button>

			{/* Resize Widget with sub-menu */}
			<div
				className="relative"
				onMouseEnter={() => setResizeHover(true)}
				onMouseLeave={() => setResizeHover(false)}
			>
				<button
					type="button"
					className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-200"
				>
					Resize Widget
				</button>
				{resizeHover && (
					<div className="absolute left-full top-0 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 w-40 py-2">
						{["Small", "Medium", "Large"].map((option) => (
							<button
								key={option}
								type="button"
								className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-200"
								onClick={() => handleResizeOption(option)}
							>
								{option}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ContextMenu;
