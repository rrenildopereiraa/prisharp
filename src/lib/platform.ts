const isMac =
	typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

export const modKey = isMac ? "\u2318" : "Ctrl";
export const modLabel = isMac ? "Cmd" : "Ctrl";
