const agent = typeof navigator !== "undefined" ? navigator.userAgent : "";

/** Whether the page is open in Firefox, which takes the Firefox build. */
export const FIREFOX = /Firefox\//.test(agent);

/**
 * Whether the page is open where Prisharp can't be added: a phone or tablet,
 * or Safari. iPads that ask for the desktop site still name Safari.
 */
export const UNSUPPORTED =
	/Android|iPhone|iPad|iPod|Mobi/.test(agent) ||
	(/Safari\//.test(agent) && !/Chrome|Chromium|CriOS|FxiOS|Edg/.test(agent));
