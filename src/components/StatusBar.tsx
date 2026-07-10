import { Separator } from "@base-ui/react/separator";
import { Toggle } from "@base-ui/react/toggle";
import { useHaptics } from "../lib/haptics";

function segmentClass(pressed: boolean) {
	return `px-3 py-1 fs-xs ff-m us-none c-p bw-0 fv:os-s fv:oo--2 fv:oc-accent ${pressed ? "c-page bg-accent fw-700" : "c-accent-dim bg-transparent h:bg-page"}`;
}

export function StatusBar({
	showTabBar,
	onShowTabBarChange,
	showStatusBar,
	onShowStatusBarChange,
	width,
	height,
}: {
	showTabBar: boolean;
	onShowTabBarChange: (value: boolean) => void;
	showStatusBar: boolean;
	onShowStatusBarChange: (value: boolean) => void;
	width: number;
	height: number;
}) {
	const { trigger: haptic } = useHaptics();

	return (
		<footer className="d-f ai-c jc-sb btw-1 bs-s bc-border bg-surface">
			<div className="d-f ai-c">
				<img src="/favicon.svg" className="w-4 h-4 mx-2" alt="" />

				<Separator orientation="vertical" className="h-4 brw-1 bs-s bc-border" />

				<Toggle
					pressed={showTabBar}
					onPressedChange={(pressed) => {
						onShowTabBarChange(pressed);
						haptic("success");
					}}
					className={(state) => segmentClass(state.pressed)}
				>
					Tab bar
				</Toggle>

				<Separator orientation="vertical" className="h-4 w-px bg-page" />

				<Toggle
					pressed={showStatusBar}
					onPressedChange={(pressed) => {
						onShowStatusBarChange(pressed);
						haptic("success");
					}}
					className={(state) => segmentClass(state.pressed)}
				>
					Status bar
				</Toggle>
			</div>

			<div className="d-f ai-c">
				<span className="px-3 py-1 ff-m fs-xs c-accent-dim">
					{width} × {height}
				</span>
				<Separator orientation="vertical" className="h-4 w-px bg-page" />
				<span className="py-1 pr-3 ff-m fs-xs c-accent-dim">2x</span>
			</div>
		</footer>
	);
}
