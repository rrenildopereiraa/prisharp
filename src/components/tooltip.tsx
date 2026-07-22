import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ReactElement } from "react";
import { useChromeTheme } from "../lib/chrome-theme";

export function Tooltip({
	content,
	children,
}: {
	content: string;
	children: ReactElement;
}) {
	const { colors } = useChromeTheme();
	return (
		<BaseTooltip.Root>
			<BaseTooltip.Trigger render={children} />
			<BaseTooltip.Portal>
				<BaseTooltip.Positioner sideOffset={6} className="zi-90">
					<BaseTooltip.Popup
						className="tooltip-popup px-2 py-1 bw-1 bs-s fs-xs ff-m us-none bs-o-xs"
						style={{
							borderColor: colors.border,
							backgroundColor: colors.surface,
							color: colors.accentDim,
						}}
					>
						{content}
					</BaseTooltip.Popup>
				</BaseTooltip.Positioner>
			</BaseTooltip.Portal>
		</BaseTooltip.Root>
	);
}
