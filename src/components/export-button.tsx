import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import { CaretDownIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useChromeTheme, useHover } from "../lib/chrome-theme";
import { hoverShade, overlayColor } from "../lib/color";
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
	const { colors } = useChromeTheme();
	return (
		<Menu.Item
			onClick={onSelect}
			className={(state) =>
				`d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p ${state.highlighted ? "" : selected ? "h:c-white fw-700 tdl-u" : ""}`
			}
			style={(state) => ({
				backgroundColor: state.highlighted ? colors.accent : undefined,
				color: state.highlighted
					? colors.onAccent
					: selected
						? colors.accent
						: colors.accentDim,
			})}
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
	const { colors } = useChromeTheme();
	const { hovered: exportHovered, hoverHandlers: exportHoverHandlers } =
		useHover();
	const { hovered: menuHovered, hoverHandlers: menuHoverHandlers } = useHover();
	if (exporting) {
		return (
			<Button
				disabled
				focusableWhenDisabled
				className="d-f ai-c jc-c g-2 min-w-24 h-7 px-2 fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs fv:os-s fv:oo-2 fv:oc-accent"
				style={{ backgroundColor: colors.accent, color: colors.onAccent }}
			>
				<span>Exporting</span>
			</Button>
		);
	}

	return (
		<div className="d-f">
			<Button
				onClick={onExport}
				className="d-f ai-c jc-c g-2 w-24 h-7 px-2 fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs fv:os-s fv:oo-2 fv:oc-accent"
				style={{
					backgroundColor: exportHovered
						? hoverShade(colors.accent)
						: colors.accent,
					color: colors.onAccent,
				}}
				{...exportHoverHandlers}
			>
				<DownloadSimpleIcon size={14} weight="fill" />
				<span>Export</span>
			</Button>

			<div
				className="w-px"
				aria-hidden="true"
				style={{ backgroundColor: overlayColor(colors.page, 0.4) }}
			/>

			<Menu.Root>
				<Menu.Trigger
					className="d-f ai-c jc-c w-6 h-7 px-1 fw-600 fs-sm ff-m us-none c-p bw-0 bs-i-xs fv:os-s fv:oo-2 fv:oc-accent"
					style={{
						backgroundColor: menuHovered
							? hoverShade(colors.accent)
							: colors.accent,
						color: colors.onAccent,
					}}
					{...menuHoverHandlers}
				>
					<CaretDownIcon size={12} weight="fill" />
				</Menu.Trigger>
				<Menu.Portal keepMounted>
					<Menu.Positioner sideOffset={8} align="end" className="zi-90 ow-0">
						<Menu.Popup
							className="menu-popup py-1 w-28 bw-1 bs-o-xs"
							style={{
								borderColor: colors.border,
								backgroundColor: colors.surface,
							}}
						>
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
