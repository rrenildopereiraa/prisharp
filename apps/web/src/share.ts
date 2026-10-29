import { hostOf, toAddress } from "@/address";

const PARAM = "site";

export function siteIn(search: string): string | null {
	const value = new URLSearchParams(search).get(PARAM);
	return value ? toAddress(value) : null;
}

export function rememberSite(address: string) {
	const url = new URL(location.href);
	url.searchParams.set(PARAM, hostOf(address));
	history.replaceState(null, "", url);
}
