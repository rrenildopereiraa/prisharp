import { VolumeCrossIcon, VolumeLoudIcon } from "@solar-icons/react/bold";
import { play, setMuted } from "sonics";
import { useSonics } from "sonics/react";
import Button from "@/components/ui/button";

export function SoundToggle() {
	const { enabled, toggle } = useSonics();

	return (
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
			title={enabled ? "Sound is on" : "Sound is off"}
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
	);
}
