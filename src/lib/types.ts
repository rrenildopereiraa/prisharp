import type { LanguageId } from "./highlighter";

export type BackgroundPattern = "stripes-right" | "stripes-left";

export const MAX_DOCUMENTS = 5;

export interface HighlightedWord {
	line: number;
	tokenIndex: number;
}

export interface EditorDocument {
	id: string;
	fileName: string;
	code: string;
	language: LanguageId;
	highlightedLines: number[];
	highlightedWords: HighlightedWord[];
}

export interface CornerRadii {
	tl: number;
	tr: number;
	bl: number;
	br: number;
}
