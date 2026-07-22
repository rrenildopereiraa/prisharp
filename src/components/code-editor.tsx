import { useCallback, useEffect, useRef, useState } from "react";
import { contrastColor, overlayColor } from "../lib/color";
import { getHighlighter, type LanguageId } from "../lib/highlighter";
import type {
	HighlightedLine,
	HighlightedWord,
	HighlightType,
} from "../lib/types";

const TAB = "\t";

export interface HighlightColors {
	mark: string;
	add: string;
	remove: string;
}

interface WordRange {
	line: number;
	startCol: number;
	endCol: number;
}

interface Segment {
	content: string;
	color?: string;
	type?: HighlightType;
	isPreview?: boolean;
	startCol: number;
	endCol: number;
}

function lineElementAt(
	clientX: number,
	clientY: number,
): HTMLElement | undefined {
	return document
		.elementsFromPoint(clientX, clientY)
		.find(
			(el): el is HTMLElement =>
				el instanceof HTMLElement && el.dataset.lineIndex !== undefined,
		);
}

function segmentElementAt(
	clientX: number,
	clientY: number,
): HTMLElement | undefined {
	return document
		.elementsFromPoint(clientX, clientY)
		.find(
			(el): el is HTMLElement =>
				el instanceof HTMLElement && el.dataset.colStart !== undefined,
		);
}

// Converts a flat character selection (as the textarea's native drag
// reports it, possibly spanning multiple lines) into per-line column
// ranges, so a single mouse drag can precisely highlight a fragment of
// text regardless of token or line boundaries.
function lineRangesFromSelection(
	lines: string[],
	start: number,
	end: number,
): WordRange[] {
	const ranges: WordRange[] = [];
	let offset = 0;
	for (let line = 0; line < lines.length; line++) {
		const lineStart = offset;
		const lineEnd = offset + lines[line].length;
		const rangeStart = Math.max(start, lineStart);
		const rangeEnd = Math.min(end, lineEnd);
		if (rangeStart < rangeEnd) {
			ranges.push({
				line,
				startCol: rangeStart - lineStart,
				endCol: rangeEnd - lineStart,
			});
		}
		offset = lineEnd + 1; // +1 for the newline joining this line to the next
	}
	return ranges;
}

// Splits a line's Shiki tokens into finer segments wherever a highlight
// range (committed or a live drag preview) starts or ends, so highlights
// can land on an arbitrary character range instead of snapping to whole
// tokens. A preview range always wins where it overlaps a committed one,
// so mid-drag the user only ever sees the range they're actively drawing.
function splitLineIntoSegments(
	lineTokens: { content: string; color?: string }[],
	committed: (WordRange & { type: HighlightType })[],
	preview: WordRange | null,
): Segment[] {
	const ranges: {
		startCol: number;
		endCol: number;
		type?: HighlightType;
		isPreview?: boolean;
	}[] = committed
		.filter(
			(r) =>
				!preview ||
				r.endCol <= preview.startCol ||
				r.startCol >= preview.endCol,
		)
		.map((r) => ({ startCol: r.startCol, endCol: r.endCol, type: r.type }));
	if (preview) ranges.push({ ...preview, isPreview: true });
	ranges.sort((a, b) => a.startCol - b.startCol);

	const segments: Segment[] = [];
	let col = 0;
	for (const token of lineTokens) {
		const tokenStart = col;
		const tokenEnd = col + token.content.length;
		let pos = tokenStart;
		while (pos < tokenEnd) {
			const active = ranges.find((r) => pos >= r.startCol && pos < r.endCol);
			const nextBoundary = active
				? Math.min(active.endCol, tokenEnd)
				: Math.min(
						...ranges.map((r) => r.startCol).filter((s) => s > pos),
						tokenEnd,
					);
			segments.push({
				content: token.content.slice(
					pos - tokenStart,
					nextBoundary - tokenStart,
				),
				color: token.color,
				type: active?.type,
				isPreview: active?.isPreview,
				startCol: pos,
				endCol: nextBoundary,
			});
			pos = nextBoundary;
		}
		col = tokenEnd;
	}
	return segments;
}

function CodeLine({
	lineIndex,
	line,
	lineTokens,
	highlightType,
	isPreview,
	highlightedWords,
	wordPreview,
	highlightColors,
}: {
	lineIndex: number;
	line: string;
	lineTokens: { content: string; color?: string }[];
	highlightType: HighlightType | undefined;
	isPreview: boolean;
	highlightedWords: HighlightedWord[];
	wordPreview: WordRange | null;
	highlightColors: HighlightColors;
}) {
	const lineBackground = highlightType
		? overlayColor(highlightColors[highlightType], 0.16)
		: isPreview
			? overlayColor(highlightColors.mark, 0.08)
			: undefined;

	const segments = splitLineIntoSegments(
		lineTokens,
		highlightedWords.filter((w) => w.line === lineIndex),
		wordPreview,
	);

	return (
		<div
			data-line-index={lineIndex}
			className="ws-pw d-b mx--4 px-4"
			style={lineBackground ? { backgroundColor: lineBackground } : undefined}
		>
			{/* Fall back to the plain line while Shiki tokens load, so
			    lines keep their real height from the first paint */}
			{segments.map((segment, segmentIndex) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: index is stable, segments are purely positional within a line
					key={segmentIndex}
					data-col-start={segment.startCol}
					data-col-end={segment.endCol}
					style={{
						color: segment.color,
						...(segment.type
							? {
									backgroundColor: overlayColor(
										highlightColors[segment.type],
										segment.isPreview ? 0.12 : 0.2,
									),
									borderColor: segment.isPreview
										? undefined
										: overlayColor(highlightColors[segment.type], 0.6),
								}
							: {}),
					}}
					className={segment.type && !segment.isPreview ? "bw-1" : ""}
				>
					{segment.content}
				</span>
			))}
			{line.length === 0 && " "}
		</div>
	);
}

export function CodeEditor({
	code,
	onCodeChange,
	language,
	themeName,
	fontFamily,
	background,
	highlightedLines,
	highlightedWords,
	onCycleLineHighlight,
	onSetLineRangeHighlight,
	onCycleWordHighlight,
	onSetWordRangeHighlight,
	textareaRef,
	highlightColors,
}: {
	code: string;
	onCodeChange: (value: string) => void;
	language: LanguageId;
	themeName: string;
	fontFamily?: string;
	background: string;
	highlightedLines: HighlightedLine[];
	highlightedWords: HighlightedWord[];
	onCycleLineHighlight: (line: number) => void;
	onSetLineRangeHighlight: (startLine: number, endLine: number) => void;
	onCycleWordHighlight: (
		line: number,
		startCol: number,
		endCol: number,
	) => void;
	onSetWordRangeHighlight: (ranges: WordRange[]) => void;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	highlightColors: HighlightColors;
}) {
	const [tokens, setTokens] = useState<{ content: string; color?: string }[][]>(
		[],
	);
	const [altHoverLine, setAltHoverLine] = useState<number | null>(null);
	const [dragPreview, setDragPreview] = useState<{
		start: number;
		end: number;
	} | null>(null);
	const [dragActive, setDragActive] = useState(false);
	const dragStartLineRef = useRef<number | null>(null);
	const dragMovedRef = useRef(false);
	const dragPreviewRef = useRef(dragPreview);
	dragPreviewRef.current = dragPreview;

	const [wordDragActive, setWordDragActive] = useState(false);
	const [wordSelection, setWordSelection] = useState<{
		start: number;
		end: number;
	} | null>(null);

	useEffect(() => {
		let cancelled = false;
		getHighlighter().then((highlighter) => {
			if (cancelled) return;
			const lang = language === "mjs" ? "javascript" : language;
			const result = highlighter.codeToTokens(code, {
				lang,
				theme: themeName,
			});
			setTokens(result.tokens);
		});
		return () => {
			cancelled = true;
		};
	}, [code, language, themeName]);

	const lines = code.split("\n");
	const editorStyle = {
		tabSize: 2,
		...(fontFamily ? { fontFamily } : {}),
	};
	const caretColor = contrastColor(background);

	const setSelection = useCallback(
		(textarea: HTMLTextAreaElement, start: number, end: number) => {
			// The textarea is controlled, so the value updates on re-render;
			// restore the caret afterwards.
			requestAnimationFrame(() => {
				textarea.selectionStart = start;
				textarea.selectionEnd = end;
			});
		},
		[],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (event.key !== "Tab") return;
			event.preventDefault();
			const textarea = event.currentTarget;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const dedent = event.shiftKey;

			// Plain Tab with no selection: insert a single indent at the caret.
			if (!dedent && start === end) {
				const next = code.slice(0, start) + TAB + code.slice(end);
				onCodeChange(next);
				setSelection(textarea, start + TAB.length, start + TAB.length);
				return;
			}

			// Otherwise indent/dedent every line the selection touches.
			const firstLineStart = code.lastIndexOf("\n", start - 1) + 1;
			const nextBreak = code.indexOf("\n", end);
			const regionEnd = nextBreak === -1 ? code.length : nextBreak;
			const regionLines = code.slice(firstLineStart, regionEnd).split("\n");

			let firstDelta = 0;
			let totalDelta = 0;
			const transformed = regionLines.map((line, index) => {
				if (dedent) {
					const cut = line.startsWith(TAB)
						? 1
						: (line.match(/^ {1,2}/)?.[0].length ?? 0);
					if (index === 0) firstDelta = -cut;
					totalDelta -= cut;
					return line.slice(cut);
				}
				if (index === 0) firstDelta = TAB.length;
				totalDelta += TAB.length;
				return TAB + line;
			});

			const next =
				code.slice(0, firstLineStart) +
				transformed.join("\n") +
				code.slice(regionEnd);
			onCodeChange(next);
			setSelection(
				textarea,
				Math.max(firstLineStart, start + firstDelta),
				end + totalDelta,
			);
		},
		[code, onCodeChange, setSelection],
	);

	const finishDrag = useCallback(() => {
		const startLine = dragStartLineRef.current;
		const preview = dragPreviewRef.current;
		if (startLine !== null) {
			if (dragMovedRef.current && preview) {
				onSetLineRangeHighlight(
					Math.min(preview.start, preview.end),
					Math.max(preview.start, preview.end),
				);
			} else {
				onCycleLineHighlight(startLine);
			}
		}
		dragStartLineRef.current = null;
		dragMovedRef.current = false;
		setDragPreview(null);
		setDragActive(false);
	}, [onCycleLineHighlight, onSetLineRangeHighlight]);

	// Alt+drag across lines previews and commits a whole range at once (all
	// set to "mark", or cleared if the range is already uniformly marked).
	// A plain Alt+click (no movement) instead cycles that single line through
	// mark -> add -> remove -> off. Tracked with window-level listeners so the
	// drag keeps working even if the cursor leaves the textarea mid-gesture.
	useEffect(() => {
		if (!dragActive) return;
		const handleWindowMouseMove = (event: MouseEvent) => {
			const lineEl = lineElementAt(event.clientX, event.clientY);
			if (!lineEl) return;
			const line = Number(lineEl.dataset.lineIndex);
			const startLine = dragStartLineRef.current;
			if (startLine === null) return;
			if (line !== startLine) dragMovedRef.current = true;
			setDragPreview({ start: startLine, end: line });
		};
		const handleWindowMouseUp = () => finishDrag();
		window.addEventListener("mousemove", handleWindowMouseMove);
		window.addEventListener("mouseup", handleWindowMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleWindowMouseMove);
			window.removeEventListener("mouseup", handleWindowMouseUp);
		};
	}, [dragActive, finishDrag]);

	// Alt+Shift+drag hands the drag to the textarea's own native text
	// selection, so the browser computes exact character boundaries as the
	// user moves the mouse - real "fine-grained control" instead of our own
	// pixel-to-character math. We just mirror that live selection into the
	// highlight preview via onSelect, then commit it on mouseup. A drag with
	// no movement (start === end) falls back to toggling the whole word/
	// range under the cursor, so a quick click still works.
	useEffect(() => {
		if (!wordDragActive) return;
		const handleWindowMouseUp = (event: MouseEvent) => {
			const textarea = textareaRef.current;
			setWordDragActive(false);
			setWordSelection(null);
			if (!textarea) return;
			const { selectionStart: start, selectionEnd: end } = textarea;
			if (start === end) {
				const lineEl = lineElementAt(event.clientX, event.clientY);
				const segmentEl = segmentElementAt(event.clientX, event.clientY);
				if (lineEl && segmentEl) {
					onCycleWordHighlight(
						Number(lineEl.dataset.lineIndex),
						Number(segmentEl.dataset.colStart),
						Number(segmentEl.dataset.colEnd),
					);
				}
			} else {
				onSetWordRangeHighlight(lineRangesFromSelection(lines, start, end));
			}
			// Collapse the native selection so it doesn't linger visibly or
			// interfere with subsequent typing.
			textarea.setSelectionRange(start, start);
		};
		window.addEventListener("mouseup", handleWindowMouseUp);
		return () => window.removeEventListener("mouseup", handleWindowMouseUp);
	}, [
		wordDragActive,
		lines,
		onCycleWordHighlight,
		onSetWordRangeHighlight,
		textareaRef,
	]);

	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLTextAreaElement>) => {
			if (dragActive || wordDragActive || !event.altKey || event.shiftKey) {
				setAltHoverLine(null);
				return;
			}
			const lineEl = lineElementAt(event.clientX, event.clientY);
			setAltHoverLine(lineEl ? Number(lineEl.dataset.lineIndex) : null);
		},
		[dragActive, wordDragActive],
	);

	const handleMouseLeave = useCallback(() => setAltHoverLine(null), []);

	const handleMouseDown = useCallback(
		(event: React.MouseEvent<HTMLTextAreaElement>) => {
			if (!event.altKey) return;

			// Alt+Shift: let the browser's native drag-select run so the
			// resulting selection has real character precision; we only read
			// the result, in onSelect (live) and mouseup (commit).
			if (event.shiftKey) {
				setAltHoverLine(null);
				setWordDragActive(true);
				return;
			}

			event.preventDefault();
			const lineEl = lineElementAt(event.clientX, event.clientY);
			if (!lineEl) return;
			const line = Number(lineEl.dataset.lineIndex);

			setAltHoverLine(null);
			dragStartLineRef.current = line;
			dragMovedRef.current = false;
			setDragPreview({ start: line, end: line });
			setDragActive(true);
		},
		[],
	);

	const handleSelect = useCallback(
		(event: React.SyntheticEvent<HTMLTextAreaElement>) => {
			if (!wordDragActive) return;
			const textarea = event.currentTarget;
			setWordSelection({
				start: textarea.selectionStart,
				end: textarea.selectionEnd,
			});
		},
		[wordDragActive],
	);

	const wordPreviewRanges = wordSelection
		? lineRangesFromSelection(lines, wordSelection.start, wordSelection.end)
		: [];

	return (
		<div className="p-r ff-m fs-sm lh-4" style={editorStyle}>
			{/* Alt+Shift-drag drives native textarea selection for exact
			    character precision; its default blue highlight would double up
			    with our own colored overlay, so hide it while dragging. */}
			{wordDragActive && (
				<style>{".word-drag-active::selection{background:transparent}"}</style>
			)}
			{lines.map((line, lineIndex) => {
				const committed = highlightedLines.find((h) => h.line === lineIndex);
				const inDragRange =
					dragPreview &&
					lineIndex >= Math.min(dragPreview.start, dragPreview.end) &&
					lineIndex <= Math.max(dragPreview.start, dragPreview.end);
				return (
					<CodeLine
						// biome-ignore lint/suspicious/noArrayIndexKey: index is stable, lines are purely positional
						key={lineIndex}
						lineIndex={lineIndex}
						line={line}
						lineTokens={
							tokens[lineIndex] ?? [{ content: line, color: undefined }]
						}
						highlightType={
							inDragRange && dragMovedRef.current ? "mark" : committed?.type
						}
						isPreview={
							!committed && (inDragRange || altHoverLine === lineIndex)
						}
						highlightedWords={highlightedWords}
						wordPreview={
							wordPreviewRanges.find((r) => r.line === lineIndex) ?? null
						}
						highlightColors={highlightColors}
					/>
				);
			})}
			<textarea
				value={code}
				onChange={(event) => onCodeChange(event.target.value)}
				spellCheck={false}
				autoCapitalize="off"
				autoCorrect="off"
				ref={textareaRef}
				onKeyDown={handleKeyDown}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onMouseDown={handleMouseDown}
				onSelect={handleSelect}
				className={`p-a t-0 l-0 w-100% h-100% p-0 m-0 bg-transparent c-transparent bw-0 os-none o-h r-none ff-m fs-sm lh-4 ws-pw ${wordDragActive ? "word-drag-active" : ""}`}
				style={{ ...editorStyle, caretColor }}
			/>
		</div>
	);
}
