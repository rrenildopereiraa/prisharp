import { Input } from "@base-ui/react/input";
import { useEffect, useState } from "react";
import { useHaptics } from "../lib/haptics";

function isValidHex(value: string) {
	return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function ColorInput({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	const { trigger: haptic } = useHaptics();
	// Local buffer so every keystroke shows up, even while the text is not
	// (yet) a complete valid hex. Only commit upstream once it parses.
	const [text, setText] = useState(value);

	useEffect(() => {
		setText(value);
	}, [value]);

	return (
		<div className="d-f ai-c jc-sb g-2 px-2 pb-2">
			<span className="fs-sm ff-m c-accent-dim us-none">{label}</span>
			<div className="d-f g-2">
				<Input
					value={text}
					onChange={(event) => {
						const next = event.target.value;
						setText(next);
						if (isValidHex(next)) {
							onChange(next);
							haptic("success");
						}
					}}
					onBlur={() => {
						if (!isValidHex(text)) setText(value);
					}}
					spellCheck={false}
					className="ff-m fs-xs c-accent-dim bg-page bs-i-xs bw-1 bs-s bc-border px-2 py-1 w-20"
				/>
				<div
					className="w-5 bw-1 bs-s bc-border fs-0"
					style={{ backgroundColor: value }}
				/>
			</div>
		</div>
	);
}
