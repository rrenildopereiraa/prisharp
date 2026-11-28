import Button from "@/components/ui/button";
import { CATEGORIES, slug } from "./category";

/**
 * Every category A to Z with its count in grey, as a book's index lists
 * them. The one on screen is raised in the accent.
 */
export function CategoryIndex({
	current,
	onPick,
}: {
	current: string;
	/** Called once a category is picked, as the phone's drawer closes on it. */
	onPick?: () => void;
}) {
	return (
		<ul className="m:0 p:0 sst:none d:f fd:c">
			{CATEGORIES.map(([name, count]) => {
				const here = name === current;
				return (
					<li key={name}>
						<Button
							render={<a href={`#${slug(name)}`} />}
							nativeButton={false}
							variant={here ? "secondary" : "ghost"}
							size="sm"
							shape="none"
							aria-current={here ? "true" : undefined}
							onClick={onPick}
							className={`w:100% jc:sb fw:400 td:none ${here ? "c:accent" : "c:label"}`}
						>
							<span>{name}</span>
							<span className="c:hint">{count}</span>
						</Button>
					</li>
				);
			})}
		</ul>
	);
}
