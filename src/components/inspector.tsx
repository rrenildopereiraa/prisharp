import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Select } from "@base-ui/react/select";
import { Separator } from "@base-ui/react/separator";
import { Switch } from "@base-ui/react/switch";
import { Tabs } from "@base-ui/react/tabs";
import { CaretDownIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useHaptics } from "../lib/haptics";
import { THEMES } from "../lib/highlighter";
import { ColorInput } from "./color-input";
import type { FrameColors } from "./frame";
import type { Background } from "./toolbar";

export type FontId =
	| "default"
	| "jetbrains-mono"
	| "fira-code"
	| "ibm-plex-mono";

export const FONTS: Record<FontId, { label: string; stack?: string }> = {
	default: { label: "Default" },
	"jetbrains-mono": {
		label: "JetBrains Mono",
		stack: '"JetBrains Mono", monospace',
	},
	"fira-code": { label: "Fira Code", stack: '"Fira Code", monospace' },
	"ibm-plex-mono": {
		label: "IBM Plex Mono",
		stack: '"IBM Plex Mono", monospace',
	},
};

export interface CornerRadii {
	tl: number;
	tr: number;
	bl: number;
	br: number;
}

type CornerScope = "all" | keyof CornerRadii;

const CORNER_TABS: { id: CornerScope; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "tl", label: "TL" },
	{ id: "tr", label: "TR" },
	{ id: "bl", label: "BL" },
	{ id: "br", label: "BR" },
];

function RadiusControl({
	radii,
	onRadiiChange,
}: {
	radii: CornerRadii;
	onRadiiChange: (value: CornerRadii) => void;
}) {
	const [scope, setScope] = useState<CornerScope>("all");
	const current = scope === "all" ? radii.tl : radii[scope];
	const { trigger: haptic } = useHaptics();

	function apply(value: number) {
		if (scope === "all") {
			onRadiiChange({ tl: value, tr: value, bl: value, br: value });
		} else {
			onRadiiChange({ ...radii, [scope]: value });
		}
		haptic("success");
	}

	return (
		<div className="d-f fd-c g-1 px-2 pt-1 pb-4">
			<span className="fs-sm ff-m c-accent-dim us-none">Border radius</span>
			<Tabs.Root
				value={scope}
				onValueChange={(value) => setScope(value as CornerScope)}
				className="bw-1 bs-s bc-border br-3xl"
			>
				<Tabs.List className="d-f p-r g-1 p-1">
					{CORNER_TABS.map(({ id, label }) => (
						<Tabs.Tab
							key={id}
							value={id}
							className={(state) =>
								`p-r zi-10 f-1 px-1 py-1 fs-xs ff-m ta-c us-none c-p bw-0 br-xxl fv:os-s fv:oo--2 fv:oc-accent ${state.active ? "c-page bg-accent fw-700" : "c-accent-dim bg-transparent h:bg-page"}`
							}
						>
							{label}
						</Tabs.Tab>
					))}
					<Tabs.Indicator
						className="p-a l-0 zi-0 bg-accent br-xxl bs-o-xs"
						style={{
							translate: "var(--active-tab-left) 0",
							width: "var(--active-tab-width)",
							top: "var(--active-tab-top)",
							height: "var(--active-tab-height)",
						}}
					/>
				</Tabs.List>
			</Tabs.Root>
			<div className="d-f ai-c g-2 px-2 pt-1">
				<Input
					type="number"
					value={current}
					min={0}
					max={16}
					step={1}
					onChange={(event) => {
						const v = Number.parseInt(event.target.value, 10);
						if (!Number.isNaN(v) && v >= 0 && v <= 16) apply(v);
					}}
					className="ff-m fs-xs c-accent-dim bg-transparent bw-1 bs-s bc-border br-xxl px-2 py-1 w-100% ta-c"
				/>
			</div>
		</div>
	);
}

function SectionSeparator({ label }: { label: string }) {
	return (
		<div className="d-f ai-c g-2 pb-2">
			<Separator orientation="horizontal" className="w-3 h-px bg-border" />
			<span className="fs-xs ff-m c-accent-dim us-none ws-nw">{label}</span>
			<Separator orientation="horizontal" className="f-1 h-px bg-border" />
		</div>
	);
}

function OptionSwitch({
	label,
	checked,
	onCheckedChange,
}: {
	label: string;
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
}) {
	const { trigger: haptic } = useHaptics();

	return (
		<div className="d-f ai-c jc-sb g-2 px-2 pb-3">
			<span className="fs-sm ff-m c-accent-dim us-none">{label}</span>
			<Switch.Root
				checked={checked}
				onCheckedChange={(value) => {
					onCheckedChange(value);
					haptic("success");
				}}
				className={`p-r d-f ai-c h-5 w-9 m-0 px-1 bw-1 bs-s c-p br-xxl fv:os-s fv:oo-2 fv:oc-accent ${
					checked ? "bg-accent bc-accent" : "bg-page bc-border"
				}`}
			>
				<Switch.Thumb
					className={`w-4 h-3 br-xxl bs-o-xs ${checked ? "bg-page ml-3" : "bg-accent-dim ml-0"}`}
				/>
			</Switch.Root>
		</div>
	);
}

function ThemePicker({
	value,
	onValueChange,
}: {
	value: string;
	onValueChange: (value: string) => void;
}) {
	const { trigger: haptic } = useHaptics();

	return (
		<Select.Root
			value={value}
			onValueChange={(next) => {
				if (next) {
					onValueChange(next);
					haptic("success");
				}
			}}
		>
			<Select.Trigger className="d-f ai-c jc-sb g-1 w-100% px-2 py-1 c-accent-dim fs-sm ff-m us-none c-p bw-1 bs-s bc-border br-xxl fv:os-s fv:oo-2 fv:oc-accent h:bg-page">
				<Select.Value>
					{() => <span className="min-w-0 o-h to-e ws-nw">{value}</span>}
				</Select.Value>
				<Select.Icon className="d-f c-accent-dim">
					<CaretDownIcon size={12} weight="fill" />
				</Select.Icon>
			</Select.Trigger>
			<Select.Portal>
				<Select.Positioner
					sideOffset={8}
					alignItemWithTrigger={false}
					className="zi-90 p-0 ow-0 us-none"
				>
					<Select.Popup className="w-48 bw-1 bc-border bg-surface br-xl py-1 bs-o-xs">
						<Select.List>
							{(Object.keys(THEMES) as (keyof typeof THEMES)[]).map((id) => (
								<Select.Item
									key={id}
									value={id}
									className={(state) =>
										`d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p ${state.highlighted ? "bg-page c-accent" : "c-accent-dim"}`
									}
								>
									<Select.ItemText>{id}</Select.ItemText>
								</Select.Item>
							))}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}

export function Inspector({
	showTabBar,
	onShowTabBarChange,
	showStatusBar,
	onShowStatusBarChange,
	showGridLines,
	onShowGridLinesChange,
	showBoundingBox,
	onShowBoundingBoxChange,
	showActiveTabBorder,
	onShowActiveTabBorderChange,
	background,
	onBackgroundChange,
	radii,
	onRadiiChange,
	font,
	onFontChange,
	themeName,
	onThemeChange,
	frameColors,
	onFrameColorsChange,
	onUploadTheme,
}: {
	showTabBar: boolean;
	onShowTabBarChange: (value: boolean) => void;
	showStatusBar: boolean;
	onShowStatusBarChange: (value: boolean) => void;
	showGridLines: boolean;
	onShowGridLinesChange: (value: boolean) => void;
	showBoundingBox: boolean;
	onShowBoundingBoxChange: (value: boolean) => void;
	showActiveTabBorder: boolean;
	onShowActiveTabBorderChange: (value: boolean) => void;
	background: Background;
	onBackgroundChange: (value: Background) => void;
	radii: CornerRadii;
	onRadiiChange: (value: CornerRadii) => void;
	font: FontId;
	onFontChange: (value: FontId) => void;
	themeName: string;
	onThemeChange: (value: string) => void;
	frameColors: FrameColors;
	onFrameColorsChange: (value: FrameColors) => void;
	onUploadTheme: (file: File) => void;
}) {
	const { trigger: haptic } = useHaptics();

	return (
		<aside className="d-none @lg:d-f fd-c w-72 fs-0 m-4 bw-1 bs-s bc-border bg-surface br-xl bs-o-lg p-3">
			<SectionSeparator label="Frame" />

			<OptionSwitch
				label="Tab bar"
				checked={showTabBar}
				onCheckedChange={onShowTabBarChange}
			/>
			<OptionSwitch
				label="Status bar"
				checked={showStatusBar}
				onCheckedChange={onShowStatusBarChange}
			/>
			<OptionSwitch
				label="Bounding box"
				checked={showBoundingBox}
				onCheckedChange={onShowBoundingBoxChange}
			/>

			<RadiusControl radii={radii} onRadiiChange={onRadiiChange} />

			<OptionSwitch
				label="Tab border"
				checked={showActiveTabBorder}
				onCheckedChange={onShowActiveTabBorderChange}
			/>
			{showActiveTabBorder && (
				<ColorInput
					label="Tab border"
					value={frameColors.activeTabBorder}
					onChange={(activeTabBorder) =>
						onFrameColorsChange({ ...frameColors, activeTabBorder })
					}
				/>
			)}

			<div className="d-f fd-c g-1 px-2 pb-4">
				<span className="fs-sm ff-m c-accent-dim us-none">Font</span>
				<Tabs.Root
					value={font}
					onValueChange={(value) => {
						onFontChange(value as FontId);
						haptic("success");
					}}
					className="bw-1 bs-s bc-border br-3xl"
				>
					<Tabs.List className="d-f p-r g-1 p-1">
						{(Object.keys(FONTS) as FontId[]).map((id) => (
							<Tabs.Tab
								key={id}
								value={id}
								title={FONTS[id].label}
								style={
									FONTS[id].stack ? { fontFamily: FONTS[id].stack } : undefined
								}
								className={`p-r zi-10 f-1 px-1 py-1 fs-xs ff-m ta-c us-none c-p bw-0 br-xxl fv:os-s fv:oo--2 fv:oc-accent ${font === id ? "c-page bg-accent fw-700" : "c-accent-dim bg-transparent h:bg-page"}`}
							>
								Aa
							</Tabs.Tab>
						))}
						<Tabs.Indicator
							className="p-a l-0 zi-0 bg-accent br-xxl bs-o-xs"
							style={{
								translate: "var(--active-tab-left) 0",
								width: "var(--active-tab-width)",
								top: "var(--active-tab-top)",
								height: "var(--active-tab-height)",
							}}
						/>
					</Tabs.List>
				</Tabs.Root>
			</div>

			<SectionSeparator label="Background" />

			<OptionSwitch
				label="Grid lines"
				checked={showGridLines}
				onCheckedChange={onShowGridLinesChange}
			/>

			<div className="px-2 pb-4">
				<Tabs.Root
					value={background}
					onValueChange={(value) => {
						const next = value as Background | undefined;
						if (next) {
							onBackgroundChange(next);
							haptic("success");
						}
					}}
					className="bw-1 bs-s bc-border br-3xl"
				>
					<Tabs.List className="d-f p-r g-1 p-1">
						<Tabs.Tab
							value="stripes"
							className={`p-r zi-10 f-1 px-2 py-1 fs-xs ff-m ta-c us-none c-p bw-0 br-xxl fv:os-s fv:oo--2 fv:oc-accent ${background === "stripes" ? "c-page bg-accent fw-700" : "c-accent-dim bg-transparent h:bg-page"}`}
						>
							Stripes
						</Tabs.Tab>
						<Tabs.Tab
							value="solid"
							className={`p-r zi-10 f-1 px-2 py-1 fs-xs ff-m ta-c us-none c-p bw-0 br-xxl fv:os-s fv:oo--2 fv:oc-accent ${background === "solid" ? "c-page bg-accent fw-700" : "c-accent-dim bg-transparent h:bg-page"}`}
						>
							Solid
						</Tabs.Tab>
						<Tabs.Indicator
							className="p-a l-0 zi-0 bg-accent br-xxl bs-o-xs"
							style={{
								translate: "var(--active-tab-left) 0",
								width: "var(--active-tab-width)",
								top: "var(--active-tab-top)",
								height: "var(--active-tab-height)",
							}}
						/>
					</Tabs.List>
				</Tabs.Root>
			</div>

			<SectionSeparator label="Appearance" />

			<div className="d-f fd-c g-1 px-2 pb-4">
				<span className="fs-sm ff-m c-accent-dim us-none">Theme</span>
				<ThemePicker value={themeName} onValueChange={onThemeChange} />
			</div>

			<div className="px-2 pb-4">
				<Button
					onClick={() => {
						const input = document.createElement("input");
						input.type = "file";
						input.accept = ".json,.jsonc,application/json";
						input.onchange = () => {
							const file = input.files?.[0];
							if (file) {
								onUploadTheme(file);
								haptic("success");
							}
						};
						input.click();
					}}
					className="d-f ai-c jc-c g-2 w-100% px-2 py-2 bw-1 bs-d bc-border bg-transparent c-accent-dim fs-xs ff-m us-none c-p br-xxl h:c-accent h:bc-accent-dim fv:os-s fv:oo-2 fv:oc-accent"
				>
					<UploadSimpleIcon size={14} weight="fill" />
					Upload .json theme
				</Button>
			</div>

			<ColorInput
				label="Page"
				value={frameColors.page}
				onChange={(page) => onFrameColorsChange({ ...frameColors, page })}
			/>
			<ColorInput
				label="Surface"
				value={frameColors.surface}
				onChange={(surface) => onFrameColorsChange({ ...frameColors, surface })}
			/>
			<ColorInput
				label="Border"
				value={frameColors.border}
				onChange={(border) => onFrameColorsChange({ ...frameColors, border })}
			/>
			<ColorInput
				label="Text"
				value={frameColors.accentDim}
				onChange={(accentDim) =>
					onFrameColorsChange({ ...frameColors, accentDim })
				}
			/>
			<ColorInput
				label="Tab"
				value={frameColors.tabBar}
				onChange={(tabBar) => onFrameColorsChange({ ...frameColors, tabBar })}
			/>
			<ColorInput
				label="Tab active"
				value={frameColors.tabActive}
				onChange={(tabActive) =>
					onFrameColorsChange({ ...frameColors, tabActive })
				}
			/>
			<ColorInput
				label="Status bar"
				value={frameColors.statusBarBg}
				onChange={(statusBarBg) =>
					onFrameColorsChange({ ...frameColors, statusBarBg })
				}
			/>
		</aside>
	);
}
