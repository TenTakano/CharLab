import { FC, useEffect } from "react";
import noImage from "./assets/noimage.svg";

const App: FC = () => {
  useEffect(() => {
    window.electronAPI.onMenuItemClicked((id: string) => {
      if (id === "select-folder") {
        console.log("Select Folder clicked");
      };
    })
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const template = [
      { id: "select-folder", label: "Select Folder" },
    ];

    window.electronAPI.showContextMenu(
      template,
      { x: e.clientX, y: e.clientY }
    )
  };

  return (
    <div onContextMenu={handleContextMenu}>
      <h1>Welcome to the App</h1>
      <p>This is a simple React application.</p>
      <img src={noImage} />
    </div>
  );
};

export default App;
