import type { MDXComponents } from "mdx/types";
import { type ComponentProps, createContext, useContext } from "react";

// code inside a block keeps the highlighter's look; inline code gets a chip
const InBlock = createContext(false);
// a paragraph inside a list item sits tight against the next item
const InItem = createContext(false);

function Paragraph(props: ComponentProps<"p">) {
	const item = useContext(InItem);
	return <p className={item ? "m:0 lh:5" : "my:4 lh:5 c:label"} {...props} />;
}

export const mdx: MDXComponents = {
	h2: (props) => (
		<h2
			className="mt:16 mb:4 fs:xl fw:600 c:label smt:20 @md:fs:xxl"
			{...props}
		/>
	),
	h3: (props) => (
		<h3 className="mt:8 mb:3 fs:md fw:600 c:label smt:20" {...props} />
	),
	p: Paragraph,
	li: (props) => (
		<InItem.Provider value={true}>
			<li {...props} />
		</InItem.Provider>
	),
	a: (props) => (
		<a
			className="c:label td:u tuo:2 tdc:rim h:tdc:label tp:c tdu:150"
			{...props}
		/>
	),
	strong: (props) => <strong className="fw:600 c:label" {...props} />,
	ul: (props) => (
		<ul className="d:f fd:c g:2 my:4 pl:6 lh:5 c:label lst:d" {...props} />
	),
	ol: (props) => (
		<ol className="d:f fd:c g:3 my:4 pl:6 lh:5 c:label" {...props} />
	),
	pre: (props: ComponentProps<"pre">) => (
		<InBlock.Provider value={true}>
			<pre
				{...props}
				className={`${props.className ?? ""} my:4 p:4 br:xl bw:1 bc:line ox:auto fs:sm lh:4`}
			/>
		</InBlock.Provider>
	),
	code: function Code(props: ComponentProps<"code">) {
		const block = useContext(InBlock);
		return block ? (
			<code {...props} />
		) : (
			<code className="px:1 br:sm bg:well fs:sm ff:m" {...props} />
		);
	},
};
