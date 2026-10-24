// Chrome shows an extension's toolbar icon as is: it does not follow the
// browser into dark mode. An offscreen page watches the color scheme, which a
// service worker cannot, and the worker swaps in the matching icon.

const tint = (dark) => {
	const tone = dark ? "dark" : "light";
	return chrome.action.setIcon({
		path: {
			16: `icons/action/${tone}-16.png`,
			32: `icons/action/${tone}-32.png`,
		},
	});
};

async function watch() {
	if (await chrome.offscreen.hasDocument()) return;
	await chrome.offscreen.createDocument({
		url: "offscreen.html",
		reasons: ["MATCH_MEDIA"],
		justification: "Match the toolbar icon to the browser's light or dark mode",
	});
}

chrome.runtime.onMessage.addListener((message) => {
	if (message?.type === "scheme") void tint(message.dark);
});
chrome.runtime.onStartup.addListener(() => void watch());
chrome.runtime.onInstalled.addListener(() => void watch());
