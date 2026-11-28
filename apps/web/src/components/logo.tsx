import { createContext, useContext } from "react";
import { logos } from "virtual:catalog";
import { DarkContext } from "@/theme";

/** A logo's URL in the build, by its file name without the extension. */
export const url = (file: string) => logos[file];

/** Whether the page ships a logo by this name. */
export const hasLogo = (name: string) => name in logos;

/**
 * The logo files a page can draw: the home page's slice, unless a page that
 * ships every logo, like the docs' list, provides them all.
 */
export const LogosContext = createContext<Record<string, string>>(logos);

/** A technology's logo, in its dark variant on a dark page when it has one. */
export function Logo({ name, className }: { name: string; className: string }) {
	const dark = useContext(DarkContext);
	const files = useContext(LogosContext);
	if (!(name in files)) return null;
	const variant = dark && `${name}-dark` in files;
	return (
		<img
			src={files[variant ? `${name}-dark` : name]}
			alt=""
			draggable={false}
			data-logo
			className={className}
		/>
	);
}
