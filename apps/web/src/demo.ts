export interface Evidence {
	kind: string;
	text: string;
	value?: string;
}

export interface Found {
	id: string;
	name: string;
	version?: string;
	category: string;
	website: string;
	icon: string;
	implies: string[];
	evidence: Evidence[];
}
