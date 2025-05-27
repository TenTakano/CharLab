import { FC, useEffect, useState } from "react";
import noImage from "./assets/noimage.svg";

const App: FC = () => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [index, setIndex] = useState(0);

  const handleSelectFolder = async () => {
    const result = await window.electronAPI.selectFolder();
    if (result.canceled || !result.folder || !result.files) return;

    const newImages = result.files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => {
        const img = new Image();
        img.src = `file://${result.folder}/${file}`;
        return img;
      });

    if (newImages.length > 0) {
      setImages(newImages);
      console.log("loaded");
    }
  }

  useEffect(() => {
    window.electronAPI.onMenuItemClicked((id: string) => {
      console.log(`Menu item clicked: ${id}`);
      if (id === "select-folder") {
        handleSelectFolder();
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
      {images.length > 0
        ? <img src={images[index].src} />
        : <img src={noImage} />
      }
    </div>
  );
};

export default App;
