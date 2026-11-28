import { ACCESS, counting, show as badge } from "./badge.js";
import { collect } from "./collect.js";
import { detect, probes } from "./detect.js";
import { icons } from "./icons.js";
import { markdown } from "./markdown.js";
import { set, setting } from "./settings.js";
import { symbol } from "./symbols.js";
import { categories, technologies } from "./technologies.js";

const $ = (id) => document.getElementById(id);

const home = $("home");
const detail = $("detail");
const settings = $("settings");
const pages = [home, detail, settings];
const status = $("status");
const list = $("list");
const copies = $("copies");
const copy = $("copy");
const copyEvidence = $("copy-evidence");
const count = $("count");
const showCopy = $("show-copy");

// A square button with only an icon: Settings and Close.
const ICON =
	"d:f ai:c jc:c fs:0 w:8 h:8 bw:0 p:0 bg:transparent c:hint c:p h:c:label fv:os:s fv:ow:2 fv:oc:focus";

// A quiet button that reads as text: Copy, Copy the list.
const TEXT =
	"d:if ai:c g:2 bw:0 p:0 bg:transparent c:accent ff:mono fs:xs c:p h:td:u fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus";

// Back to the page before, in the hint's color: "All 7", "Back".
const BACK = TEXT.replace("c:accent", "c:hint h:c:label").replace(
	" h:td:u",
	"",
);
const BACK_SIZE = " h:8";

// A technology's row in the list.
const ROW =
	"d:f ai:c g:4 w:100% h:12 px:1 bw:0 bg:transparent c:label ff:mono fs:xs ta:l td:none c:p h:bg:paper fv:os:s fv:ow:2 fv:oo:-2 fv:oc:focus";

// The switch's track and knob, off and on.
const TRACK =
	"d:f ai:c fs:0 w:9 h:5 mt:px px:calc(0.125rem) bw:1 c:p tp:a tdu:150 @prm:tp:none fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus";
const SWITCH = {
	off: { track: "jc:fs bc:rim bg:well", knob: "bg:hint" },
	on: { track: "jc:fe bc:accent bg:accent", knob: "bg:raised" },
};

// One choice of a segmented setting, chosen or not.
const OPTION = "p:r d:f ai:c h:7 px:3 fs:xs c:p fw:os:s fw:ow:2 fw:oc:focus";
const OPTION_STATE = {
	off: "bg:transparent c:hint h:c:label",
	on: "bg:label c:raised",
};

const hostOf = (url) => new URL(url).hostname.replace(/^www\./, "");

const label = (tech) => [tech.name, tech.version].filter(Boolean).join(" ");

for (const element of document.querySelectorAll("[data-symbol]")) {
	element.append(symbol(element.dataset.symbol, "d:b w:100% h:100%"));
}
for (const element of document.querySelectorAll("[data-icon]")) {
	element.className = ICON;
}
for (const element of document.querySelectorAll("[data-text]")) {
	element.className = TEXT;
}
for (const element of document.querySelectorAll("[data-back]")) {
	element.className = BACK + BACK_SIZE;
}
for (const button of document.querySelectorAll("[data-close]")) {
	button.addEventListener("click", () => window.close());
}

// The theme: the browser's, or the one picked in Settings. The colors are
// built on light-dark(), so the page's color-scheme is all that turns them.
const prefersDark = matchMedia("(prefers-color-scheme: dark)");
const isDark = () =>
	setting("theme") === "dark" ||
	(setting("theme") === "auto" && prefersDark.matches);

function applyTheme() {
	const theme = setting("theme");
	document.documentElement.style.colorScheme = theme === "auto" ? "" : theme;
	for (const img of document.querySelectorAll("img[data-logo]")) {
		img.src =
			isDark() && img.dataset.dark ? img.dataset.dark : img.dataset.light;
	}
}
applyTheme();
prefersDark.addEventListener("change", applyTheme);

// The logo Prisharp ships for the technology, and its first letter when it
// has none or the logo fails to load. Logos come from the extension itself,
// so the popup asks no other server for them. Each logo sits 2px inside its
// box, so the edges of the wide ones are not cut off where they meet it.
function icon(tech, size) {
	const name = tech.icon ?? tech.id;
	const letter = () => {
		const span = document.createElement("span");
		span.className = `${size} d:f ai:c jc:c fs:0 bg:well ff:sans fs:md c:hint`;
		span.textContent = tech.name[0];
		return span;
	};
	if (!(name in icons)) return letter();

	const img = document.createElement("img");
	img.className = `d:b fs:0 ${size} p:calc(0.125rem)`;
	img.alt = "";
	img.decoding = "async";
	img.dataset.logo = "";
	img.dataset.light = `icons/tech/${name}.svg`;
	if (icons[name]) img.dataset.dark = `icons/tech/${name}-dark.svg`;
	img.src = isDark() && img.dataset.dark ? img.dataset.dark : img.dataset.light;
	img.addEventListener("error", () => img.replaceWith(letter()));
	return img;
}

const EASE = "cubic-bezier(0.2, 0, 0, 1)";
const still = matchMedia("(prefers-reduced-motion: reduce)");
const main = document.querySelector("main");

// Shows one page, then eases the popup's height from the old size to the new
// one and slides the page in. Chrome sizes the popup to its content, so the
// window follows. Nothing moves under reduced motion.
function go(page, from = "translateY(4px)", change = () => {}) {
	const before = main.getBoundingClientRect().height;
	for (const other of pages) other.hidden = other !== page;
	change();
	if (still.matches) return;
	const after = main.getBoundingClientRect().height;
	if (Math.abs(before - after) > 1) {
		main.animate(
			[
				{ height: `${before}px`, overflow: "hidden" },
				{ height: `${after}px`, overflow: "hidden" },
			],
			{ duration: 260, easing: EASE },
		);
	}
	page.animate(
		[
			{ opacity: 0, transform: from },
			{ opacity: 1, transform: "none" },
		],
		{ duration: 220, easing: EASE },
	);
}

// Back to the list from a technology or the settings, by its button or
// Escape, with focus on what opened the page.
let returnTo = null;

function goHome() {
	go(home, "translateX(-16px)");
	returnTo?.focus();
}

document.addEventListener("keydown", (event) => {
	if (event.key !== "Escape" || !home.hidden) return;
	event.preventDefault();
	goHome();
});
$("back").addEventListener("click", goHome);
$("settings-back").addEventListener("click", goHome);

const copied = (button, text) => {
	const caption = button.querySelector("[data-caption]");
	const original = caption.textContent;
	void navigator.clipboard.writeText(text).then(() => {
		caption.textContent = "Copied";
		setTimeout(() => {
			caption.textContent = original;
		}, 1500);
	});
};

// What a technology brings in, among what was found: "+ React".
const brings = (tech, all) =>
	(tech.implies ?? [])
		.map((id) => all.find((other) => other.id === id)?.name)
		.filter(Boolean);

function tag(text, classes) {
	const span = document.createElement("span");
	span.className = `py:px px:2 ${classes}`;
	span.textContent = text;
	return span;
}

// A match on a row of its own: its kind on a quiet line, then what matched,
// as code, in the accent.
function evidenceItem({ kind, text, value }) {
	const item = document.createElement("li");
	item.className = "d:f fd:c g:1 py:3 px:1 bbw:1 bbc:line";

	const meta = document.createElement("span");
	meta.className = "c:hint wb:ba";
	meta.textContent = value === undefined ? kind : `${kind} · ${value}`;

	const code = document.createElement("code");
	code.className = "as:fs ff:mono fs:xs wb:ba";
	const match = document.createElement("span");
	match.className = "bg:accent/10 c:accent";
	match.textContent = text;
	code.append(match);

	item.append(meta, code);
	return item;
}

function open(tech, all, row) {
	$("back-label").textContent = `All ${all.length}`;
	$("name").textContent = tech.name;
	$("badge").replaceChildren(icon(tech, "w:8 h:8"));

	const implied = brings(tech, all);
	const tags = [
		tech.version && tag(`v${tech.version}`, "bg:accent/10 c:accent"),
		tag(tech.category, "bw:1 bc:line c:hint"),
		...implied.map((name) => tag(`+ ${name}`, "bw:1 bc:line c:hint")),
	].filter(Boolean);
	if (tech.version)
		tags[0].setAttribute("aria-label", `Version ${tech.version}`);
	$("tags").replaceChildren(...tags);

	const matches = tech.evidence.length;
	$("evidence-count").textContent =
		matches === 1 ? "1 match" : `${matches} matches`;
	$("evidence").replaceChildren(...tech.evidence.map(evidenceItem));

	const website = $("website");
	website.href = tech.website;
	website.textContent = `${hostOf(tech.website)} ↗`;

	copyEvidence.onclick = () =>
		copied(
			copyEvidence,
			[
				label(tech),
				...tech.evidence.map(
					({ kind, text, value }) =>
						`${kind}: ${text}${value === undefined ? "" : ` (${value})`}`,
				),
			].join("\n"),
		);

	returnTo = row;
	go(detail, "translateX(16px)");
	$("back").focus();
}

// A technology's row opens its evidence: its logo, its name in the serif,
// and its category. The version is on its own page.
function row(tech, all) {
	const item = document.createElement("li");
	item.className = "bbw:1 bbc:line";

	const button = document.createElement("button");
	button.type = "button";
	button.className = ROW;
	button.setAttribute(
		"aria-label",
		`${label(tech)}, ${tech.category}. Show the evidence`,
	);

	const name = document.createElement("span");
	name.className = "min-w:0 ff:sans fs:xl lh:1 c:label o:h to:e ws:nw";
	name.textContent = tech.name;
	const spacer = document.createElement("span");
	spacer.className = "fg:1";
	const category = document.createElement("span");
	category.className = "fs:0 c:hint ws:nw";
	category.textContent = tech.category;

	button.append(icon(tech, "w:5 h:5"), name, spacer, category);
	button.addEventListener("click", () => open(tech, all, button));
	item.append(button);
	return item;
}

// The copy buttons show only when turned on in Settings.
function paintCopies() {
	copies.hidden = !setting("showCopy") || list.hidden;
	copyEvidence.hidden = !setting("showCopy");
}

let found = null;

function show(all, hostname) {
	found = { all, hostname };
	// "7 technologies", the number large in the accent
	const amount = document.createElement("span");
	amount.className = "ff:sans fs:6xl lh:1 c:accent";
	amount.textContent = String(all.length);
	go(home, undefined, () => {
		// the space is for screen readers; flex layout drops it on screen
		status.replaceChildren(
			amount,
			" ",
			all.length === 1 ? "technology" : "technologies",
		);
		list.replaceChildren(...all.map((tech) => row(tech, all)));
		list.hidden = false;
		paintCopies();
	});
}

copy.addEventListener("click", () => {
	if (!found) return;
	const { all, hostname } = found;
	copied(
		copy,
		setting("format") === "markdown"
			? markdown(hostname, all)
			: all.map(label).join("\n"),
	);
});

// Settings

function paintSwitch(button, on) {
	button.setAttribute("aria-checked", String(on));
	const state = on ? SWITCH.on : SWITCH.off;
	button.className = `${TRACK} ${state.track}`;
	button.querySelector("[data-knob]").className = `d:b w:3 h:3 ${state.knob}`;
}

function paintChoice(name) {
	for (const input of document.querySelectorAll(`input[name="${name}"]`)) {
		input.checked = input.value === setting(name);
		const option = input.closest("[data-option]");
		const first = option === option.parentElement.firstElementChild;
		option.className = `${OPTION} ${input.checked ? OPTION_STATE.on : OPTION_STATE.off}${first ? "" : " blw:1 blc:rim"}`;
	}
}

for (const input of document.querySelectorAll("[data-radio]")) {
	// out of sight, still reached by Tab and the arrow keys
	input.className = "p:a o:0 w:px h:px m:0";
	input.addEventListener("change", () => {
		set(input.name, input.value);
		paintChoice(input.name);
		if (input.name === "theme") applyTheme();
	});
}
paintChoice("format");
paintChoice("theme");

paintSwitch(showCopy, setting("showCopy"));
showCopy.addEventListener("click", () => {
	set("showCopy", !setting("showCopy"));
	paintSwitch(showCopy, setting("showCopy"));
	paintCopies();
});

$("version").textContent = `Prisharp ${chrome.runtime.getManifest().version}`;

const openSettings = $("open-settings");
openSettings.addEventListener("click", () => {
	returnTo = openSettings;
	go(settings, "translateX(16px)");
	$("settings-back").focus();
});

// The switch for the count on the toolbar icon. It is on while Prisharp
// holds access to every site, so it shows the browser's own record.
// The tab the popup read, and how many technologies it found, so turning the
// count on shows it on this tab straight away.
let counted;

paintSwitch(count, false);
count.addEventListener("click", () => {
	// Firefox only asks for access straight from the click, before any wait
	const on = count.getAttribute("aria-checked") === "true";
	const change = on
		? chrome.permissions.remove(ACCESS).then((removed) => !removed)
		: chrome.permissions.request(ACCESS);
	void change
		.then((now) => {
			paintSwitch(count, now);
			if (now && counted) void badge(...counted).catch(() => {});
		})
		.catch(() => {});
});

void counting().then((on) => paintSwitch(count, on));

async function run() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const url = tab?.url ? new URL(tab.url) : null;
	if (!url || !/^https?:$/.test(url.protocol)) {
		status.textContent = "Open a website to see what it's built with.";
		return;
	}
	const hostname = url.hostname.replace(/^www\./, "");
	$("host").textContent = hostname;

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
		status.textContent = "This browser doesn't let extensions read this page.";
		return;
	}

	const all = detect(page, technologies, categories);
	// keep the icon's count in step with the list
	counted = [tab.id, all.length];
	if (await counting()) void badge(...counted).catch(() => {});
	if (all.length === 0) {
		status.textContent = "No known technology found on this page.";
		return;
	}
	show(all, hostname);
}

void run();
