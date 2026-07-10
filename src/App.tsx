import { toCanvas, toJpeg, toPng, toSvg } from "html-to-image";
import { useLayoutEffect, useRef, useState } from "react";
import type { ExportFormat } from "./components/FormatPicker";
import { Frame } from "./components/Frame";
import { StatusBar } from "./components/StatusBar";
import type { Background } from "./components/Toolbar";
import { Toolbar } from "./components/Toolbar";
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

async function captureDataUrl(
	node: HTMLElement,
	format: ExportFormat,
): Promise<string> {
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
	const [showTabBar, setShowTabBar] = useState(true);
	const [showStatusBar, setShowStatusBar] = useState(true);
	const [background] = useState<Background>("stripes");
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const frameRef = useRef<HTMLDivElement>(null);

	// Live px dimensions for the badge + status bar - tracks the real
	// export node, so it stays honest as content grows or rows toggle.
	// Measured directly on every size-affecting state change (the layout
	// effect below re-runs), with a ResizeObserver on top for changes that
	// don't go through React state (font loading, window resize wrapping).
	// biome-ignore lint/correctness/useExhaustiveDependencies: deps are size triggers, not read values
	useLayoutEffect(() => {
		const node = frameRef.current;
		if (!node) return;

		function measure(target: Element) {
			const rect = target.getBoundingClientRect();
			setDimensions((current) => {
				const width = Math.round(rect.width);
				const height = Math.round(rect.height);
				if (current.width === width && current.height === height)
					return current;
				return { width, height };
			});
		}

		measure(node);
		const observer = new ResizeObserver(([entry]) => measure(entry.target));
		observer.observe(node);
		return () => observer.disconnect();
	}, [code, fileName, language, showTabBar, showStatusBar]);

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
			<StatusBar
				showTabBar={showTabBar}
				onShowTabBarChange={setShowTabBar}
				showStatusBar={showStatusBar}
				onShowStatusBarChange={setShowStatusBar}
				width={dimensions.width}
				height={dimensions.height}
			/>

			<div className="h-px bg-border" />

			{/*
				No overflow clamping - long wrapped content grows the frame taller
				and the page scrolls to show it, ray.so style.
			*/}
			<main className="f-1 d-f ai-c jc-c p-r px-4 @sm:px-8 py-8 @sm:py-24">
				{/*
					Selection chrome wraps the frame but lives OUTSIDE the exported
					node (frameRef points at <Frame> itself), so the outline,
					handles, and badge never appear in the downloaded image.
				*/}
				<div className="p-r min-w-0">
					<Frame
						ref={frameRef}
						code={code}
						onCodeChange={setCode}
						language={language}
						fileName={fileName}
						onFileNameChange={setFileName}
						showTabBar={showTabBar}
						showStatusBar={showStatusBar}
						background={background}
					/>

					<div
						className="p-a i--2 bw-1 bs-s bc-accent pe-none"
						aria-hidden="true"
					/>

					<div
						className="p-a t--3 l--3 w-2 h-2 bg-page bw-1 bs-s bc-accent pe-none"
						aria-hidden="true"
					/>
					<div
						className="p-a t--3 r--3 w-2 h-2 bg-page bw-1 bs-s bc-accent pe-none"
						aria-hidden="true"
					/>
					<div
						className="p-a b--3 l--3 w-2 h-2 bg-page bw-1 bs-s bc-accent pe-none"
						aria-hidden="true"
					/>
					<div
						className="p-a b--3 r--3 w-2 h-2 bg-page bw-1 bs-s bc-accent pe-none"
						aria-hidden="true"
					/>
				</div>
			</main>

			<Toolbar
				language={language}
				onLanguageChange={setLanguage}
				format={format}
				onFormatChange={setFormat}
				exporting={exporting}
				onCopy={() => navigator.clipboard.writeText(code)}
				onExport={handleExport}
			/>
		</div>
	);
}

export default App;
