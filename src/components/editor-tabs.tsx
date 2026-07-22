import { Button } from "@base-ui/react/button";
import {
	CheckIcon,
	ClipboardIcon,
	ClipboardTextIcon,
	FileCodeIcon,
	LinkSimpleIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	XIcon,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useChromeTheme } from "../lib/chrome-theme";
import { modKey } from "../lib/platform";
import { type EditorDocument, MAX_DOCUMENTS } from "../lib/types";
import { ExportButton } from "./export-button";
import type { ExportFormat } from "./format-picker";
import { Tooltip } from "./tooltip";

function TabItem({
	doc,
	isActive,
	canClose,
	onSelect,
	onClose,
}: {
	doc: EditorDocument;
	isActive: boolean;
	canClose: boolean;
	onSelect: (id: string) => void;
	onClose: (id: string) => void;
}) {
	const { colors } = useChromeTheme();
	const ref = useRef<HTMLDivElement>(null);
	const closingRef = useRef(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const tween = gsap.from(el, {
			x: 24,
			opacity: 0,
			duration: 0.2,
			ease: "power2.out",
		});
		return () => {
			tween.kill();
			// Strict Mode double-invokes this effect in dev; without reverting
			// the styles the killed tween already applied, the second run
			// would animate from garbage back to that same garbage.
			gsap.set(el, { clearProps: "transform,opacity" });
		};
	}, []);

	function handleClose() {
		const el = ref.current;
		if (!el || closingRef.current) return;
		closingRef.current = true;
		gsap.to(el, {
			x: 24,
			opacity: 0,
			width: 0,
			paddingLeft: 0,
			paddingRight: 0,
			duration: 0.18,
			ease: "power2.in",
			onComplete: () => onClose(doc.id),
		});
	}

	return (
		<div
			ref={ref}
			className={`d-f ai-c g-2 pl-3 pr-2 py-2 brw-1 bs-s c-p o-h ${
				isActive ? "" : "bg-transparent h:bg-page"
			}`}
			style={{
				borderColor: colors.border,
				backgroundColor: isActive ? colors.page : undefined,
			}}
		>
			<button
				type="button"
				onClick={() => onSelect(doc.id)}
				className="d-f ai-c g-2 p-0 bg-transparent bw-0 us-none c-p fv:os-s fv:oo-2 fv:oc-accent f-1 ws-nw"
			>
				<FileCodeIcon
					size={14}
					weight="fill"
					style={{ color: isActive ? colors.accent : colors.accentDim }}
				/>
				<span className="fs-sm ff-m ws-nw" style={{ color: colors.accentDim }}>
					{doc.fileName || "Untitled"}
				</span>
			</button>
			{canClose && (
				<Tooltip content="Close snippet">
					<button
						type="button"
						onClick={handleClose}
						aria-label="Close snippet"
						className="d-f ai-c jc-c p-0 bg-transparent bw-0 c-p h:c-accent fv:os-s fv:oo-2 fv:oc-accent"
						style={{ color: colors.accentDim }}
					>
						<XIcon size={12} weight="bold" />
					</button>
				</Tooltip>
			)}
		</div>
	);
}

export function EditorTabBar({
	documents,
	activeId,
	onSelect,
	onClose,
	onAdd,
	onOpenPalette,
	onCopy,
	onExport,
	onShare,
	exporting,
	format,
	onFormatChange,
}: {
	documents: EditorDocument[];
	activeId: string;
	onSelect: (id: string) => void;
	onClose: (id: string) => void;
	onAdd: () => void;
	onOpenPalette: () => void;
	onCopy: () => void;
	onExport: () => void;
	onShare: () => void;
	exporting: boolean;
	format: ExportFormat;
	onFormatChange: (value: ExportFormat) => void;
}) {
	const { colors } = useChromeTheme();
	const [copied, setCopied] = useState(false);
	const [shared, setShared] = useState(false);
	const canClose = documents.length > 1;
	const atLimit = documents.length >= MAX_DOCUMENTS;

	return (
		<header
			className="d-f p-st t-0 zi-10 bbw-1 bs-s"
			style={{ borderColor: colors.border, backgroundColor: colors.surface }}
		>
			<div
				className="d-f ai-c g-2 px-3 py-2 brw-1 bs-s"
				style={{ borderColor: colors.border }}
			>
				<svg
					width="22"
					height="22"
					viewBox="0 0 100 100"
					aria-hidden="true"
					className="fs-0"
				>
					<polygon
						points="50,18 78,50 50,82 22,50"
						fill="#2563eb"
						stroke="#1d4ed8"
						strokeWidth="1"
					/>
					<polygon points="50,18 64,50 50,82" fill="#93b4f5" />
				</svg>
				<span className="fs-sm ff-m fw-700 us-none ws-nw">
					Pri<span style={{ color: colors.accent }}>sharp</span>
				</span>
			</div>

			<div className="d-none @lg:d-f min-w-0 o-x-auto">
				{documents.map((doc) => (
					<TabItem
						key={doc.id}
						doc={doc}
						isActive={doc.id === activeId}
						canClose={canClose}
						onSelect={onSelect}
						onClose={onClose}
					/>
				))}

				<Tooltip
					content={
						atLimit ? `Snippet limit reached (${MAX_DOCUMENTS})` : "New snippet"
					}
				>
					<button
						type="button"
						onClick={onAdd}
						aria-label={
							atLimit
								? `Snippet limit reached (${MAX_DOCUMENTS})`
								: "New snippet"
						}
						style={{
							opacity: atLimit ? 0.4 : undefined,
							borderColor: colors.border,
							color: colors.accentDim,
						}}
						className="d-f ai-c jc-c as-s w-8 brw-1 bs-s bg-transparent c-p h:c-accent h:bg-page fv:os-s fv:oo--2 fv:oc-accent"
					>
						<PlusIcon size={14} weight="bold" />
					</button>
				</Tooltip>
			</div>

			<div className="f-1" />

			<div className="d-f ai-c g-1 px-2">
				<Button
					onClick={onOpenPalette}
					aria-label="Search commands"
					className="d-none @lg:d-f ai-c jc-c g-2 h-7 px-3 bw-1 fs-xs ff-m us-none c-p bs-i-xs h:c-accent fv:os-s fv:oo-2 fv:oc-accent"
					style={{
						backgroundColor: colors.page,
						borderColor: colors.border,
						color: colors.accentDim,
					}}
				>
					<MagnifyingGlassIcon size={12} weight="bold" />
					Search
					<span
						className="px-1 bw-1 bs-s fs-xs ws-nw"
						style={{ borderColor: colors.border, color: colors.accentDim }}
					>
						{modKey}K
					</span>
				</Button>

				<Button
					onClick={() => {
						onShare();
						setShared(true);
						setTimeout(() => setShared(false), 1500);
					}}
					className="d-f ai-c jc-c g-2 w-8 @lg:w-24 h-7 px-2 bg-transparent bw-1 bs-i-xs us-none c-p h:bg-page h:c-accent fv:os-s fv:oo-2 fv:oc-accent"
					style={{ color: colors.accentDim, borderColor: colors.border }}
				>
					{shared ? (
						<CheckIcon
							size={14}
							weight="bold"
							style={{ color: colors.diffAdd }}
						/>
					) : (
						<LinkSimpleIcon size={14} />
					)}
					<span className="d-none @lg:d-if">{shared ? "Copied" : "Share"}</span>
				</Button>

				<Button
					onClick={() => {
						onCopy();
						setCopied(true);
						setTimeout(() => setCopied(false), 1500);
					}}
					className="d-f ai-c jc-c g-2 w-8 @lg:w-24 h-7 px-2 bg-transparent bw-1 bs-i-xs us-none c-p h:bg-page h:c-accent fv:os-s fv:oo-2 fv:oc-accent"
					style={{ color: colors.accentDim, borderColor: colors.border }}
				>
					{copied ? (
						<ClipboardTextIcon
							size={14}
							weight="fill"
							style={{ color: colors.diffAdd }}
						/>
					) : (
						<ClipboardIcon size={14} weight="fill" />
					)}
					<span className="d-none @lg:d-if">{copied ? "Copied" : "Copy"}</span>
				</Button>

				<ExportButton
					exporting={exporting}
					onExport={onExport}
					format={format}
					onFormatChange={onFormatChange}
				/>
			</div>
		</header>
	);
}
