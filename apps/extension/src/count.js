// The technology count on the toolbar icon, for people who turn it on.
// Off by default: Prisharp has no access to any site until it is clicked.
// Turning the count on asks for access to every site, which is the only way
// to read a page before anyone clicks. Whether the count is on is whether
// that access is held, so there is no setting to store and none to fall out
// of step with the browser's own record. The count is worked out here, in
// the browser, the same way the popup does it, and nothing is sent anywhere.

import { collect } from "./collect.js";
import { detect, probes } from "./detect.js";
import { categories, technologies } from "./technologies.js";
import { counting, show } from "./badge.js";

const clear = (tabId) =>
	chrome.action.setBadgeText({ tabId, text: "" }).catch(() => {});

/** Reads a tab the way the popup does and puts the count on its icon. */
async function count(tab) {
	if (!tab?.id || !/^https?:/.test(tab.url ?? "")) return;
	let page;
	try {
		const [result] = await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			world: "MAIN",
			func: collect,
			args: [probes(technologies)],
		});
		page = result.result;
	} catch {
		// a page the browser keeps extensions out of, such as its store
		return;
	}
	// the tab may have moved on while the page was read
	const now = await chrome.tabs.get(tab.id).catch(() => null);
	if (!page || now?.url !== page.url) return;
	await show(tab.id, detect(page, technologies, categories).length).catch(
		() => {},
	);
}

const countAll = async () => {
	for (const tab of await chrome.tabs.query({})) void count(tab);
};

const clearAll = async () => {
	for (const tab of await chrome.tabs.query({})) void clear(tab.id);
};

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
	if (change.status === "loading") void clear(tabId);
	if (change.status !== "complete") return;
	void counting().then((on) => on && count(tab));
});

// Turned on in the popup: count the tabs already open, not only the next
// page loads. Turned off, here or in the browser's settings: take it away.
chrome.permissions.onAdded.addListener(async () => {
	if (await counting()) void countAll();
});
chrome.permissions.onRemoved.addListener(async () => {
	if (!(await counting())) void clearAll();
});
