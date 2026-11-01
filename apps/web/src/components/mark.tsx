/** The Prisharp logomark: four panes in the mark's sky, the bottom pair softened. */
export function Mark({ className }: { className: string }) {
	return (
		<svg
			viewBox="0 0 40 48"
			aria-hidden="true"
			className={`c:logo ${className}`}
		>
			<g fill="currentColor">
				<path d="m0 14.5264v18.9473l17.8947-12.2437v-18.94741z" />
				<path d="m40 14.5263v18.9474l-17.8947-12.2438v-18.94737z" />
			</g>
			<g fill="currentColor" className="o:60">
				<path d="m0 33.4737v-18.9474l17.8947 12.2438v18.9474z" />
				<path d="m40 33.4737v-18.9474l-17.8947 12.2438v18.9474z" />
			</g>
		</svg>
	);
}
