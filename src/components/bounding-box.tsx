import { useChromeTheme } from "../lib/chrome-theme";

export function BoundingBox() {
	const { colors } = useChromeTheme();
	const handleStyle = {
		backgroundColor: colors.page,
		borderColor: colors.accent,
	};
	return (
		<>
			<div
				className="p-a i--2 bw-1 bs-s pe-none"
				style={{ borderColor: colors.accent }}
				aria-hidden="true"
			/>

			<div
				className="p-a t--3 l--3 w-2 h-2 bw-1 bs-s pe-none"
				style={handleStyle}
				aria-hidden="true"
			/>
			<div
				className="p-a t--3 r--3 w-2 h-2 bw-1 bs-s pe-none"
				style={handleStyle}
				aria-hidden="true"
			/>
			<div
				className="p-a b--3 l--3 w-2 h-2 bw-1 bs-s pe-none"
				style={handleStyle}
				aria-hidden="true"
			/>
			<div
				className="p-a b--3 r--3 w-2 h-2 bw-1 bs-s pe-none"
				style={handleStyle}
				aria-hidden="true"
			/>
		</>
	);
}
