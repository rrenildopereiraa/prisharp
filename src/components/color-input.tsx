import { Popover } from "@base-ui/react/popover";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useChromeTheme } from "../lib/chrome-theme";

export function ColorInput({
	label,
	value,
	onChange,
	indent,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	indent?: boolean;
}) {
	const { colors } = useChromeTheme();
	return (
		<div className={`d-f ai-c jc-sb g-2 px-2 pb-2 ${indent ? "pl-6" : ""}`}>
			<span
				className="d-f ai-c g-1 fs-sm ff-m us-none"
				style={{ color: colors.accentDim }}
			>
				{label}
			</span>
			<div
				className="d-f ai-c g-2 h-7 pl-1 pr-2 bw-1 bs-s bs-i-xs"
				style={{ backgroundColor: colors.page, borderColor: colors.border }}
			>
				<Popover.Root>
					<Popover.Trigger
						className="as-s w-5 h-5 r-1 fs-0 c-p fv:os-s fv:oo-2 fv:oc-accent"
						style={{ backgroundColor: value }}
						aria-label={`${label} color picker`}
					/>
					<Popover.Portal>
						<Popover.Positioner sideOffset={8} align="end" className="zi-90">
							<Popover.Popup
								className="popover-popup p-2 bw-1 bs-o-xs"
								style={{
									borderColor: colors.border,
									backgroundColor: colors.surface,
								}}
							>
								<HexColorPicker color={value} onChange={onChange} />
							</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				</Popover.Root>
				<HexColorInput
					color={value}
					onChange={onChange}
					prefixed
					spellCheck={false}
					className="ff-m fs-sm bw-0 os-none p-0 w-16 bg-transparent"
					style={{ color: colors.accentDim }}
				/>
			</div>
		</div>
	);
}
