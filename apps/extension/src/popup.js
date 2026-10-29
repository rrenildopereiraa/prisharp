import { collect } from "./collect.js";
import { detect, probes } from "./detect.js";
import { icons } from "./icons.js";
import { symbol } from "./symbols.js";
import { categories, technologies } from "./technologies.js";

const home = document.getElementById("home");
const host = document.getElementById("host");
const status = document.getElementById("status");
const found = document.getElementById("found");
const list = document.getElementById("list");
const copy = document.getElementById("copy");
const detail = document.getElementById("detail");
const back = document.getElementById("back");

// A row of the panel, the same for a technology, a link and an action.
const ROW =
	"d:f ai:c g:3 w:100% h:10 px:4 bw:0 bg:transparent c:ink ff:d fs:sm ta:l td:none c:p h:bg:hover fv:os:s fv:ow:2 fv:oo:-2 fv:oc:focus";

const label = (tech) => [tech.name, tech.version].filter(Boolean).join(" ");

for (const element of document.querySelectorAll("[data-symbol]")) {
	element.append(symbol(element.dataset.symbol, "d:b w:100% h:100%"));
}
for (const element of document.querySelectorAll("[data-row]")) {
	element.className = ROW;
}
for (const button of document.querySelectorAll("[data-close]")) {
	button.addEventListener("click", () => window.close());
}

// The svgl logo when Prisharp ships one, the site's favicon when it does not,
// and the first letter when neither loads.
// Each logo sits 2px inside its box, so the edges of the wide ones are not
// cut off where they meet it.
function icon(tech, size) {
	const name = tech.icon ?? tech.id;
	const picture = document.createElement("picture");
	const img = document.createElement("img");
	img.className = `d:b ${size} p:calc(0.125rem)`;
	img.dataset.logo = "";
	img.alt = "";
	img.decoding = "async";

	if (name in icons) {
		img.src = `icons/tech/${name}.svg`;
		if (icons[name]) {
			const dark = document.createElement("source");
			dark.media = "(prefers-color-scheme: dark)";
			dark.srcset = `icons/tech/${name}-dark.svg`;
			picture.append(dark);
		}
	} else {
		const { hostname } = new URL(tech.website);
		img.src = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
		img.classList.add("br:sm");
	}
	img.addEventListener("error", () => {
		const letter = document.createElement("span");
		letter.className = `${size} d:f ai:c jc:c fs:0 br:sm bg:well fs:xs fw:600 c:muted`;
		letter.textContent = tech.name[0];
		picture.replaceWith(letter);
	});

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
	const caption = button.querySelector(".fg\\:1");
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
	item.className = "d:f ai:fs g:2 py:2 px:4";

	const mark = document.createElement("span");
	mark.className = "d:f fs:0 w:4 h:4 mt:1 c:ok";
	mark.append(symbol("check", "d:b w:100% h:100%"));

	const body = document.createElement("span");
	body.className = "d:f fd:c g:1 fg:1 min-w:0";
	const code = document.createElement("code");
	code.className = "as:fs py:0 px:1 br:sm bg:well ff:m fs:xs wb:ba";
	code.textContent = text;
	const meta = document.createElement("span");
	meta.className = "fs:xs c:muted wb:ba";
	meta.textContent = value === undefined ? kind : `${kind} · ${value}`;
	body.append(code, meta);

	item.append(mark, body);
	return item;
}

function open(tech, all, row) {
	document.getElementById("name").textContent = tech.name;
	document.getElementById("badge").replaceChildren(icon(tech, "w:7 h:7"));
	const implied = brings(tech, all);
	document.getElementById("headline").textContent = tech.version
		? `Version ${tech.version}`
		: tech.category;
	document.getElementById("subline").textContent = [
		tech.version && tech.category,
		implied.length > 0 && `brings in ${implied.join(", ")}`,
	]
		.filter(Boolean)
		.join(" · ");
	document
		.getElementById("evidence")
		.replaceChildren(...tech.evidence.map(evidenceItem));

	const website = document.getElementById("website");
	website.href = tech.website;
	document.getElementById("website-label").textContent =
		`Open ${new URL(tech.website).hostname.replace(/^www\./, "")}`;

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

function row(tech, all) {
	const item = document.createElement("li");
	item.className = "d:b";
	const button = document.createElement("button");
	button.type = "button";
	button.className = ROW;
	button.setAttribute(
		"aria-label",
		`${label(tech)}, ${tech.category}. Show the evidence`,
	);

	const name = document.createElement("span");
	name.className = "fg:1 min-w:0 o:h to:e ws:nw";
	name.textContent = tech.name;
	const meta = document.createElement("span");
	meta.className = "fs:xs c:muted ws:nw fvn:tn";
	meta.textContent = tech.version ?? tech.category;
	const chevron = document.createElement("span");
	chevron.className = "d:f fs:0 w:4 h:4 c:muted";
	chevron.append(symbol("chevron_right", "d:b w:100% h:100%"));

	button.append(icon(tech, "w:5 h:5"), name, meta, chevron);
	button.addEventListener("click", () => open(tech, all, button));
	item.append(button);
	return item;
}

function show(all, hostname) {
	host.textContent = hostname;
	status.textContent =
		all.length === 1
			? "Built with 1 technology"
			: `Built with ${all.length} technologies`;
	morph(() => {
		list.replaceChildren(...all.map((tech) => row(tech, all)));
		found.hidden = false;
		copy.hidden = false;
	});
	copy.addEventListener("click", () => copied(copy, all.map(label).join("\n")));
}

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
		status.textContent = "Chrome doesn't let extensions read this page.";
		return;
	}

	const all = detect(page, technologies, categories);
	if (all.length === 0) {
		status.textContent = "No known technology found on this page.";
		return;
	}
	show(all, hostname);
}

void run();
