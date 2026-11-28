/** What each permission in the manifest is for. A test keeps this whole. */
export const USES: Record<string, string> = {
	activeTab:
		"Lets Prisharp read the tab you are on, and only once you click its icon. It gives no access to any other tab, or to the same tab once you move to another site.",
	scripting:
		"Lets Prisharp run its reader in that tab, the code that collects the evidence. Without activeTab it has no tab to run in, so it runs only where and when you click.",
	offscreen:
		"Lets a hidden page follow your system's light or dark mode, so the toolbar icon matches it. That page reads nothing else. Firefox matches the icon to its theme by itself, so its build doesn't ask for this.",
};
