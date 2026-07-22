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
			<div className="d-f g-2">
				<HexColorInput
					color={value}
					onChange={onChange}
					prefixed
					spellCheck={false}
					className="ff-m fs-sm bs-i-xs bw-1 bs-s px-2 py-1 w-20"
					style={{
						color: colors.accentDim,
						backgroundColor: colors.page,
						borderColor: colors.border,
					}}
				/>
				<Popover.Root>
					<Popover.Trigger
						className="w-5 h-5 bw-1 bs-s fs-0 c-p fv:os-s fv:oo-2 fv:oc-accent"
						style={{ backgroundColor: value, borderColor: colors.border }}
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
			</div>
		</div>
	);
}
