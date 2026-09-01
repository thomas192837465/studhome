// Draws "StudHome" three times in a triangle across the canvas — baked
// directly into the pixels so it survives right-click-save or someone
// hitting the raw storage URL directly, unlike a CSS overlay.
function drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const fontSize = Math.max(16, Math.round(Math.min(width, height) * 0.06));
  const positions = [
    { x: width * 0.22, y: height * 0.25 },
    { x: width * 0.78, y: height * 0.4 },
    { x: width * 0.5, y: height * 0.78 },
  ];
  ctx.save();
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 3;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const { x, y } of positions) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 8);
    ctx.fillText("StudHome", 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

export function resizeImageFile(file: File, maxDimension = 1600, quality = 0.82, watermark = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image invalide"));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (watermark) drawWatermark(ctx, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
