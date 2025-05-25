const loadButton = document.getElementById("load-button") as HTMLButtonElement;
const widget = document.getElementById("widget") as HTMLDivElement;
const imgElem = document.getElementById("widget-image") as HTMLImageElement;

let images: HTMLImageElement[] = [];
let folderPath = "";
let currentIndex = 0;
let isDragging = false;
let startX = 0;

loadButton.addEventListener("click", async () => {
  const result = await window.widgetAPI.selectFolder();
  if (result.canceled || !result.folder || !result.files) return;

  folderPath = result.folder;
  images = result.files
    .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
    .map((file) => {
      const img = new Image();
      img.src = `file://${folderPath}/${file}`;
      return img;
    });

  if (images.length > 0) {
    currentIndex = 0;
    imgElem.src = images[currentIndex].src;
  }
});

widget.addEventListener("mousedown", e => {
  if (images.length === 0) return;
  isDragging = true;
  startX = e.clientX;
  widget.style.cursor = "grabbing";
});

widget.addEventListener("mousemove", e => {
  if (!isDragging) return;
  const deltaX = e.clientX - startX;
  const step = Math.floor(deltaX / 10);
  if (step !== 0) {
    currentIndex = (currentIndex + step + images.length) % images.length;
    imgElem.src = images[currentIndex].src;
    startX = e.clientX;
  }
});

["mouseup", "mouseleave"].forEach(event => {
  widget.addEventListener(event, () => {
    isDragging = false;
    widget.style.cursor = "grab";
  });
});
