// Chrome shows an extension's toolbar icon as is: it does not follow the
// browser into dark mode. An offscreen page watches the color scheme, which a
// service worker cannot, and the worker swaps in the matching icon.

const tint = (dark) => {
	const tone = dark ? "dark" : "light";
	return chrome.action.setIcon({
		path: {
			16: `/icons/action/${tone}-16.png`,
			32: `/icons/action/${tone}-32.png`,
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

// The popup leaves the number of technologies it found on the icon, for that
// tab. A new page in the tab has not been read yet, so its count goes.
const badge = () =>
	Promise.all([
		chrome.action.setBadgeBackgroundColor({ color: "#2b44ff" }),
		chrome.action.setBadgeTextColor({ color: "#ffffff" }),
	]);

chrome.runtime.onStartup.addListener(() => void badge());
chrome.runtime.onInstalled.addListener(() => void badge());
chrome.tabs.onUpdated.addListener((tabId, change) => {
	if (change.status === "loading") {
		void chrome.action.setBadgeText({ tabId, text: "" });
	}
});
