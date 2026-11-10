import type { ReactNode } from "react";

/**
 * A small cross where two hairlines of the frame meet. It sits just outside
 * the column, so it shows only once the column has room on either side.
 */
function Cross({ side }: { side: "l" | "r" }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 8 8"
			className={`d:none p:a b:-1 w:2 h:2 c:rim @xl:d:b ${side === "l" ? "l:-1" : "r:-1"}`}
		>
			<path d="M4 0v8M0 4h8" stroke="currentColor" strokeWidth="1" />
		</svg>
	);
}

/**
 * One band of the page: a hairline across the whole width under it, and on
 * wider screens two more down the sides of the column, crossed at the corners.
 */
export function Band({
	children,
	className = "",
	grow = false,
	last = false,
}: {
	children: ReactNode;
	className?: string;
	/** Takes the height left over, so the page fits the screen. */
	grow?: boolean;
	/** The bottom band: no hairline under it. */
	last?: boolean;
}) {
	return (
		<div
			className={`${last ? "" : "bbw:1 bbc:line"} ${grow ? "d:f fd:c fg:1 min-h:0" : ""}`}
		>
			<div
				className={`p:r w:100% max-w:260 mx:auto @md:blw:1 @md:brw:1 @md:blc:line @md:brc:line ${grow ? "fg:1 min-h:0" : ""} ${className}`}
			>
				{children}
				{!last && <Cross side="l" />}
				{!last && <Cross side="r" />}
			</div>
		</div>
	);
}
