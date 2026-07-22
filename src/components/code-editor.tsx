import { useCallback, useEffect, useRef, useState } from "react";
import { contrastColor } from "../lib/color";
import { getHighlighter, type LanguageId } from "../lib/highlighter";
import type { HighlightedWord } from "../lib/types";

const TAB = "\t";

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

function tokenElementAt(
	clientX: number,
	clientY: number,
): HTMLElement | undefined {
	return document
		.elementsFromPoint(clientX, clientY)
		.find(
			(el): el is HTMLElement =>
				el instanceof HTMLElement && el.dataset.tokenIndex !== undefined,
		);
}

function CodeLine({
	lineIndex,
	line,
	lineTokens,
	isHighlighted,
	isPreview,
	highlightedWords,
}: {
	lineIndex: number;
	line: string;
	lineTokens: { content: string; color?: string }[];
	isHighlighted: boolean;
	isPreview: boolean;
	highlightedWords: HighlightedWord[];
}) {
	return (
		<div
			data-line-index={lineIndex}
			className={`ws-pw d-b mx--4 px-4 ${
				isHighlighted ? "bg-accent-dim/10" : isPreview ? "bg-accent-dim/5" : ""
			}`}
		>
			{/* Fall back to the plain line while Shiki tokens load, so
			    lines keep their real height from the first paint */}
			{lineTokens.map((token, tokenIndex) => {
				const isWordHighlighted = highlightedWords.some(
					(w) => w.line === lineIndex && w.tokenIndex === tokenIndex,
				);
				return (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: index is stable, tokens are purely positional within a line
						key={tokenIndex}
						data-token-index={tokenIndex}
						style={{
							color: token.color,
							// bc-accent-dim/50 doesn't get picked up by Yumma's scanner
							// from this file for some reason - bg-accent-dim/10 and
							// bw-1 (both confirmed working) stay as classes below,
							// only the border color itself falls back to inline.
							...(isWordHighlighted ? { borderColor: "#64748b80" } : {}),
						}}
						className={isWordHighlighted ? "bg-accent-dim/10 bw-1" : ""}
					>
						{token.content}
					</span>
				);
			})}
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
	onToggleLineHighlight,
	onToggleWordHighlight,
}: {
	code: string;
	onCodeChange: (value: string) => void;
	language: LanguageId;
	themeName: string;
	fontFamily?: string;
	background: string;
	highlightedLines: number[];
	highlightedWords: HighlightedWord[];
	onToggleLineHighlight: (line: number) => void;
	onToggleWordHighlight: (line: number, tokenIndex: number) => void;
}) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [tokens, setTokens] = useState<{ content: string; color?: string }[][]>(
		[],
	);
	const [altHoverLine, setAltHoverLine] = useState<number | null>(null);

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

	// Alt+hover previews which line would be highlighted; Alt+click commits
	// it. Held separately from word highlighting (double-click, no modifier
	// needed) so the two mechanics never fight over the same gesture.
	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLTextAreaElement>) => {
			if (!event.altKey) {
				setAltHoverLine(null);
				return;
			}
			const lineEl = lineElementAt(event.clientX, event.clientY);
			setAltHoverLine(lineEl ? Number(lineEl.dataset.lineIndex) : null);
		},
		[],
	);

	const handleMouseLeave = useCallback(() => setAltHoverLine(null), []);

	const handleMouseDown = useCallback(
		(event: React.MouseEvent<HTMLTextAreaElement>) => {
			if (!event.altKey) return;
			// Alt+click toggles the line highlight instead of moving the caret.
			event.preventDefault();
			const lineEl = lineElementAt(event.clientX, event.clientY);
			if (lineEl) onToggleLineHighlight(Number(lineEl.dataset.lineIndex));
		},
		[onToggleLineHighlight],
	);

	const handleDoubleClick = useCallback(
		(event: React.MouseEvent<HTMLTextAreaElement>) => {
			// Double-click a token to highlight that word instead of the
			// browser's native "select this word" behavior.
			event.preventDefault();
			const lineEl = lineElementAt(event.clientX, event.clientY);
			const tokenEl = tokenElementAt(event.clientX, event.clientY);
			if (!lineEl || !tokenEl) return;
			onToggleWordHighlight(
				Number(lineEl.dataset.lineIndex),
				Number(tokenEl.dataset.tokenIndex),
			);
		},
		[onToggleWordHighlight],
	);

	return (
		<div className="p-r ff-m fs-sm lh-4" style={editorStyle}>
			{lines.map((line, lineIndex) => (
				<CodeLine
					// biome-ignore lint/suspicious/noArrayIndexKey: index is stable, lines are purely positional
					key={lineIndex}
					lineIndex={lineIndex}
					line={line}
					lineTokens={
						tokens[lineIndex] ?? [{ content: line, color: undefined }]
					}
					isHighlighted={highlightedLines.includes(lineIndex)}
					isPreview={
						!highlightedLines.includes(lineIndex) && altHoverLine === lineIndex
					}
					highlightedWords={highlightedWords}
				/>
			))}
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
				onDoubleClick={handleDoubleClick}
				className="p-a t-0 l-0 w-100% h-100% p-0 m-0 bg-transparent c-transparent bw-0 os-none o-h r-none ff-m fs-sm lh-4 ws-pw"
				style={{ ...editorStyle, caretColor }}
			/>
		</div>
	);
}
