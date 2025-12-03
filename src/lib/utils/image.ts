import { Area } from "react-easy-crop";

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });

const MIME_TO_OUTPUT: Record<string, { type: string; extension: string }> = {
  "image/png": { type: "image/png", extension: "png" },
  "image/webp": { type: "image/webp", extension: "webp" },
  "image/jpeg": { type: "image/jpeg", extension: "jpg" },
  "image/jpg": { type: "image/jpeg", extension: "jpg" },
};

export const getCroppedFile = async (imageSrc: string, cropArea: Area, originalFile: File) => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Nie udało się przygotować płótna.");
  }

  context.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  const { type: outputType, extension } = MIME_TO_OUTPUT[originalFile.type] ?? MIME_TO_OUTPUT["image/jpeg"];

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Nie udało się zapisać przyciętego zdjęcia."));
          return;
        }

        const fileName = `avatar-${Date.now()}.${extension}`;
        resolve(new File([blob], fileName, { type: outputType }));
      },
      outputType,
      0.92
    );
  });
};

