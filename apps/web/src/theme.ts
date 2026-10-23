import { createContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "prisharp-theme";

// the color scheme on <html>; every Yumma UI color is a light-dark() pair
const SCHEMES: Record<Theme, string> = {
	light: "cs:l",
	dark: "cs:d",
	system: "cs:ld",
};

export function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.remove(...Object.values(SCHEMES));
	root.classList.add(SCHEMES[theme]);
}

/** Whether the page is drawn dark, following the system when asked to. */
export function useDark(theme: Theme) {
	const query = "(prefers-color-scheme: dark)";
	const [system, setSystem] = useState(() => matchMedia(query).matches);

	useEffect(() => {
		const media = matchMedia(query);
		const update = () => setSystem(media.matches);
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);

	return theme === "dark" || (theme === "system" && system);
}

/** Whether the page is drawn dark, for images that come in two versions. */
export const DarkContext = createContext(false);
