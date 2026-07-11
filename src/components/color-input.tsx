import { useHaptics } from "../lib/haptics";

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

	return (
		<div className="d-f ai-c jc-sb g-2 px-2 py-1">
			<span className="fs-sm ff-m c-accent-dim us-none">{label}</span>
			<input
				type="color"
				value={value}
				onChange={(event) => {
					onChange(event.target.value);
					haptic("success");
				}}
				className="w-6 h-6 p-0 bw-0 bg-transparent c-p"
			/>
		</div>
	);
}
