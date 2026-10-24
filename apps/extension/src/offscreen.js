// Runs in the offscreen page: reports the color scheme now and on every
// change, so the worker can tint the toolbar icon.
const scheme = matchMedia("(prefers-color-scheme: dark)");
const report = () =>
	chrome.runtime.sendMessage({ type: "scheme", dark: scheme.matches });

void report();
scheme.addEventListener("change", () => void report());
