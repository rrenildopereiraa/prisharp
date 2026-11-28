import { Input } from "@base-ui/react/input";
import { IconSearch } from "@tabler/icons-react";
import {
	type KeyboardEvent,
	type ReactNode,
	useEffect,
	useId,
	useMemo,
	useState,
} from "react";
import { FOCUS, INPUT_TEXT } from "@/components/ui/style";
import { predict } from "./search";

// the box and the text over it share their size, border and padding. The
// text over it draws what was typed as well as the prediction, so the two line
// up exactly; the box itself only draws its caret, selection and placeholder.
const BOX = `w:100% h:11 bw:1 pl:10 pr:3 ${INPUT_TEXT}`;

/**
 * A search box that finishes the name being typed in grey, with no menu: Tab,
 * the right arrow or Enter takes it, and the up and down arrows go through
 * the other names that match.
 */
export function Predict<T extends { name: string; category: string }>({
	list,
	label,
	placeholder,
	logo,
	onPredict,
	onPick,
}: {
	/** What to search, best known first: the first match is predicted. */
	list: readonly T[];
	label: string;
	placeholder: string;
	/** The mark of the technology predicted, in place of the search icon. */
	logo: (tech: T) => ReactNode;
	/** Called as each technology is predicted, so its mark can load. */
	onPredict?: (tech: T) => void;
	/** Called once a prediction is taken. */
	onPick: (tech: T) => void;
}) {
	const id = useId();
	const [value, setValue] = useState("");
	const [index, setIndex] = useState(0);
	const matches = useMemo(() => predict(list, value), [list, value]);
	const shown =
		matches.length > 0 ? matches[index % matches.length] : undefined;
	// once a name is taken there is nothing left to finish
	const taken = shown?.tech.name === value;
	const predicted = shown?.tech;
	useEffect(() => {
		if (predicted) onPredict?.(predicted);
	}, [predicted, onPredict]);

	const type = (next: string) => {
		setValue(next);
		setIndex(0);
	};

	const take = () => {
		if (!shown) return false;
		setValue(shown.tech.name);
		setIndex(0);
		onPick(shown.tech);
		return true;
	};

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		const input = event.currentTarget;
		const atEnd = input.selectionStart === input.value.length;
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			if (matches.length < 2) return;
			event.preventDefault();
			const step = event.key === "ArrowDown" ? 1 : matches.length - 1;
			setIndex((current) => (current + step) % matches.length);
		} else if (event.key === "Escape") {
			if (value !== "") event.preventDefault();
			type("");
		} else if (
			// Tab moves on once there is nothing to take, as it does anywhere else
			(event.key === "Tab" && !event.shiftKey && !taken) ||
			(event.key === "ArrowRight" && atEnd && !taken) ||
			event.key === "Enter"
		) {
			if (take()) event.preventDefault();
		}
	};

	// what Tab does, short enough for one line; the name is in it for a
	// screen reader, which can't see the grey text
	const more = matches.length > 1 ? ` · ↑ ↓ ${matches.length - 1} more` : "";
	const hint = !shown
		? value.trim() === ""
			? undefined
			: "No technology by that name"
		: taken
			? undefined
			: `Tab opens ${shown.tech.name}${more}`;

	return (
		<div className="d:f fd:c g:2">
			<label htmlFor={id} className="c:label fs:sm fw:500 us:none">
				{label}
			</label>
			<div className="p:r d:f ai:c">
				<span
					aria-hidden="true"
					className="p:a l:3 d:f ai:c jc:c w:5 h:5 c:hint pe:none"
				>
					{shown ? logo(shown.tech) : <IconSearch className="w:4 h:4" />}
				</span>
				<Input
					id={id}
					type="text"
					enterKeyHint="go"
					value={value}
					onValueChange={type}
					onKeyDown={onKeyDown}
					placeholder={placeholder}
					autoComplete="off"
					spellCheck={false}
					aria-describedby={hint ? `${id}-hint` : undefined}
					className={`${BOX} ${FOCUS} bg:field bs-o:key bc:rim c:transparent cc:label p::c:hint`}
				/>
				<span
					aria-hidden="true"
					className={`${BOX} p:a t:0 l:0 d:f ai:c bc:transparent ws:p o:h pe:none`}
				>
					<span className="c:label">{value}</span>
					{shown && !taken && (
						<span className="c:hint">
							{shown.rest ?? `  → ${shown.tech.name}`}
						</span>
					)}
				</span>
			</div>
			<p
				id={`${id}-hint`}
				aria-live="polite"
				className="m:0 min-h:4 fs:xs c:hint"
			>
				{hint}
			</p>
		</div>
	);
}
