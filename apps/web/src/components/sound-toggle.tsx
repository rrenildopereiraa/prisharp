import { VolumeCrossIcon, VolumeLoudIcon } from "@solar-icons/react/bold";
import { play, setMuted } from "sonics";
import { useSonics } from "sonics/react";
import Button from "@/components/ui/button";
import { Tooltip } from "@/components/tooltip";

export function SoundToggle() {
	const { enabled, toggle } = useSonics();

	return (
		<Tooltip label={enabled ? "Sound is on" : "Sound is off"}>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				iconOnly
				icon={
					enabled ? (
						<VolumeLoudIcon className="w:4 h:4" />
					) : (
						<VolumeCrossIcon className="w:4 h:4" />
					)
				}
				aria-pressed={enabled}
				onClick={() => {
					if (enabled) {
						play("toggleOff");
					} else {
						setMuted(false);
						play("toggleOn");
					}
					toggle();
				}}
			>
				Sound
			</Button>
		</Tooltip>
	);
}
