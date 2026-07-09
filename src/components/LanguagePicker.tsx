import { Select } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useHaptics } from "../lib/haptics";
import { LANGUAGES, type LanguageId } from "../lib/highlighter";

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
	const [open, setOpen] = useState(false);
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
			open={open}
			onOpenChange={setOpen}
		>
			<Select.Trigger
				className={`d-f ai-c jc-sb g-2 w-24 @sm:w-36 px-3 @sm:px-4 py-2 bw-1 bc-border c-accent-dim fs-sm ff-m us-none c-p bs-o-xs fv:oo-2 fv:oc-accent ${open ? "bg-page" : "bg-surface"}`}
			>
				<Select.Value>
					{() => (
						<span className="min-w-0 o-h to-e ws-nw">{LANGUAGES[value]}</span>
					)}
				</Select.Value>
				<Select.Icon className="d-f c-accent-dim">
					<ChevronDownIcon className="w-4 h-4" />
				</Select.Icon>
			</Select.Trigger>
			<AnimatePresence>
				{open && (
					<Select.Portal>
						<Select.Positioner
							sideOffset={8}
							alignItemWithTrigger={false}
							className="zi-90 p-0 ow-0 us-none"
						>
							<Select.Popup
								render={
									<motion.div
										initial={{ opacity: 0, scale: 0.97 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.97 }}
										transition={{ duration: 0.12, ease: "easeOut" }}
									/>
								}
								className="w-48 bw-1 bc-border bg-surface py-1 bs-o-xs"
							>
								<Select.List className="p-r o-auto">
									{options.map(({ id, label }) => (
										<Select.Item
											key={id}
											value={id}
											className={(state) =>
												`d-f ai-c jc-sb g-2 mx-1 px-3 py-2 fs-sm ff-m us-none c-p ${state.highlighted ? "bg-page c-accent" : "c-accent-dim"}`
											}
										>
											<Select.ItemText>{label}</Select.ItemText>
											<Select.ItemIndicator className="d-f ai-c c-accent">
												<CheckIcon className="w-4 h-4" />
											</Select.ItemIndicator>
										</Select.Item>
									))}
								</Select.List>
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				)}
			</AnimatePresence>
		</Select.Root>
	);
}
