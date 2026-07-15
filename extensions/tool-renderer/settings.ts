import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

/** Path to the single global config file: ~/.pi/agent/pi-tool-renderer.json */
function configPath(): string {
	const userDir = resolve(expandHome(process.env.PI_CODING_AGENT_DIR?.trim() || "~/.pi/agent"));
	return join(userDir, "pi-tool-renderer.json");
}

function expandHome(input: string): string {
	if (input === "~") return homedir();
	if (input.startsWith("~/")) return join(homedir(), input.slice(2));
	return input;
}

/** Read and parse the standalone config file. Returns {} if missing or invalid. */
function readConfig(): Record<string, unknown> {
	const path = configPath();
	if (!existsSync(path)) return {};
	try {
		const parsed = JSON.parse(readFileSync(path, "utf8"));
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
		return {};
	} catch {
		return {};
	}
}

export function settingNumber(key: string, fallback: number): number {
	const value = readConfig()[key];
	const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function settingBoolean(key: string, fallback: boolean): boolean {
	const value = readConfig()[key];
	return typeof value === "boolean" ? value : fallback;
}

export function settingString(key: string, fallback: string): string {
	const value = readConfig()[key];
	return typeof value === "string" ? value : fallback;
}

export function settingEnum<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
	const value = readConfig()[key];
	return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/* --- convenience getters (signatures simplified: no more cwd param) --- */

export function rightMarginGuardEnabled(): boolean {
	return settingBoolean("rightMarginGuard", true);
}

export function stackToolCalls(): boolean {
	return settingBoolean("stackToolCalls", false);
}

export type StackChildDisplay = "rows" | "headline" | "anchor-list";

export function stackChildDisplay(): StackChildDisplay {
	const value = readConfig().stackChildDisplay;
	if (value === "rows" || value === "headline" || value === "anchor-list") return value;
	return settingBoolean("hideStackChildRows", false) ? "headline" : "rows";
}

export function stackShell(): { renderShell?: "self" } {
	return stackToolCalls() ? { renderShell: "self" } : {};
}

export type ReadOutputMode = "hidden" | "summary" | "preview";
export type SearchOutputMode = "hidden" | "count" | "preview";
export type BashOutputMode = "hidden" | "summary" | "opencode" | "preview";
export type McpOutputMode = "hidden" | "summary" | "preview";

export function readOutputMode(): ReadOutputMode {
	return settingEnum("readOutputMode", ["hidden", "summary", "preview"] as const, "preview");
}

export function searchOutputMode(): SearchOutputMode {
	return settingEnum("searchOutputMode", ["hidden", "count", "preview"] as const, "preview");
}

export function bashOutputMode(): BashOutputMode {
	return settingEnum("bashOutputMode", ["hidden", "summary", "opencode", "preview"] as const, "opencode");
}

export function bashLiveOutputDelayMs(): number {
	return Math.max(0, Math.floor(settingNumber("bashLiveOutputDelayMs", 1000)));
}

export function bashLiveTailLines(): number {
	return Math.max(1, Math.floor(settingNumber("bashLiveTailLines", 4)));
}

export function mcpOutputMode(): McpOutputMode {
	return settingEnum("mcpOutputMode", ["hidden", "summary", "preview"] as const, "preview");
}

export type TreeStyle = "unicode" | "ascii";

export function treeStyle(): TreeStyle {
	return settingEnum("treeStyle", ["unicode", "ascii"] as const, "unicode");
}

export function pendingStatusAnimation(): boolean {
	return settingBoolean("pendingStatusAnimation", false);
}

export function diffBackgroundEnabled(): boolean {
	return settingBoolean("diffBackgrounds", true);
}

export function bashDiffRenderingEnabled(): boolean {
	return settingBoolean("renderBashDiffs", false);
}

export type ToolChromeMode = "off" | "transparent" | "outlines";

export function toolChromeMode(): ToolChromeMode {
	return settingEnum("toolChrome", ["off", "transparent", "outlines"] as const, "outlines");
}
