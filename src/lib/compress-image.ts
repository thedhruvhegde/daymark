export async function compressImage(file: File, targetBytes = 500_000) {
  const image = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  let quality = 0.86;
  let output = await toBlob(canvas, quality);
  while (output.size > targetBytes && quality > 0.46) {
    quality -= 0.08;
    output = await toBlob(canvas, quality);
  }
  return new File([output], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
}

function toBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image conversion failed.")), "image/jpeg", quality));
}
