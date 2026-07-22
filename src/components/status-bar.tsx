import { Button } from "@base-ui/react/button";
import { Select } from "@base-ui/react/select";
import { Separator } from "@base-ui/react/separator";
import {
	CaretDownIcon,
	MoonIcon,
	ShuffleIcon,
	SunIcon,
} from "@phosphor-icons/react";
import { useChromeTheme, useHover } from "../lib/chrome-theme";
import { type LanguageId, THEMES } from "../lib/highlighter";
import type { BackgroundPattern } from "../lib/types";
import { LanguagePicker } from "./language-picker";
import { Tooltip } from "./tooltip";

const PATTERN_LABELS: Record<BackgroundPattern, string> = {
	"stripes-right": "Stripes Right",
	"stripes-left": "Stripes Left",
};

export function StatusBar({
	language,
	onLanguageChange,
	background,
	onBackgroundChange,
	themeName,
	onThemeChange,
	themeIsRandom,
	onRandomize,
}: {
	language: LanguageId;
	onLanguageChange: (value: LanguageId) => void;
	background: BackgroundPattern;
	onBackgroundChange: (value: BackgroundPattern) => void;
	themeName: string;
	onThemeChange: (value: string) => void;
	themeIsRandom: boolean;
	onRandomize: () => void;
}) {
	const { mode, colors, toggle } = useChromeTheme();
	const PATTERNS = Object.keys(PATTERN_LABELS) as BackgroundPattern[];
	const THEME_IDS = Object.keys(THEMES);
	const { hovered: patternHovered, hoverHandlers: patternHoverHandlers } =
		useHover();
	const { hovered: themeHovered, hoverHandlers: themeHoverHandlers } =
		useHover();
	const { hovered: randomizeHovered, hoverHandlers: randomizeHoverHandlers } =
		useHover();
	const { hovered: darkModeHovered, hoverHandlers: darkModeHoverHandlers } =
		useHover();

	function cycleBackground() {
		const idx = PATTERNS.indexOf(background);
		const next = PATTERNS[(idx + 1) % PATTERNS.length];
		onBackgroundChange(next);
	}

	return (
		<footer
			className="d-none @lg:d-f ai-c btw-1 bs-s"
			style={{ borderColor: colors.border, backgroundColor: colors.surface }}
		>
			<LanguagePicker value={language} onValueChange={onLanguageChange} />

			<div className="d-none @lg:d-f ai-c">
				<Separator
					orientation="vertical"
					className="h-4 w-px"
					style={{ backgroundColor: colors.border }}
				/>

				<Button
					onClick={cycleBackground}
					className="w-28 ta-c py-1 bg-transparent fs-xs ff-m us-none c-p fv:os-s fv:oo--2 fv:oc-accent"
					style={{
						color: patternHovered ? colors.accent : colors.accentDim,
						backgroundColor: patternHovered ? colors.page : undefined,
					}}
					{...patternHoverHandlers}
				>
					{PATTERN_LABELS[background]}
				</Button>

				<Separator
					orientation="vertical"
					className="h-4 w-px"
					style={{ backgroundColor: colors.border }}
				/>

				<Select.Root
					value={themeName}
					onValueChange={(next) => {
						if (next) onThemeChange(next);
					}}
				>
					<Select.Trigger
						className="d-f ai-c g-1 px-3 py-1 bg-transparent fs-xs ff-m us-none c-p bw-0 fv:os-s fv:oo--2 fv:oc-accent"
						style={{
							color: themeHovered ? colors.accent : colors.accentDim,
							backgroundColor: themeHovered ? colors.page : undefined,
						}}
						{...themeHoverHandlers}
					>
						<Select.Value>
							{() => (
								<span className="d-if w-28 o-h to-e ws-nw">
									{themeName}
									{themeIsRandom && (
										<Tooltip content="Randomly selected theme">
											<span style={{ color: colors.accent }}> *</span>
										</Tooltip>
									)}
								</span>
							)}
						</Select.Value>
						<Select.Icon className="d-f" style={{ color: colors.accentDim }}>
							<CaretDownIcon size={12} weight="fill" />
						</Select.Icon>
					</Select.Trigger>
					<Select.Portal>
						<Select.Positioner
							sideOffset={8}
							alignItemWithTrigger={false}
							className="zi-90 p-0 ow-0 us-none"
						>
							<Select.Popup
								className="select-popup w-48 max-h-60 oy-auto bw-1 py-1 bs-o-xs"
								style={{
									borderColor: colors.border,
									backgroundColor: colors.surface,
								}}
							>
								<Select.List>
									{THEME_IDS.map((id) => (
										<Select.Item
											key={id}
											value={id}
											className="d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p"
											style={(state) => ({
												backgroundColor: state.highlighted
													? colors.accent
													: undefined,
												color: state.highlighted
													? colors.onAccent
													: colors.accentDim,
											})}
										>
											<Select.ItemText>{id}</Select.ItemText>
										</Select.Item>
									))}
								</Select.List>
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</Select.Root>
			</div>

			<Separator
				orientation="vertical"
				className="h-4 w-px"
				style={{ backgroundColor: colors.border }}
			/>

			<Tooltip content="Randomize appearance">
				<Button
					onClick={onRandomize}
					aria-label="Randomize appearance"
					className="d-f ai-c jc-c g-1 px-2 py-1 bg-transparent fs-xs ff-m us-none bw-0 c-p fv:os-s fv:oo--2 fv:oc-accent"
					style={{
						color: randomizeHovered ? colors.accent : colors.accentDim,
						backgroundColor: randomizeHovered ? colors.page : undefined,
					}}
					{...randomizeHoverHandlers}
				>
					<ShuffleIcon size={13} weight="bold" />
					Randomize
				</Button>
			</Tooltip>

			<div className="f-1" />

			<div className="d-none @lg:d-f ai-c">
				<Tooltip
					content={
						mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
					}
				>
					<Button
						onClick={toggle}
						aria-label={
							mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
						}
						className="d-f ai-c jc-c px-3 py-1 bg-transparent bw-0 c-p fv:os-s fv:oo--2 fv:oc-accent"
						style={{
							color: darkModeHovered ? colors.accent : colors.accentDim,
							backgroundColor: darkModeHovered ? colors.page : undefined,
						}}
						{...darkModeHoverHandlers}
					>
						{mode === "dark" ? (
							<SunIcon size={13} weight="bold" />
						) : (
							<MoonIcon size={13} weight="bold" />
						)}
					</Button>
				</Tooltip>
			</div>
		</footer>
	);
}
