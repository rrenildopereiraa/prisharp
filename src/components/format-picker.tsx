export type ExportFormat = "png" | "jpg" | "webp" | "svg";

export const IMAGE_FORMATS: ExportFormat[] = ["png", "jpg", "webp", "svg"];

export const FORMAT_LABELS: Record<ExportFormat, string> = {
	png: "PNG",
	jpg: "JPG",
	webp: "WEBP",
	svg: "SVG",
};
