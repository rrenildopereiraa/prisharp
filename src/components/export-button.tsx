import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import { CaretDownIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import {
	type ExportFormat,
	FORMAT_LABELS,
	IMAGE_FORMATS,
} from "./format-picker";

function FormatMenuItem({
	format,
	selected,
	onSelect,
}: {
	format: ExportFormat;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<Menu.Item
			onClick={onSelect}
			className={(state) =>
				`d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p ${state.highlighted ? "bg-accent c-page" : selected ? "c-accent h:c-white fw-700 tdl-u" : "c-accent-dim"}`
			}
		>
			{FORMAT_LABELS[format]}
		</Menu.Item>
	);
}

export function ExportButton({
	exporting,
	onExport,
	format,
	onFormatChange,
}: {
	exporting: boolean;
	onExport: () => void;
	format: ExportFormat;
	onFormatChange: (value: ExportFormat) => void;
}) {
	if (exporting) {
		return (
			<Button
				disabled
				focusableWhenDisabled
				className="export-pulse d-f ai-c jc-c g-2 min-w-24 h-7 px-2 fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs fv:os-s fv:oo-2 fv:oc-accent bg-accent c-page"
			>
				<span>Exporting</span>
			</Button>
		);
	}

	return (
		<div className="d-f">
			<Button
				onClick={onExport}
				className="d-f ai-c jc-c g-2 w-24 h-7 px-2 bg-accent c-page fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs h:bg-accent-8 fv:os-s fv:oo-2 fv:oc-accent"
			>
				<DownloadSimpleIcon size={14} weight="fill" />
				<span>Export</span>
			</Button>

			<div className="w-px bg-page/40" aria-hidden="true" />

			<Menu.Root>
				<Menu.Trigger className="d-f ai-c jc-c w-6 h-7 px-1 bg-accent c-page fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs h:bg-accent-8 fv:os-s fv:oo-2 fv:oc-accent">
					<CaretDownIcon size={12} weight="fill" />
				</Menu.Trigger>
				<Menu.Portal keepMounted>
					<Menu.Positioner sideOffset={8} align="end" className="zi-90 ow-0">
						<Menu.Popup className="menu-popup py-1 w-28 bw-1 bc-border bg-surface bs-o-xs">
							{IMAGE_FORMATS.map((key) => (
								<FormatMenuItem
									key={key}
									format={key}
									selected={format === key}
									onSelect={() => onFormatChange(key)}
								/>
							))}
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</div>
	);
}
