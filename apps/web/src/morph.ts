import { type RefObject, useLayoutEffect, useRef } from "react";

const EASE = "cubic-bezier(0.2, 0, 0, 1)";

/**
 * Whenever `view` changes, eases `box` from its old height to its new one
 * and slides the new content in: forward into a page from the right, back to
 * the list from the left, one page to the next from the right too, anything
 * else up a little. Nothing moves under
 * reduced motion.
 */
export function useMorph(
	box: RefObject<HTMLElement | null>,
	content: RefObject<HTMLElement | null>,
	view: string,
) {
	const height = useRef(0);
	const last = useRef(view);

	// the box can change height between renders, when a font loads, a line
	// rewraps or the window turns; keep the height to start from current
	useLayoutEffect(() => {
		const element = box.current;
		if (!element) return;
		const observer = new ResizeObserver(() => {
			// a running morph is not the box's own height
			if (element.getAnimations().length > 0) return;
			height.current = element.getBoundingClientRect().height;
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [box]);

	// every render, so the height to start from is always the latest
	useLayoutEffect(() => {
		const element = box.current;
		if (!element) return;
		const to = element.getBoundingClientRect().height;
		const from = height.current;
		height.current = to;

		const previous = last.current;
		if (previous === view) return;
		last.current = view;
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		if (from > 0 && Math.abs(from - to) > 1) {
			element.animate(
				[
					{ height: `${from}px`, overflow: "hidden" },
					{ height: `${to}px`, overflow: "hidden" },
				],
				{ duration: 260, easing: EASE },
			);
		}
		// one page to the next, as the landing page's evidence follows the
		// heading, moves forward like opening a page, so it shows even when
		// both pages are the same height
		const into = previous.startsWith("list") && view.startsWith("page");
		const next = previous.startsWith("page") && view.startsWith("page");
		const out = previous.startsWith("page") && view.startsWith("list");
		content.current?.animate(
			[
				{
					opacity: 0,
					transform:
						into || next
							? "translateX(16px)"
							: out
								? "translateX(-16px)"
								: "translateY(4px)",
				},
				{ opacity: 1, transform: "none" },
			],
			{ duration: 220, easing: EASE },
		);
	});
}
