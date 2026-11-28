// The count on the toolbar icon, shared by the popup and the background,
// which keeps it up to date (see count.js).

export const ACCESS = { origins: ["<all_urls>"] };

/** Whether the count is on. */
export const counting = () => chrome.permissions.contains(ACCESS);

/** What the badge says: nothing when nothing was found. */
export const badge = (count) =>
	count === 0 ? "" : count > 99 ? "99+" : String(count);

// The mark's own accent from prisharp.com, so the badge reads as Prisharp's.
const BACKGROUND = "#2b44ff";
const TEXT = "#ffffff";

/** Puts the count on a tab's icon. */
export async function show(tabId, count) {
	await chrome.action.setBadgeBackgroundColor({ tabId, color: BACKGROUND });
	await chrome.action.setBadgeTextColor?.({ tabId, color: TEXT });
	await chrome.action.setBadgeText({ tabId, text: badge(count) });
}
