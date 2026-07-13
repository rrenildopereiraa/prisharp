import { Button } from "@base-ui/react/button";
import { DownloadSimpleIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useHaptics } from "../lib/haptics";

export function ExportButton({
	exporting,
	onExport,
}: {
	exporting: boolean;
	onExport: () => void;
}) {
	const { trigger } = useHaptics();

	return (
		<Button
			onClick={() => {
				onExport();
				trigger("success");
			}}
			disabled={exporting}
			focusableWhenDisabled
			className="d-f ai-c jc-c g-2 w-8 @sm:w-28 px-2 py-1 bg-accent c-page fw-600 fs-sm ff-m us-none c-p bw-0 br-xxl bs-i-xs h:bg-accent-dim fv:os-s fv:oo-2 fv:oc-accent"
		>
			{exporting ? (
				<span className="d-f">
					<SpinnerIcon size={14} />
				</span>
			) : (
				<DownloadSimpleIcon size={14} weight="fill" />
			)}
			<span className="d-none @sm:d-if">
				{exporting ? "Exporting" : "Export"}
			</span>
		</Button>
	);
}
