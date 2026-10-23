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

// Yumma UI's recipes, so the popup reads as part of the same kit as the site:
// the theme switcher's picked item, the switch's track and thumb when on.
const FOCUS = "fv:os:s fv:ow:3 fv:oo:0 fv:oc:focus/40 fv:bc:focus";
const RAISED = "bg:raised btc:rim blc:rim brc:rim bbc:shadow bs-o:xs";
const ON = "bg:on btc:white/25 blc:black/15 brc:black/15 bbc:black/30 bs-o:sm";
const KNOB = "bg:knob btc:white blc:black/10 brc:black/10 bbc:black/20 bs-o:sm";

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
		letter.className = "fs:sm fw:600 c:hint";
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
	link.setAttribute("aria-label", `${label(tech)}, ${tech.category}`);
	link.className = `d:f ai:c fs:0 h:9 w:9 o:h br:9999 bw:1 ${RAISED} td:none tp:a tdu:300 ttf:out-quart o:100 s:100 @st:o:0 @st:s:75 @prm:tp:none ${FOCUS} ${delays[Math.min(index, delays.length - 1)]}`;

	const disc = document.createElement("span");
	disc.className =
		"d:f ai:c jc:c fs:0 w:8 h:8 br:9999 bw:1 bc:transparent tp:a tdu:300 ttf:out-quart @prm:tp:none";
	disc.append(icon(tech, "d:b w:4 h:4 of:c"));

	const text = document.createElement("span");
	text.className = "d:f ai:b g:2 pl:2 pr:3 ws:nw o:0 tp:o tdu:300 @prm:tp:none";
	const name = document.createElement("span");
	name.className = "fs:sm fw:600 c:white";
	name.textContent = tech.name;
	text.append(name);
	if (tech.version) {
		const version = document.createElement("span");
		version.className = "fs:xs ff:m c:white/80";
		version.textContent = tech.version;
		text.append(version);
	}

	link.append(disc, text);
	link.activate = (on) => {
		swap(link, RAISED, !on);
		swap(link, `${ON} pl:0.5`, on);
		swap(disc, KNOB, on);
		swap(disc, "bc:transparent", !on);
		swap(link, "w:auto", on);
		swap(link, "w:9", !on);
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
	link.className = `d:f ai:c g:3 py:1 pl:1 pr:2 br:lg bw:1 bc:transparent c:label td:none tp:a tdu:150 ttf:io @prm:tp:none ${FOCUS}`;

	const badge = document.createElement("span");
	badge.className = `d:f ai:c jc:c fs:0 w:8 h:8 br:9999 bw:1 ${RAISED}`;
	badge.append(icon(tech, "d:b w:4 h:4 of:c"));

	const text = document.createElement("span");
	text.className = "d:f fd:c fg:1 min-w:0";
	const name = document.createElement("span");
	name.className = "fs:sm fw:500";
	name.textContent = tech.name;
	const detail = document.createElement("span");
	detail.className = "fs:xs c:hint";
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
			"d:f ai:c h:5 px:2 br:9999 bw:1 bc:transparent ff:m fs:xs c:hint";
		version.textContent = tech.version;
		link.append(version);
	}

	item.append(link);
	item.activate = (on) => {
		swap(link, RAISED, on);
		swap(link, "bc:transparent", !on);
		if (!version) return;
		swap(version, `${ON} c:white`, on);
		swap(version, "bc:transparent c:hint", !on);
	};
	return item;
}

function message(text) {
	const span = document.createElement("span");
	span.className = "px:4 py:2 fs:sm c:hint ws:nw";
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
	const track = document.getElementById("track");
	const padding = main.offsetWidth - main.clientWidth + 32;
	main.style.setProperty(
		"--popup-width",
		`${track.offsetWidth + widest + padding}px`,
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
