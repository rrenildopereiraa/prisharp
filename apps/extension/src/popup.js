import { ACCESS, counting, show as badge } from "./badge.js";
import { collect } from "./collect.js";
import { detect, probes } from "./detect.js";
import { icons } from "./icons.js";
import { markdown } from "./markdown.js";
import { symbol } from "./symbols.js";
import { categories, technologies } from "./technologies.js";

const home = document.getElementById("home");
const host = document.getElementById("host");
const status = document.getElementById("status");
const found = document.getElementById("found");
const copies = document.getElementById("copies");
const copy = document.getElementById("copy");
const copyMarkdown = document.getElementById("copy-markdown");
const detail = document.getElementById("detail");
const back = document.getElementById("back");
const count = document.getElementById("count");
const countTrack = document.getElementById("count-track");
const countKnob = document.getElementById("count-knob");

// A row of the panel, the same for a technology, a link and a setting.
const ROW =
	"d:f ai:c g:3 w:100% h:9 px:4 bw:0 bg:transparent c:label ff:mono fs:sm ta:l td:none c:p h:bg:paper fv:os:s fv:ow:2 fv:oo:-2 fv:oc:focus";

// prisharp.com's secondary button: a raised key with a thin rim.
const BUTTON =
	"d:f ai:c jc:c g:2 h:9 px:3 bw:1 bc:rim bg:raised bs-o:key c:label ff:mono fs:xs ws:nw c:p h:bg:well a:s:98 tp:a tdu:150 @prm:tp:none fv:os:s fv:ow:2 fv:oo:2 fv:oc:focus";

// A square button with only an icon, such as Back and Close.
const ICON =
	"d:f ai:c jc:c fs:0 w:8 h:8 bw:0 bg:transparent c:hint c:p h:bg:paper h:c:label fv:os:s fv:ow:2 fv:oc:focus";

// A version, set apart from the name in the accent.
const VERSION = "fs:0 py:0 px:1 bw:1 bc:accent/40 c:accent fs:xs lh:4 ws:nw";

const hostOf = (url) => new URL(url).hostname.replace(/^www\./, "");

const label = (tech) => [tech.name, tech.version].filter(Boolean).join(" ");

for (const element of document.querySelectorAll("[data-symbol]")) {
	element.append(symbol(element.dataset.symbol, "d:b w:100% h:100%"));
}
for (const element of document.querySelectorAll("[data-row]")) {
	element.className = ROW;
}
for (const element of document.querySelectorAll("[data-button]")) {
	element.className = `${BUTTON} ${element.className}`.trim();
}
for (const element of document.querySelectorAll("[data-icon]")) {
	element.className = ICON;
}
for (const button of document.querySelectorAll("[data-close]")) {
	button.addEventListener("click", () => window.close());
}

// The logo Prisharp ships for the technology, and its first letter when it
// has none or the logo fails to load. Logos come from the extension itself,
// so the popup asks no other server for them.
// Each logo sits 2px inside its box, so the edges of the wide ones are not
// cut off where they meet it.
function icon(tech, size) {
	const name = tech.icon ?? tech.id;
	const letter = () => {
		const span = document.createElement("span");
		span.className = `${size} d:f ai:c jc:c fs:0 bg:well ff:sans fs:md c:hint`;
		span.textContent = tech.name[0];
		return span;
	};
	if (!(name in icons)) return letter();

	const picture = document.createElement("picture");
	const img = document.createElement("img");
	img.className = `d:b ${size} p:calc(0.125rem)`;
	img.dataset.logo = "";
	img.alt = "";
	img.decoding = "async";
	img.src = `icons/tech/${name}.svg`;
	if (icons[name]) {
		const dark = document.createElement("source");
		dark.media = "(prefers-color-scheme: dark)";
		dark.srcset = `icons/tech/${name}-dark.svg`;
		picture.append(dark);
	}
	img.addEventListener("error", () => picture.replaceWith(letter()));

	picture.className = "d:f ai:c jc:c fs:0";
	picture.append(img);
	return picture;
}

const EASE = "cubic-bezier(0.2, 0, 0, 1)";
const still = matchMedia("(prefers-reduced-motion: reduce)");
const main = document.querySelector("main");

// Changes what the popup shows, then eases its height from the old size to
// the new one and slides the new view in. Chrome sizes the popup to its
// content, so the window follows. Nothing moves under reduced motion.
function morph(change, from = "translateY(4px)") {
	const before = main.getBoundingClientRect().height;
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
	(home.hidden ? detail : home).animate(
		[
			{ opacity: 0, transform: from },
			{ opacity: 1, transform: "none" },
		],
		{ duration: 220, easing: EASE },
	);
}

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

// What a technology brings in, among what was found: "brings in React".
const brings = (tech, all) =>
	(tech.implies ?? [])
		.map((id) => all.find((other) => other.id === id)?.name)
		.filter(Boolean);

function evidenceItem({ kind, text, value }) {
	const item = document.createElement("li");
	item.className = "d:f ai:fs g:3 py:2 px:4";

	const mark = document.createElement("span");
	mark.className = "d:f fs:0 w:4 h:4 mt:1 c:accent";
	mark.append(symbol("check", "d:b w:100% h:100%"));

	const body = document.createElement("span");
	body.className = "d:f fd:c g:1 fg:1 min-w:0";
	const code = document.createElement("code");
	code.className = "as:fs py:0 px:1 bg:well ff:mono fs:xs wb:ba";
	code.textContent = text;
	const meta = document.createElement("span");
	meta.className = "fs:xs c:hint wb:ba";
	meta.textContent = value === undefined ? kind : `${kind} · ${value}`;
	body.append(code, meta);

	item.append(mark, body);
	return item;
}

function open(tech, all, row) {
	document.getElementById("name").textContent = tech.name;
	document.getElementById("category").textContent = tech.category;
	document.getElementById("badge").replaceChildren(icon(tech, "w:8 h:8"));

	const version = document.getElementById("version");
	version.hidden = !tech.version;
	version.className = VERSION;
	version.textContent = tech.version ?? "";
	version.setAttribute("aria-label", `Version ${tech.version}`);

	const implied = brings(tech, all);
	const bringsIn = document.getElementById("brings");
	bringsIn.hidden = implied.length === 0;
	bringsIn.textContent = `Brings in ${implied.join(", ")}`;

	document.getElementById("evidence-count").textContent = String(
		tech.evidence.length,
	);
	document
		.getElementById("evidence")
		.replaceChildren(...tech.evidence.map(evidenceItem));

	const website = document.getElementById("website");
	website.href = tech.website;
	document.getElementById("website-label").textContent = hostOf(tech.website);
	website.setAttribute("aria-label", `Open ${hostOf(tech.website)}`);

	const copyEvidence = document.getElementById("copy-evidence");
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

	// Back, or Escape, returns to the row it came from.
	const close = () => {
		morph(() => {
			detail.hidden = true;
			home.hidden = false;
		}, "translateX(-16px)");
		document.removeEventListener("keydown", escape);
		row.focus();
	};
	const escape = (event) => {
		if (event.key !== "Escape") return;
		event.preventDefault();
		close();
	};
	back.onclick = close;
	document.addEventListener("keydown", escape);

	morph(() => {
		home.hidden = true;
		detail.hidden = false;
	}, "translateX(16px)");
	back.focus();
}

// A technology's row opens its evidence. On hover or focus, a link to its
// site shows by the chevron, so the row is quiet at rest and the site is one
// click away.
const VISIT =
	"p:a t:1 r:9 d:f ai:c jc:c w:8 h:8 bg:paper c:hint td:none h:c:accent fv:os:s fv:ow:2 fv:oc:focus";

function row(tech, all) {
	const item = document.createElement("li");
	item.className = "p:r d:b h:bg:paper fw:bg:paper";
	item.dataset.tech = "";

	const button = document.createElement("button");
	button.type = "button";
	button.className = ROW.replace(" h:bg:paper", "");
	button.setAttribute(
		"aria-label",
		`${label(tech)}, ${tech.category}. Show the evidence`,
	);

	const name = document.createElement("span");
	name.className = "min-w:0 o:h to:e ws:nw";
	name.textContent = tech.name;
	const spacer = document.createElement("span");
	spacer.className = "fg:1";
	const chevron = document.createElement("span");
	chevron.className = "d:f fs:0 w:4 h:4 c:hint";
	chevron.append(symbol("chevron", "d:b w:100% h:100%"));

	const parts = [icon(tech, "w:5 h:5"), name];
	if (tech.version) {
		const version = document.createElement("span");
		version.className = VERSION;
		version.textContent = tech.version;
		parts.push(version);
	}
	button.append(...parts, spacer, chevron);
	button.addEventListener("click", () => open(tech, all, button));

	const site = hostOf(tech.website);
	const visit = document.createElement("a");
	visit.href = tech.website;
	visit.target = "_blank";
	visit.rel = "noreferrer";
	visit.className = VISIT;
	visit.dataset.visit = "";
	visit.title = `Open ${site}`;
	visit.setAttribute("aria-label", `Open ${site}`);
	visit.append(symbol("external", "d:b w:4 h:4"));

	item.append(button, visit);
	return item;
}

// The technologies in groups, one per category, in the order detect() sorts
// them: frameworks first, then libraries, styling, hosting and the rest.
function groups(all) {
	const byCategory = Map.groupBy(all, (tech) => tech.category);
	return [...byCategory].map(([category, techs], index) => {
		const section = document.createElement("section");
		const id = `group-${index}`;
		section.setAttribute("aria-labelledby", id);

		const heading = document.createElement("h2");
		heading.id = id;
		heading.className = "d:f jc:sb m:0 pt:2 pb:1 px:4 fs:xs fw:400 c:hint";
		const title = document.createElement("span");
		title.textContent = category;
		const amount = document.createElement("span");
		amount.textContent = String(techs.length);
		amount.setAttribute("aria-hidden", "true");
		heading.append(title, amount);

		const list = document.createElement("ul");
		list.className = "m:0 p:0";
		list.append(...techs.map((tech) => row(tech, all)));

		section.append(heading, list);
		return section;
	});
}

function show(all, hostname) {
	host.textContent = hostname;
	// "Built with 7 technologies", the number in the accent
	const number = document.createElement("span");
	number.className = "c:accent fw:600";
	number.textContent = String(all.length);
	status.replaceChildren(
		"Built with ",
		number,
		all.length === 1 ? " technology" : " technologies",
	);
	morph(() => {
		found.replaceChildren(...groups(all));
		found.hidden = false;
		copies.hidden = false;
	});
	copy.addEventListener("click", () => copied(copy, all.map(label).join("\n")));
	copyMarkdown.addEventListener("click", () =>
		copied(copyMarkdown, markdown(hostname, all)),
	);
}

// The switch for the count on the toolbar icon. It is on while Prisharp
// holds access to every site, so it shows the browser's own record.
function paint(on) {
	count.setAttribute("aria-checked", String(on));
	countTrack.className = countTrack.className
		.replace(/ jc:\S+/, on ? " jc:fe" : " jc:fs")
		.replace(/ bc:\S+/, on ? " bc:accent" : " bc:rim")
		.replace(/ bg:\S+/, on ? " bg:accent" : " bg:well");
	countKnob.className = countKnob.className.replace(
		/ bg:\S+/,
		on ? " bg:on-fill" : " bg:hint",
	);
}

// The tab the popup read, and how many technologies it found, so turning the
// count on shows it on this tab straight away.
let counted;

count.addEventListener("click", () => {
	// Firefox only asks for access straight from the click, before any wait
	const on = count.getAttribute("aria-checked") === "true";
	const change = on
		? chrome.permissions.remove(ACCESS).then((removed) => !removed)
		: chrome.permissions.request(ACCESS);
	void change
		.then((now) => {
			paint(now);
			if (now && counted) void badge(...counted).catch(() => {});
		})
		.catch(() => {});
});

void counting().then(paint);

async function run() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const url = tab?.url ? new URL(tab.url) : null;
	if (!url || !/^https?:$/.test(url.protocol)) {
		status.textContent = "Open a website to see what it's built with.";
		return;
	}
	const hostname = url.hostname.replace(/^www\./, "");
	host.textContent = hostname;

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
