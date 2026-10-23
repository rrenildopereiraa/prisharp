# Working

- PRs, never direct commits to `main`.
- A Vite+ monorepo: `apps/extension` is the extension, `apps/web` is prisharp.com. Run `pnpm ready` (`vp check`, tests, builds) before a PR.
- `apps/web` uses Yumma UI as it ships. Change a component through its props; leave `src/components/ui` as the CLI wrote it.

# Yumma CSS

This project styles with Yumma CSS (https://yummacss.com). Write its classes, not another library's, and check them before you finish.

## Migrating From 3.x

Check the version before anything else. The project is on 3.x if `yummacss` in `package.json` is below `4`, or if its classes put a dash between property and value: `d-f`, `p-4`, `bg-red-5`, `m--4`.

- Stop before the task and tell the user. A 3.x build generates no 4.x class, so nothing below works until the project is migrated.
- Do not rewrite classes by hand, and do not take `yummacss lint` suggestions one at a time: on a 3.x project it reports nearly every class. The codemod rewrites them all, reading `yumma.config.mjs` for custom colors and breakpoints.
- Migrate as its own change, in this order:
  1. `pnpm dlx yummacss migrate --dry-run`, then `pnpm dlx yummacss migrate`.
  2. Rewrite by hand only what it lists under "Left alone": classes built at runtime, and the same classes in a `safelist`.
  3. Update `yummacss` and its `@yummacss/` packages to the latest version, all the same. `@yummacss/canon` is `@yummacss/lint`, so a script that runs `yummacss-canon` runs `yummacss lint`. Remove a package that has no 4.x release.
  4. Build, then `pnpm dlx yummacss lint`.

## Syntax

- A class is property initials, a colon, value initials: `d:f` is `display: flex`, `jc:sb` is `justify-content: space-between`.
- Numbers and scales keep their position: `p:4` is `padding: 1rem` (one step is 0.25rem), `fs:lg`, `fw:600`. `none` and `auto` stay whole: `d:none`.
- Variants go first, each followed by a colon: `h:bg:indigo-7` on hover, `@md:d:f` from the md breakpoint, `b::c:indigo` on `::before`. They stack: `@sm:h:bg:red`.
- Opacity follows a slash: `bg:red-5/50`. A negative value takes a minus after the colon: `ml:-4`.
- There are no arbitrary values: `w:37px` is not a class. A value off the scale is a CSS function with no spaces: `max-h:calc(100dvh-5rem)`, `w:var(--width)`.
- Yumma is a name, not a theme. There is no `yum-` prefix and no dash between property and value.

## Values

- Spacing and sizing run from `0` to `384`, in steps of 0.25rem: `w:96` is `24rem`. Percentages and viewport units are values too: `w:100%`, `h:dvh`.
- Colors: red, orange, yellow, lime, mint, green, cyan, sky, blue, indigo, violet, lavender, magenta, pink, coral, zinc, gray, slate, silver, plus `white`, `black` and `transparent`. Each has a base and twelve shades: `1` to `6` lighter, `7` to `12` darker, as in `bg:indigo`, `bg:indigo-2`, `c:slate-10`.
- Breakpoints, from that width up: `@xs:` @media (min-width: 32rem), `@sm:` @media (min-width: 40rem), `@md:` @media (min-width: 48rem), `@lg:` @media (min-width: 64rem), `@xl:` @media (min-width: 80rem), `@xxl:` @media (min-width: 96rem).
- Container queries, on a child of an element with `ct:is`: `@c:xs:` @container (min-width: 32rem), `@c:sm:` @container (min-width: 40rem), `@c:md:` @container (min-width: 48rem), `@c:lg:` @container (min-width: 64rem), `@c:xl:` @container (min-width: 80rem), `@c:xxl:` @container (min-width: 96rem).
- Other at-rules: `@pc:` @media (pointer: coarse), `@prm:` @media (prefers-reduced-motion: reduce), `@st:` @starting-style.
- States: `a:` :active, `c:` :checked, `d:` :disabled, `e:` :empty, `f:` :focus, `fc:` :first-child, `fv:` :focus-visible, `fw:` :focus-within, `h:` :hover, `i:` :invalid, `in:` :indeterminate, `lc:` :last-child, `nc:` :nth-child, `r:` :required, `ro:` :read-only, `v:` :valid.
- Pseudo-elements: `a::` :after, `b::` :before, `p::` ::placeholder, `s::` ::selection.
- Colors, breakpoints and states the project adds live in `yumma.config.mjs` under `theme`. Read it before using a name that is not listed here.

## Examples

Yumma UI components are written in these classes. Read one before building something similar:

- https://www.yummaui.com/components/button.md: variants, sizes and shapes as class maps, hover, a focus outline, opacity, and `merge` for overrides.
- https://www.yummaui.com/components/field.md: a label, input and message stacked with flex, with border, outline and icon colors for its error and success states.
- https://www.yummaui.com/components/tabs.md: a sliding indicator positioned under the selected tab, with a transition that can be turned off.
- https://www.yummaui.com/components/dialog.md: an overlay and a popup that animate with `opening:` and `closing:`, and `@prm:tp:none` for reduced motion.

`opening:` and `closing:` are states a project declares under `theme.states`, as the Yumma UI installation page shows. Check `yumma.config.mjs` before using them.

## Check

- After editing classes, run `pnpm dlx yummacss lint`. It lists every class Yumma CSS does not generate, with the closest one that exists. Use the suggestion; do not keep a class it reports.
- In a project that uses Oxlint, the `@yummacss/lint` rules report the same in the editor, and `no-inline-styles` names the class for a property set in `style`.
- Every utility has a page named after its CSS property, as plain text: https://yummacss.com/docs/justify-content.md. The index is https://yummacss.com/llms.txt.
