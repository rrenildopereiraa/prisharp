import { Separator as BaseSeparator } from "@base-ui/react/separator";

const COLOR_CLASS = {
	page: "bg-page",
	border: "bg-border",
} as const;

export function Divider({
	orientation = "vertical",
	color = "page",
	size = "sm",
}: {
	orientation?: "vertical" | "horizontal";
	color?: "page" | "border";
	size?: "sm" | "md";
}) {
	const height = size === "md" ? "h-6" : "h-4";

	return (
		<BaseSeparator
			orientation={orientation}
			className={`${height} w-px ${COLOR_CLASS[color]}`}
		/>
	);
}
