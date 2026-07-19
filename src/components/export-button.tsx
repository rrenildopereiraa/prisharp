import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import {
	CaretDownIcon,
	DownloadSimpleIcon,
	SpinnerIcon,
} from "@phosphor-icons/react";
import { type ExportFormat, FORMAT_LABELS } from "./format-picker";

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
	return (
		<div className="d-f">
			<Button
				onClick={onExport}
				disabled={exporting}
				focusableWhenDisabled
				className="d-f ai-c jc-c g-2 w-24 h-7 px-2 bg-accent c-page fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs h:bg-accent-8 fv:os-s fv:oo-2 fv:oc-accent"
			>
				{exporting ? (
					<span className="d-f">
						<SpinnerIcon size={14} />
					</span>
				) : (
					<DownloadSimpleIcon size={14} weight="fill" />
				)}
				<span>{exporting ? "Exporting" : "Export"}</span>
			</Button>

			<div className="w-px bg-page/40" aria-hidden="true" />

			<Menu.Root>
				<Menu.Trigger className="d-f ai-c jc-c w-6 h-7 px-1 bg-accent c-page fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs h:bg-accent-8 fv:os-s fv:oo-2 fv:oc-accent">
					<CaretDownIcon size={12} weight="fill" />
				</Menu.Trigger>
				<Menu.Portal keepMounted>
					<Menu.Positioner sideOffset={8} align="end" className="zi-90 ow-0">
						<Menu.Popup className="menu-popup py-1 w-28 bw-1 bc-border bg-surface bs-o-xs">
							{(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((key) => (
								<Menu.Item
									key={key}
									onClick={() => onFormatChange(key)}
									className={(state) =>
										`d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p ${state.highlighted ? "bg-accent c-page" : format === key ? "c-accent h:c-white fw-700 tdl-u" : "c-accent-dim"}`
									}
								>
									{FORMAT_LABELS[key]}
								</Menu.Item>
							))}
						</Menu.Popup>
					</Menu.Positioner>
				</Menu.Portal>
			</Menu.Root>
		</div>
	);
}
