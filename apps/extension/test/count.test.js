import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vite-plus/test";
import { badge } from "../src/badge.js";
import { firefox } from "../scripts/firefox.mjs";

const manifest = JSON.parse(
	readFileSync(new URL("../manifest.json", import.meta.url), "utf8"),
);

test("the count is off until asked for: site access is optional only", () => {
	assert.equal(manifest.host_permissions, undefined);
	assert.deepEqual(manifest.optional_host_permissions, ["<all_urls>"]);
	assert.ok(!manifest.permissions.includes("tabs"));
});

test("the badge shows the count, and nothing when none was found", () => {
	assert.equal(badge(0), "");
	assert.equal(badge(7), "7");
	assert.equal(badge(99), "99");
	assert.equal(badge(140), "99+");
});

test("Firefox keeps the count in a background script of its own", () => {
	const gecko = firefox(manifest);
	assert.deepEqual(gecko.background, {
		scripts: ["src/count.js"],
		type: "module",
	});
	assert.deepEqual(gecko.optional_host_permissions, ["<all_urls>"]);
	assert.ok(!gecko.permissions.includes("offscreen"));
});
