// The popup's settings, kept in its own localStorage: it belongs to the
// extension, survives restarts, and needs no permission. The count on the
// toolbar icon is not here: it is on while Prisharp holds access to every
// site (see badge.js).

const DEFAULTS = {
	// "Copy the list" and "Copy" are hidden until turned on
	showCopy: false,
	// what "Copy the list" writes: "text" or "markdown"
	format: "text",
	// "auto" follows the browser, "light" and "dark" hold one
	theme: "auto",
};

const KEY = "prisharp:settings";

function load() {
	try {
		return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
	} catch {
		return { ...DEFAULTS };
	}
}

const current = load();

/** One setting's value. */
export const setting = (name) => current[name];

/** Changes one setting and keeps it for the next time the popup opens. */
export function set(name, value) {
	current[name] = value;
	try {
		localStorage.setItem(KEY, JSON.stringify(current));
	} catch {
		// private windows can refuse storage: the change still holds while open
	}
}
