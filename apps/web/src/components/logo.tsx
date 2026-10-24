import { icons } from "extension/icons";
import { useContext } from "react";
import { DarkContext } from "@/theme";

// the svgl logos the extension ships, at their URLs in the build
const files = import.meta.glob<string>("../../../extension/icons/tech/*.svg", {
	eager: true,
	query: "?url",
	import: "default",
});

const url = (file: string) =>
	files[`../../../extension/icons/tech/${file}.svg`];

/** Whether the extension ships a logo by this name. */
export const hasLogo = (name: string) => name in icons;

/** A technology's logo, in its dark variant on a dark page when it has one. */
export function Logo({ name, className }: { name: string; className: string }) {
	const dark = useContext(DarkContext);
	if (!(name in icons)) return null;
	const variant = (icons as Record<string, boolean>)[name] && dark;
	return (
		<img
			src={url(variant ? `${name}-dark` : name)}
			alt=""
			draggable={false}
			className={className}
		/>
	);
}
