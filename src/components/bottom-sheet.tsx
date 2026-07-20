import { Drawer } from "@base-ui/react/drawer";
import { XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export function BottomSheet({
	open,
	onOpenChange,
	title,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	children: ReactNode;
}) {
	return (
		<Drawer.Root
			open={open}
			onOpenChange={onOpenChange}
			swipeDirection="down"
			snapPoints={[0.5, 1]}
			defaultSnapPoint={1}
		>
			<Drawer.SwipeArea className="bottom-sheet-handle @lg:d-none p-f l-0 r-0 zi-10 h-8">
				<button
					type="button"
					onClick={() => onOpenChange(true)}
					aria-label={`Open ${title.toLowerCase()}`}
					aria-expanded={open}
					className="d-f ai-c jc-c w-100% h-100% bg-surface btw-1 bs-d bc-border c-accent-dim fs-xs ff-m us-none c-p h:c-accent h:bg-page"
				>
					Swipe up for {title}
				</button>
			</Drawer.SwipeArea>

			<Drawer.Portal>
				<Drawer.Backdrop className="drawer-backdrop @lg:d-none p-f i-0 zi-80 bg-page/60" />
				<Drawer.Viewport className="@lg:d-none p-f i-0 zi-90">
					<Drawer.Popup className="drawer-popup d-f fd-c p-f l-0 r-0 b-0 max-h-80% bg-surface btw-1 bs-s bc-border">
						<div className="d-f jc-c pt-2" aria-hidden="true">
							<div className="w-9 h-1 bg-border" />
						</div>
						<div className="d-f ai-c jc-sb px-3 py-2 bbw-1 bs-s bc-border">
							<Drawer.Title className="fs-sm ff-m fw-700 c-accent-dim us-none">
								{title}
							</Drawer.Title>
							<Drawer.Close
								aria-label={`Close ${title.toLowerCase()}`}
								className="d-f ai-c jc-c w-6 h-6 p-0 c-accent-dim bg-transparent bw-0 c-p h:c-accent fv:os-s fv:oo-2 fv:oc-accent"
							>
								<XIcon size={14} weight="bold" />
							</Drawer.Close>
						</div>
						<Drawer.Content className="oy-auto p-3">{children}</Drawer.Content>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
