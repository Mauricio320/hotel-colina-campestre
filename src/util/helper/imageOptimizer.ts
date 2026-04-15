import imageCompression from "browser-image-compression";

export interface OptimizeImageOptions {
  maxWidthOrHeight?: number;
  maxSizeMB?: number;
  initialQuality?: number;
  preferredFormat?: "webp" | "jpeg" | "auto";
  useWebWorker?: boolean;
}

export interface OptimizeImageResult {
  file: File;
  originalSizeKB: number;
  optimizedSizeKB: number;
  width: number;
  height: number;
  format: string;
}

const DEFAULTS: Required<OptimizeImageOptions> = {
  maxWidthOrHeight: 1920,
  maxSizeMB: 0.5,
  initialQuality: 0.82,
  preferredFormat: "webp",
  useWebWorker: true,
};

const SUPPORTED_INPUT_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];

const renameFile = (originalName: string, mimeType: string): string => {
  const dot = originalName.lastIndexOf(".");
  const base = dot === -1 ? originalName : originalName.slice(0, dot);
  const ext = mimeType === "image/webp" ? "webp" : mimeType === "image/png" ? "png" : "jpg";
  return `${base}.${ext}`;
};

const readDimensions = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });

const resolveFileType = (preferred: OptimizeImageOptions["preferredFormat"]): string | undefined => {
  if (preferred === "webp") return "image/webp";
  if (preferred === "jpeg") return "image/jpeg";
  return undefined;
};

export const optimizeImage = async (
  file: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizeImageResult> => {
  const opts = { ...DEFAULTS, ...options };

  if (!SUPPORTED_INPUT_TYPES.includes(file.type)) {
    throw new Error(`Formato no soportado: ${file.type}`);
  }

  const originalSizeKB = file.size / 1024;

  const compressed = await imageCompression(file, {
    maxSizeMB: opts.maxSizeMB,
    maxWidthOrHeight: opts.maxWidthOrHeight,
    useWebWorker: opts.useWebWorker,
    initialQuality: opts.initialQuality,
    fileType: resolveFileType(opts.preferredFormat),
    alwaysKeepResolution: false,
  });

  const finalFile =
    compressed.size >= file.size && compressed.type === file.type
      ? file
      : new File([compressed], renameFile(file.name, compressed.type), {
          type: compressed.type,
          lastModified: Date.now(),
        });

  const { width, height } = await readDimensions(finalFile);

  return {
    file: finalFile,
    originalSizeKB,
    optimizedSizeKB: finalFile.size / 1024,
    width,
    height,
    format: finalFile.type,
  };
};
