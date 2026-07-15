import { CompactionSummaryMessageComponent, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { registerToolBatch } from "./tool-renderer/batch.js";
import {
	installToolChromePatch,
	installToolExecutionRendererPatch,
	installWorkingIndicator,
	installWorkingLoaderAlignmentPatch,
	registerToolChromeEvents,
} from "./tool-renderer/chrome.js";
import {
	installAssistantMessageRenderer,
	installCompactionSummaryRenderer,
	installCustomMessageSpacingPatch,
	installMarkdownCodeBlockRenderer,
	installSkillInvocationRenderer,
	installUserMessageRenderer,
} from "./tool-renderer/messages.js";
import { settingBoolean } from "./tool-renderer/settings.js";
import { registerStackEvents } from "./tool-renderer/stack.js";
import { registerBash, registerEdit, registerRead, registerReadOnly, registerWrite } from "./tool-renderer/tools.js";

const INSTALL_SYMBOL = Symbol.for("pi-tool-renderer.installed");

export default async function toolRenderer(pi: ExtensionAPI): Promise<void> {
	const guard = pi as unknown as Record<PropertyKey, unknown>;
	if (guard[INSTALL_SYMBOL]) return;
	guard[INSTALL_SYMBOL] = true;
	if (!settingBoolean("enabled", true)) return;

	registerStackEvents(pi);
	installToolExecutionRendererPatch(pi);
	installToolChromePatch();
	registerToolChromeEvents(pi);
	installWorkingLoaderAlignmentPatch();
	installWorkingIndicator(pi);
	installMarkdownCodeBlockRenderer(pi);
	installCompactionSummaryRenderer(pi, CompactionSummaryMessageComponent);

	const agent = await import("@earendil-works/pi-coding-agent");
	installUserMessageRenderer(pi, agent.UserMessageComponent);
	installAssistantMessageRenderer(pi, agent.AssistantMessageComponent);
	installCustomMessageSpacingPatch(pi, (agent as any).CustomMessageComponent);
	installSkillInvocationRenderer(pi, (agent as any).SkillInvocationMessageComponent);

	registerRead(pi, agent);
	registerBash(pi, agent);
	if (settingBoolean("renderMutationTools", false)) {
		registerEdit(pi, agent);
		registerWrite(pi, agent);
	}
	registerReadOnly(pi, agent, "grep");
	registerReadOnly(pi, agent, "find");
	registerReadOnly(pi, agent, "ls");
	if (settingBoolean("registerBatchTool", true)) registerToolBatch(pi, agent);
}
