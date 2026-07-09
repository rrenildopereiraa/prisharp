import { toCanvas, toJpeg, toPng, toSvg } from "html-to-image";
import { useRef, useState } from "react";
import { Frame } from "./components/Frame";
import { type ExportFormat, Header } from "./components/Header";
import type { LanguageId } from "./lib/highlighter";

const defaultCode = `import { defineConfig } from "yummacss";

export default defineConfig({
	theme: {
		colors: {
			accent: "#bec6f2",
			code: "#dda2f6",
		},
	},
});
`;

async function captureDataUrl(node: HTMLElement, format: ExportFormat): Promise<string> {
	switch (format) {
		case "svg":
			return toSvg(node);
		case "webp": {
			const canvas = await toCanvas(node, { pixelRatio: 2 });
			return canvas.toDataURL("image/webp");
		}
		case "jpg":
			return toJpeg(node, { pixelRatio: 2, quality: 0.95 });
		default:
			return toPng(node, { pixelRatio: 2 });
	}
}

function App() {
	const [code, setCode] = useState(defaultCode);
	const [language, setLanguage] = useState<LanguageId>("typescript");
	const [fileName, setFileName] = useState("yumma.config.mjs");
	const [format, setFormat] = useState<ExportFormat>("png");
	const [exporting, setExporting] = useState(false);
	const frameRef = useRef<HTMLDivElement>(null);

	async function handleExport() {
		if (!frameRef.current || exporting) return;
		setExporting(true);
		try {
			const dataUrl = await captureDataUrl(frameRef.current, format);
			const link = document.createElement("a");
			link.download = `${fileName || "aperture"}.${format}`;
			link.href = dataUrl;
			link.click();
		} finally {
			setExporting(false);
		}
	}

	return (
		<div className="d-f fd-c min-h-vh bg-page">
			<Header
				language={language}
				onLanguageChange={setLanguage}
				format={format}
				onFormatChange={setFormat}
				exporting={exporting}
				onCopy={() => navigator.clipboard.writeText(code)}
				onExport={handleExport}
			/>

			<div className="h-px bg-border" />
			<main className="f-1 d-f ai-c jc-c p-r px-4 @sm:px-8 py-8 @sm:py-24">
				<Frame
					ref={frameRef}
					code={code}
					onCodeChange={setCode}
					language={language}
					fileName={fileName}
					onFileNameChange={setFileName}
				/>
			</main>
		</div>
	);
}

export default App;
