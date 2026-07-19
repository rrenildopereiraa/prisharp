import gsap from "gsap";
import { toCanvas } from "html-to-image";

export interface RecordAnimatedVideoOptions {
	frameEl: HTMLElement;
	codeEl: HTMLElement;
	code: string;
	background: string;
	msPerChar?: number;
	holdMs?: number;
}

function pickMimeType() {
	const candidates = [
		"video/webm;codecs=vp9",
		"video/webm;codecs=vp8",
		"video/webm",
	];
	for (const type of candidates) {
		if (MediaRecorder.isTypeSupported(type)) return type;
	}
	return "video/webm";
}

export function isAnimatedExportSupported() {
	return (
		typeof MediaRecorder !== "undefined" &&
		typeof HTMLCanvasElement.prototype.captureStream === "function"
	);
}

export async function recordAnimatedVideo({
	frameEl,
	codeEl,
	code,
	background,
	msPerChar = 35,
	holdMs = 600,
}: RecordAnimatedVideoOptions): Promise<Blob> {
	if (!isAnimatedExportSupported()) {
		throw new Error("Animated export isn't supported in this browser.");
	}

	const sourceCanvas = await toCanvas(frameEl, { pixelRatio: 2 });

	const frameRect = frameEl.getBoundingClientRect();
	const codeRect = codeEl.getBoundingClientRect();
	const scale = sourceCanvas.width / frameRect.width;
	const offsetX = (codeRect.left - frameRect.left) * scale;
	const offsetY = (codeRect.top - frameRect.top) * scale;

	const computed = getComputedStyle(codeEl);
	const scaledFontSize = Number.parseFloat(computed.fontSize) * scale;
	const scaledLineHeight = Number.parseFloat(computed.lineHeight) * scale;

	const recordCanvas = document.createElement("canvas");
	recordCanvas.width = sourceCanvas.width;
	recordCanvas.height = sourceCanvas.height;
	const ctx = recordCanvas.getContext("2d");
	if (!ctx) throw new Error("Could not create a 2D canvas context.");
	ctx.font = `${computed.fontWeight} ${scaledFontSize}px ${computed.fontFamily}`;
	const charWidth = ctx.measureText("M").width;

	const lines = code.split("\n");

	function draw(revealedChars: number) {
		if (!ctx) return;
		ctx.drawImage(sourceCanvas, 0, 0);
		let remaining = revealedChars;
		ctx.fillStyle = background;
		for (let i = 0; i < lines.length; i++) {
			const lineLength = lines[i].length;
			if (remaining >= lineLength) {
				remaining -= lineLength + 1;
				continue;
			}
			const lineRevealed = Math.max(0, remaining);
			const maskStartX = offsetX + lineRevealed * charWidth;
			const rowY = offsetY + i * scaledLineHeight;
			ctx.fillRect(
				maskStartX,
				rowY,
				recordCanvas.width - maskStartX,
				scaledLineHeight,
			);
			ctx.fillRect(
				0,
				rowY + scaledLineHeight,
				recordCanvas.width,
				recordCanvas.height - (rowY + scaledLineHeight),
			);
			return;
		}
	}

	draw(0);

	const stream = recordCanvas.captureStream(30);
	const mimeType = pickMimeType();
	const recorder = new MediaRecorder(stream, { mimeType });
	const chunks: Blob[] = [];
	recorder.ondataavailable = (event) => {
		if (event.data.size > 0) chunks.push(event.data);
	};

	const recorded = new Promise<Blob>((resolve, reject) => {
		recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
		recorder.onerror = () => reject(new Error("Recording failed."));
	});

	recorder.start();

	await new Promise<void>((resolve) => {
		const progress = { chars: 0 };
		// Drive the tween with manual ticks instead of gsap's default
		// requestAnimationFrame loop, which browsers can suspend entirely for
		// a backgrounded/hidden tab - exactly the scenario a long recording
		// risks if the user switches away mid-export.
		gsap.ticker.sleep();
		const intervalId = setInterval(() => gsap.ticker.tick(), 1000 / 30);
		gsap.to(progress, {
			chars: code.length,
			duration: (code.length * msPerChar) / 1000,
			ease: "none",
			onUpdate: () => draw(Math.floor(progress.chars)),
			onComplete: () => {
				draw(code.length);
				clearInterval(intervalId);
				gsap.ticker.wake();
				resolve();
			},
		});
	});

	await new Promise((resolve) => setTimeout(resolve, holdMs));
	recorder.stop();
	return recorded;
}
