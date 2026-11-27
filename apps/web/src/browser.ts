/** Whether the page is open in Firefox, which takes the Firefox build. */
export const FIREFOX =
	typeof navigator !== "undefined" && /Firefox\//.test(navigator.userAgent);
