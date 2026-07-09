import { useEffect, useState } from "react";
import {
	getHighlighter,
	type LanguageId,
	THEME_NAME,
} from "../lib/highlighter";

export function CodeEditor({
	code,
	onCodeChange,
	language,
}: {
	code: string;
	onCodeChange: (value: string) => void;
	language: LanguageId;
}) {
	const [tokens, setTokens] = useState<{ content: string; color?: string }[][]>(
		[],
	);

	useEffect(() => {
		let cancelled = false;
		getHighlighter().then((highlighter) => {
			if (cancelled) return;
			const result = highlighter.codeToTokens(code, {
				lang: language,
				theme: THEME_NAME,
			});
			setTokens(result.tokens);
		});
		return () => {
			cancelled = true;
		};
	}, [code, language]);

	const lines = code.split("\n");

	return (
		<div className="p-r ff-m fs-sm lh-4">
			{lines.map((line, lineIndex) => (
				// biome-ignore lint: index is stable, lines are purely positional
				<div key={lineIndex} className="ws-pw">
					{(tokens[lineIndex] ?? []).map((token, tokenIndex) => (
						// biome-ignore lint: index is stable, tokens are purely positional within a line
						<span key={tokenIndex} style={{ color: token.color }}>
							{token.content}
						</span>
					))}
					{line.length === 0 && " "}
				</div>
			))}
			<textarea
				value={code}
				onChange={(event) => onCodeChange(event.target.value)}
				spellCheck={false}
				autoCapitalize="off"
				autoCorrect="off"
				className="p-a t-0 l-0 w-100% h-100% p-0 m-0 bg-transparent c-transparent cc-accent bw-0 os-none o-h r-none ff-m fs-sm lh-4 ws-pw"
			/>
		</div>
	);
}
