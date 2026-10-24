import { createContext, useEffect, useState } from "react";

const QUERY = "(prefers-color-scheme: dark)";

/** Whether the system draws the page dark. Every color is a light-dark() pair. */
export function useDark() {
	const [dark, setDark] = useState(() => matchMedia(QUERY).matches);

	useEffect(() => {
		const media = matchMedia(QUERY);
		const update = () => setDark(media.matches);
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);

	return dark;
}

/** Whether the page is drawn dark, for images that come in two versions. */
export const DarkContext = createContext(false);
