import { collect } from "./collect.js";
import { detect, probes } from "./detect.js";
import { icons } from "./icons.js";
import { categories, technologies } from "./technologies.js";

const pill = document.getElementById("pill");
const divider = document.getElementById("divider");
const toggle = document.getElementById("toggle");
const chevron = document.getElementById("chevron");
const stack = document.getElementById("stack");
const list = document.getElementById("list");
const summary = document.getElementById("summary");
const main = document.getElementById("main");
const copy = document.getElementById("copy");

const label = (tech) => [tech.name, tech.version].filter(Boolean).join(" ");

const swap = (element, classes, on) => {
	for (const name of classes.split(" ")) element.classList.toggle(name, on);
};

// The knobs press in one after another as the popup opens. Classes built at
// runtime never reach the CSS, so the delays are written out.
const delays = [
	"td:0",
	"td:50",
	"td:100",
	"td:150",
	"td:200",
	"td:250",
	"td:300",
];

// The svgl logo when Prisharp ships one, the site's favicon when it does not,
// and the first letter when neither loads.
function icon(tech, classes) {
	const name = tech.icon ?? tech.id;
	const picture = document.createElement("picture");
	const img = document.createElement("img");
	img.className = classes;
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
		letter.className = "fs:sm fw:600 c:accent";
		letter.textContent = tech.name[0];
		picture.replaceWith(letter);
	});

	picture.append(img);
	return picture;
}

// A knob in the track. Active, it grows into the capsule with the name and
// version.
function knob(tech, index) {
	const link = document.createElement("a");
	link.href = tech.website;
	link.target = "_blank";
	link.rel = "noreferrer";
	link.dataset.material = "knob";
	link.setAttribute("aria-label", `${label(tech)}, ${tech.category}`);
	link.className = `d:f ai:c fs:0 h:10 w:10 o:h br:9999 b:1 bc:knob-edge bs-o:var(--shadow-knob) td:none tp:a tdu:300 ttf:io o:100 s:100 @st:o:0 @st:s:75 @prm:tp:none fv:os:s fv:ow:2 fv:oo:2 fv:oc:glow ${delays[Math.min(index, delays.length - 1)]}`;

	const disc = document.createElement("span");
	disc.className =
		"d:f ai:c jc:c fs:0 w:9 h:9 br:9999 tp:a tdu:300 ttf:io @prm:tp:none";
	disc.append(icon(tech, "d:b w:5 h:5 of:c"));

	const text = document.createElement("span");
	text.className = "d:f ai:b g:2 pl:2 pr:4 ws:nw o:0 tp:o tdu:300 @prm:tp:none";
	const name = document.createElement("span");
	name.className = "fs:sm fw:600 c:capsule-ink";
	name.textContent = tech.name;
	text.append(name);
	if (tech.version) {
		const version = document.createElement("span");
		version.className = "fs:xs ff:m c:capsule-ink-dim";
		version.textContent = tech.version;
		text.append(version);
	}

	link.append(disc, text);
	link.activate = (on) => {
		link.dataset.material = on ? "capsule" : "knob";
		disc.dataset.material = on ? "disc" : "";
		swap(link, "bc:knob-edge bs-o:var(--shadow-knob)", !on);
		swap(link, "bc:capsule-edge bs-o:var(--shadow-capsule) pl:0.5", on);
		swap(disc, "w:8 h:8 bs-o:var(--shadow-disc)", on);
		swap(disc, "w:9 h:9", !on);
		swap(link, "w:auto", on);
		swap(link, "w:10", !on);
		swap(text, "o:100", on);
		swap(text, "o:0", !on);
	};
	return link;
}

// A row in the opened stack. Active, it rises out of the well.
function row(tech, found) {
	const item = document.createElement("li");
	const link = document.createElement("a");
	link.href = tech.website;
	link.target = "_blank";
	link.rel = "noreferrer";
	link.className =
		"d:f ai:c g:3 py:1 pl:1 pr:3 br:xxl c:ink td:none tp:a tdu:200 ttf:eo @prm:tp:none fv:os:s fv:ow:2 fv:oo:-2 fv:oc:glow";

	const badge = document.createElement("span");
	badge.dataset.material = "knob";
	badge.className =
		"d:f ai:c jc:c fs:0 w:9 h:9 br:9999 b:1 bc:knob-edge bs-o:var(--shadow-knob)";
	badge.append(icon(tech, "d:b w:5 h:5 of:c"));

	const text = document.createElement("span");
	text.className = "d:f fd:c fg:1 min-w:0";
	const name = document.createElement("span");
	name.className = "fs:sm fw:500";
	name.textContent = tech.name;
	const detail = document.createElement("span");
	detail.className = "fs:xs c:ink-dim";
	const implied = (tech.implies ?? [])
		.map((id) => found.find((other) => other.id === id)?.name)
		.filter(Boolean);
	detail.textContent = [
		tech.category,
		implied.length > 0 && `implies ${implied.join(", ")}`,
	]
		.filter(Boolean)
		.join(" · ");
	text.append(name, detail);
	link.append(badge, text);

	let version;
	if (tech.version) {
		version = document.createElement("span");
		version.className =
			"d:f ai:c h:6 px:2 br:9999 b:1 bc:transparent ff:m fs:xs c:ink-dim";
		version.textContent = tech.version;
		link.append(version);
	}

	item.append(link);
	item.activate = (on) => {
		link.dataset.material = on ? "tile" : "";
		swap(link, "bs-o:var(--shadow-tile) fw:600", on);
		if (!version) return;
		version.dataset.material = on ? "capsule" : "";
		swap(
			version,
			"bc:capsule-edge bs-o:var(--shadow-capsule) c:capsule-ink fw:500",
			on,
		);
		swap(version, "bc:transparent c:ink-dim", !on);
	};
	return item;
}

function message(text) {
	const span = document.createElement("span");
	span.className = "px:4 py:2 fs:sm c:ink-dim ws:nw";
	span.textContent = text;
	pill.replaceChildren(span);
	pill.setAttribute("aria-busy", "false");
}

function show(found, host) {
	const knobs = found.map(knob);
	const rows = found.map((tech) => row(tech, found));

	// Hovering or focusing a tech, in the pill or the list, lights it in both.
	let active = -1;
	const activate = (index) => {
		if (index === active) return;
		knobs[active]?.activate(false);
		rows[active]?.activate(false);
		active = index;
		knobs[active]?.activate(true);
		rows[active]?.activate(true);
	};
	for (const [index, element] of [
		...knobs.entries(),
		...rows.map((item, i) => [i, item.firstChild]),
	]) {
		element.addEventListener("mouseenter", () => activate(index));
		element.addEventListener("focus", () => activate(index));
		element.addEventListener("blur", () => activate(-1));
	}
	pill.addEventListener("mouseleave", () => activate(-1));
	list.addEventListener("mouseleave", () => activate(-1));

	pill.replaceChildren(...knobs);
	list.replaceChildren(...rows);
	pill.setAttribute("aria-busy", "false");
	summary.textContent = `${found.length} on ${host}`;
	divider.hidden = false;
	toggle.hidden = false;

	// Once the knobs have pressed in, hovering them should not wait.
	setTimeout(() => {
		for (const element of knobs) swap(element, delays.join(" "), false);
	}, 700);

	// The popup is as wide as its content, so a growing capsule would resize
	// the window on every hover. Hold room for the widest one.
	const widest = Math.max(
		...knobs.map((element) => element.lastChild.scrollWidth),
	);
	const rim = pill.closest('[data-material="rim"]');
	const padding = main.offsetWidth - main.clientWidth + 32;
	main.style.setProperty(
		"--popup-width",
		`${rim.offsetWidth + widest + padding}px`,
	);

	toggle.addEventListener("click", () => {
		const open = stack.inert;
		stack.inert = !open;
		swap(stack, "h:auto o:100", open);
		swap(stack, "h:0 o:0", !open);
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute(
			"aria-label",
			open ? "Hide the stack" : "Show the stack",
		);
		swap(chevron, "ro:36", open);
	});

	copy.addEventListener("click", async () => {
		await navigator.clipboard.writeText(found.map(label).join("\n"));
		copy.textContent = "Copied";
		setTimeout(() => {
			copy.textContent = "Copy stack";
		}, 1500);
	});
}

async function run() {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const url = tab?.url ? new URL(tab.url) : null;
	if (!url || !/^https?:$/.test(url.protocol)) {
		message("Open a website to see its stack");
		return;
	}

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
		message("This page can't be read");
		return;
	}

	const found = detect(page, technologies, categories);
	if (found.length === 0) {
		message(`Nothing detected on ${url.hostname}`);
		return;
	}
	show(found, url.hostname.replace(/^www\./, ""));
}

void run();
