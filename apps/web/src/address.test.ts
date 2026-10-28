import { expect, it } from "vite-plus/test";
import { toAddress } from "./address";

it("takes a full address", () => {
	expect(toAddress("https://renildo.dev/")).toBe("https://renildo.dev/");
	expect(toAddress("http://example.com/path?q=1")).toBe(
		"http://example.com/path?q=1",
	);
});

it("adds https to a bare host", () => {
	expect(toAddress("renildo.dev")).toBe("https://renildo.dev");
	expect(toAddress("www.example.com/docs")).toBe(
		"https://www.example.com/docs",
	);
	expect(toAddress("  renildo.dev  ")).toBe("https://renildo.dev");
});

it("refuses what is not a web address", () => {
	expect(toAddress("")).toBeNull();
	expect(toAddress("   ")).toBeNull();
	expect(toAddress("hello world")).toBeNull();
	expect(toAddress("ftp://example.com")).toBeNull();
	expect(toAddress("https://")).toBeNull();
	expect(toAddress("https://https://renildo.dev/")).toBeNull();
});
