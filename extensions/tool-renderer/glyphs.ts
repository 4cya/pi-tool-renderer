import { settingEnum, settingBoolean } from "./settings.js";

export type GlyphStyle = "unicode" | "ascii";
export type GlobalGlyphStyleOverride = "inherit" | GlyphStyle;

function asGlyphStyle(value: unknown): GlyphStyle | undefined {
	return value === "unicode" || value === "ascii" ? value : undefined;
}

/** Read glyph style from the standalone config file. */
export function glyphStyle(): GlyphStyle {
	const globalOverride = settingEnum("globalGlyphStyleOverride", ["inherit", "unicode", "ascii"] as const, "inherit");
	const forced = asGlyphStyle(globalOverride === "inherit" ? undefined : globalOverride);
	if (forced) return forced;
	return asGlyphStyle(settingEnum("glyphStyle", ["unicode", "ascii"] as const, "unicode"))
		?? asGlyphStyle(settingEnum("treeStyle", ["unicode", "ascii"] as const, "unicode"))
		?? "unicode";
}

export const GLYPHS = {
	unicode: {
		frame: { tl: "┏", tr: "┓", bl: "┗", br: "┛", h: "━", v: "┃" },
		line: "─",
		tree: { mid: "├─ ", last: "└─ ", stem: "│  ", blank: "   " },
		bullet: "● ",
		emptyBullet: "○ ",
		dot: " · ",
		ok: "✓",
		fail: "✗",
		warn: "▲",
		diamond: "◆",
		prompt: "π",
		ellipsis: "…",
		arrow: "→",
		codeBar: "▌",
	},
	ascii: {
		frame: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
		line: "-",
		tree: { mid: "|-- ", last: "`-- ", stem: "|  ", blank: "   " },
		bullet: "* ",
		emptyBullet: "o ",
		dot: " - ",
		ok: "+",
		fail: "x",
		warn: "!",
		diamond: "*",
		prompt: "pi",
		ellipsis: "...",
		arrow: "->",
		codeBar: "|",
	},
} as const;

export function glyphs(): (typeof GLYPHS)[GlyphStyle] {
	return GLYPHS[glyphStyle()];
}

export function truncateIndicator(): string {
	return glyphs().ellipsis;
}

export function truncateText(text: string, maxChars: number): string {
	if (text.length <= maxChars) return text;
	const indicator = truncateIndicator();
	return `${text.slice(0, Math.max(0, maxChars - indicator.length))}${indicator}`;
}

export function dot(): string {
	return glyphs().dot;
}

export function treeGlyph(branch: "├" | "└" | "│"): string {
	const tree = glyphs().tree;
	if (branch === "│") return tree.stem;
	return branch === "└" ? tree.last : tree.mid;
}

export function frameGlyphs(): (typeof GLYPHS)[GlyphStyle]["frame"] {
	return glyphs().frame;
}
