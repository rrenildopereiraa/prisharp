/** What each permission in the manifest is for. A test keeps this whole. */
export const USES: Record<string, string> = {
	activeTab: "Read the tab you're on, only when you click the icon.",
	scripting: "Run Prisharp's reader in that tab.",
	offscreen: "Match the toolbar icon to light or dark mode. Reads nothing.",
};
