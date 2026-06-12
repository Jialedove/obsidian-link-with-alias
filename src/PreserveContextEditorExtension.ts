import { EditorState, Transaction } from "@codemirror/state";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

import type LinkWithAliasPlugin from "./main";
import { completePlainLink, getCompletedLinkAlias } from "./PreserveContext";

export function createPreserveContextEditorExtension(plugin: LinkWithAliasPlugin) {
	return ViewPlugin.fromClass(
		class {
			update(update: ViewUpdate) {
				if (!update.docChanged || plugin.isPreserveContextApplyingEditorChange()) {
					return;
				}
				const userEvent = update.transactions.map((tr) => tr.annotation(Transaction.userEvent)).find(Boolean);
				if (userEvent === "input.paste" || userEvent === "delete.selection") {
					return;
				}
				const query = getQueryBeforeCursor(update.startState);
				const action = getCompletedLinkAction(update.state, query);
				if (!shouldHandleCompletedLinkAction(action, query, userEvent)) {
					plugin.trackManualUnfreeze(update);
					return;
				}
				if (!action) {
					return;
				}
				handleCompletedLinkAction(plugin, update.view, action);
			}
		},
	);
}

interface FrozenLinkAction {
	type: "freeze";
	from: number;
	to: number;
	raw: string;
	replacement: string;
	surfaceStart: number;
	surfaceEnd: number;
}

interface AliasLinkAction {
	type: "alias";
	target: string;
	surfaceText: string;
}

export type CompletedLinkAction = FrozenLinkAction | AliasLinkAction;
type CompletedLinkScheduler = (callback: () => void) => void;

export function handleCompletedLinkAction(
	plugin: LinkWithAliasPlugin,
	view: EditorView,
	action: CompletedLinkAction,
	schedule: CompletedLinkScheduler = (callback) => {
		const win = view.dom.ownerDocument.defaultView || window;
		win.requestAnimationFrame(callback);
	},
): void {
	if (action.type === "alias") {
		plugin.addAliasForCompletedLink(action.target, action.surfaceText);
		return;
	}
	schedule(() => {
		if (view.state.doc.sliceString(action.from, action.to) !== action.raw) {
			return;
		}
		plugin.applyCompletedLinkFreeze(view, action.from, action.to, action.replacement, action.surfaceStart, action.surfaceEnd);
	});
}

export function shouldHandleCompletedLinkAction(
	action: CompletedLinkAction | undefined,
	query: string | undefined,
	userEvent: string | undefined,
): boolean {
	if (!action) {
		return false;
	}
	if (userEvent === "input.complete") {
		return true;
	}
	if (action.type === "alias") {
		return true;
	}
	if (userEvent?.startsWith("input.type")) {
		return false;
	}
	return query != null;
}

export function getCompletedLinkAction(state: EditorState, query?: string): CompletedLinkAction | undefined {
	const cursor = state.selection.main.head;
	const line = state.doc.lineAt(cursor);
	const localCursor = cursor - line.from;
	const before = line.text.lastIndexOf("[[", localCursor);
	if (before < 0) {
		return;
	}
	const after = line.text.indexOf("]]", before);
	if (after < 0 || after + 2 < localCursor) {
		return;
	}
	const raw = line.text.substring(before, after + 2);
	const from = line.from + before;
	const to = line.from + after + 2;
	const frozen = completePlainLink(raw, from, query);
	if (frozen) {
		return { type: "freeze", from, to, raw, ...frozen };
	}
	const alias = getCompletedLinkAlias(raw);
	if (alias) {
		return { type: "alias", ...alias };
	}
	return;
}

export function getQueryBeforeCursor(state: EditorState): string | undefined {
	const cursor = state.selection.main.head;
	const line = state.doc.lineAt(cursor);
	const localCursor = cursor - line.from;
	const beforeCursor = line.text.substring(0, localCursor);
	const open = beforeCursor.lastIndexOf("[[");
	if (open < 0) {
		return;
	}
	const query = beforeCursor.substring(open + 2);
	if (query.includes("]") || query.includes("|")) {
		return;
	}
	return query;
}
