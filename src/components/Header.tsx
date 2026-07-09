import { Button } from "@base-ui/react/button";
import { Select } from "@base-ui/react/select";
import {
	CheckIcon,
	ChevronDownIcon,
	ClipboardCopyIcon,
	CheckIcon as CopiedIcon,
	DownloadIcon,
	ReloadIcon,
} from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useHaptics } from "../lib/haptics";
import type { LanguageId } from "../lib/highlighter";
import { LanguagePicker } from "./LanguagePicker";

export type ExportFormat = "png" | "jpg" | "webp" | "svg";

const FORMAT_LABELS: Record<ExportFormat, string> = {
	png: "PNG",
	jpg: "JPG",
	webp: "WEBP",
	svg: "SVG",
};

function FormatPicker({
	value,
	onValueChange,
}: {
	value: ExportFormat;
	onValueChange: (value: ExportFormat) => void;
}) {
	const [open, setOpen] = useState(false);
	const { trigger: haptic } = useHaptics();

	return (
		<Select.Root
			value={value}
			onValueChange={(next) => {
				if (next) {
					onValueChange(next);
					haptic("success");
				}
			}}
			open={open}
			onOpenChange={setOpen}
		>
			<Select.Trigger
				className={`d-f ai-c jc-sb g-2 w-20 px-3 py-2 bw-1 bc-border c-accent-dim fs-sm ff-m us-none c-p bs-o-xs fv:oo-2 fv:oc-accent ${open ? "bg-page" : "bg-surface"}`}
			>
				<Select.Value>{() => FORMAT_LABELS[value]}</Select.Value>
				<Select.Icon className="d-f c-accent-dim">
					<ChevronDownIcon className="w-4 h-4" />
				</Select.Icon>
			</Select.Trigger>
			<AnimatePresence>
				{open && (
					<Select.Portal>
						<Select.Positioner sideOffset={8} alignItemWithTrigger={false} className="zi-90 p-0 ow-0 us-none">
							<Select.Popup
								render={
									<motion.div
										initial={{ opacity: 0, scale: 0.97 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.97 }}
										transition={{ duration: 0.12, ease: "easeOut" }}
									/>
								}
								className="w-28 bw-1 bc-border bg-surface py-1 bs-o-xs"
							>
								<Select.List>
									{(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((key) => (
										<Select.Item
											key={key}
											value={key}
											className={(state) =>
												`d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p ${state.highlighted ? "bg-page c-accent" : "c-accent-dim"}`
											}
										>
											<Select.ItemText>{FORMAT_LABELS[key]}</Select.ItemText>
											<Select.ItemIndicator className="d-f ai-c c-accent">
												<CheckIcon className="w-4 h-4" />
											</Select.ItemIndicator>
										</Select.Item>
									))}
								</Select.List>
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				)}
			</AnimatePresence>
		</Select.Root>
	);
}

export function Header({
	language,
	onLanguageChange,
	format,
	onFormatChange,
	exporting,
	onCopy,
	onExport,
}: {
	language: LanguageId;
	onLanguageChange: (value: LanguageId) => void;
	format: ExportFormat;
	onFormatChange: (value: ExportFormat) => void;
	exporting: boolean;
	onCopy: () => void;
	onExport: () => void;
}) {
	const { trigger } = useHaptics();
	const [copied, setCopied] = useState(false);

	return (
		<header className="d-f ai-c jc-sb g-2 px-4 @sm:px-8 py-6 @sm:py-8">
			<span className="ff-m fw-700 fs-md @sm:fs-lg c-accent">Aperture</span>

			<div className="d-f ai-c g-2 @sm:g-3">
				<LanguagePicker value={language} onValueChange={onLanguageChange} />

				<Button
					onClick={() => {
						onCopy();
						trigger("success");
						setCopied(true);
						setTimeout(() => setCopied(false), 1500);
					}}
					className="d-f ai-c jc-c g-2 w-10 @sm:w-28 px-3 @sm:px-4 py-2 bw-1 bc-border bg-surface c-accent-dim fs-sm ff-m us-none c-p bs-o-xs tp-c tdu-150 ttf-io h:bg-page fv:oo-2 fv:oc-accent"
				>
					{copied ? <CopiedIcon className="w-4 h-4 c-diff-add" /> : <ClipboardCopyIcon className="w-4 h-4" />}
					<span className="d-none @sm:d-if">{copied ? "Copied" : "Copy"}</span>
				</Button>

				<FormatPicker value={format} onValueChange={onFormatChange} />

				<Button
					onClick={() => {
						onExport();
						trigger("success");
					}}
					disabled={exporting}
					focusableWhenDisabled
					className="d-f ai-c jc-c g-2 w-10 @sm:w-32 px-3 @sm:px-4 py-2 bw-1 bc-accent bg-accent c-page fw-600 fs-sm ff-m us-none c-p bs-o-xs tp-c tdu-150 ttf-io h:bg-accent-dim fv:oo-2 fv:oc-accent"
				>
					{exporting ? (
						<motion.span
							className="d-f"
							animate={{ rotate: 360 }}
							transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
						>
							<ReloadIcon className="w-4 h-4" />
						</motion.span>
					) : (
						<DownloadIcon className="w-4 h-4" />
					)}
					<span className="d-none @sm:d-if">{exporting ? "Exporting" : "Export"}</span>
				</Button>
			</div>
		</header>
	);
}
