import { Select } from "@base-ui/react/select";
import { CaretDownIcon } from "@phosphor-icons/react";
import { useChromeTheme, useHover } from "../lib/chrome-theme";
import { LANGUAGES, type LanguageId } from "../lib/highlighter";

const SHORT_LABELS: Record<LanguageId, string> = {
	html: "HTML",
	javascript: "JS",
	mjs: "MJS",
	jsx: "JSX",
	typescript: "TS",
	tsx: "TSX",
	astro: "ASTRO",
	vue: "VUE",
	svelte: "SVELTE",
	markdown: "MD",
	mdx: "MDX",
	css: "CSS",
	scss: "SCSS",
	php: "PHP",
};

const options = Object.entries(LANGUAGES).map(([id, label]) => ({
	id: id as LanguageId,
	label,
}));

export function LanguagePicker({
	value,
	onValueChange,
}: {
	value: LanguageId;
	onValueChange: (value: LanguageId) => void;
}) {
	const { colors } = useChromeTheme();
	const { hovered, hoverHandlers } = useHover();
	return (
		<Select.Root
			value={value}
			onValueChange={(next) => {
				if (next) onValueChange(next);
			}}
		>
			<Select.Trigger
				className="d-f ai-c jc-sb g-1 px-3 py-1 bg-transparent fs-xs ff-m us-none c-p bw-0 fv:os-s fv:oo--2 fv:oc-accent"
				style={{
					color: hovered ? colors.accent : colors.accentDim,
					backgroundColor: hovered ? colors.page : undefined,
				}}
				{...hoverHandlers}
			>
				<Select.Value>
					{() => (
						<span className="d-if w-12 ta-c o-h to-e ws-nw">
							{SHORT_LABELS[value]}
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
						className="select-popup w-40 max-h-40 oy-auto bw-1 py-1 bs-o-xs"
						style={{
							borderColor: colors.border,
							backgroundColor: colors.surface,
						}}
					>
						<Select.List className="p-r o-auto">
							{options.map(({ id, label }) => (
								<Select.Item
									key={id}
									value={id}
									className={(state) =>
										`d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p ${state.selected && !state.highlighted ? "h:c-white fw-700 tdl-u" : ""}`
									}
									style={(state) => ({
										backgroundColor: state.highlighted
											? colors.accent
											: undefined,
										color: state.highlighted
											? colors.onAccent
											: state.selected
												? colors.accent
												: colors.accentDim,
									})}
								>
									<Select.ItemText>{label}</Select.ItemText>
								</Select.Item>
							))}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}
