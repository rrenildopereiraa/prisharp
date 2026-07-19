export type ImageFormat = "png" | "jpg" | "webp" | "svg";
export type VideoFormat = "webm" | "mp4";
export type ExportFormat = ImageFormat | VideoFormat;

export const IMAGE_FORMATS: ImageFormat[] = ["png", "jpg", "webp", "svg"];
export const VIDEO_FORMATS: VideoFormat[] = ["webm", "mp4"];

export const FORMAT_LABELS: Record<ExportFormat, string> = {
	png: "PNG",
	jpg: "JPG",
	webp: "WEBP",
	svg: "SVG",
	webm: "WEBM",
	mp4: "MP4",
};

export function isVideoFormat(format: ExportFormat): format is VideoFormat {
	return format === "webm" || format === "mp4";
}
