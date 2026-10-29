import { Tooltip as Base } from "@base-ui/react/tooltip";
import type { ReactElement } from "react";

type Side = "top" | "right" | "bottom" | "left";

export function TooltipProvider({ children }: { children: ReactElement }) {
	return <Base.Provider delay={300}>{children}</Base.Provider>;
}

export function Tooltip({
	label,
	children,
	side = "top",
	delay,
}: {
	label: string;
	children: ReactElement;
	side?: Side;
	delay?: number;
}) {
	return (
		<Base.Root trackCursorAxis="both">
			<Base.Trigger render={children} delay={delay} />
			<Base.Portal>
				<Base.Positioner side={side} sideOffset={10} className="zi:50">
					<Base.Popup className="max-w:60 px:2 py:1 br:md bw:1 bg:raised bc:line c:label fs:xs bs-o:md tp:o tdu:150 @prm:tp:none opening:o:0 closing:o:0">
						{label}
					</Base.Popup>
				</Base.Positioner>
			</Base.Portal>
		</Base.Root>
	);
}
