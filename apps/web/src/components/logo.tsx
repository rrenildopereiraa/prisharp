import { useContext } from "react";
import { logos } from "virtual:catalog";
import { DarkContext } from "@/theme";

/** A logo's URL in the build, by its file name without the extension. */
export const url = (file: string) => logos[file];

/** Whether the page ships a logo by this name. */
export const hasLogo = (name: string) => name in logos;

/** A technology's logo, in its dark variant on a dark page when it has one. */
export function Logo({ name, className }: { name: string; className: string }) {
	const dark = useContext(DarkContext);
	if (!hasLogo(name)) return null;
	const variant = dark && hasLogo(`${name}-dark`);
	return (
		<img
			src={url(variant ? `${name}-dark` : name)}
			alt=""
			draggable={false}
			data-logo
			className={className}
		/>
	);
}
