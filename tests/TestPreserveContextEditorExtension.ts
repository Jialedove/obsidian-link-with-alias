import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { getCompletedLinkAction, getQueryBeforeCursor, handleCompletedLinkAction, shouldHandleCompletedLinkAction } from "../src/PreserveContextEditorExtension";

describe("PreserveContextEditorExtension", () => {
	it("detects a completed plain link and selects the inserted display text", () => {
		const state = EditorState.create({
			doc: "[[Target]]",
			selection: { anchor: 10 },
		});

		expect(getCompletedLinkAction(state)).toEqual({
			type: "freeze",
			from: 0,
			to: 10,
			raw: "[[Target]]",
			replacement: "[[Target|Target]]",
			surfaceStart: 9,
			surfaceEnd: 15,
		});
	});

	it("keeps selected-text completion and requests an alias write", () => {
		const state = EditorState.create({
			doc: "[[Target|selected text]]",
			selection: { anchor: 24 },
		});

		expect(getCompletedLinkAction(state)).toEqual({
			type: "alias",
			target: "Target",
			surfaceText: "selected text",
		});
	});

	it("reads the typed alias query from the completion start state", () => {
		const state = EditorState.create({
			doc: "[[马",
			selection: { anchor: 3 },
		});

		expect(getQueryBeforeCursor(state)).toBe("马");
	});

	it("keeps an empty query so completing from bare brackets can be detected", () => {
		const state = EditorState.create({
			doc: "[[",
			selection: { anchor: 2 },
		});

		expect(getQueryBeforeCursor(state)).toBe("");
	});

	it("handles Obsidian link completion even without CodeMirror input.complete", () => {
		const before = EditorState.create({
			doc: "[[",
			selection: { anchor: 2 },
		});
		const after = EditorState.create({
			doc: "[[Target]]",
			selection: { anchor: 10 },
		});
		const query = getQueryBeforeCursor(before);
		const action = getCompletedLinkAction(after, query);

		expect(shouldHandleCompletedLinkAction(action, query, undefined)).toBe(true);
	});

	it("does not freeze a wikilink that was closed by normal typing", () => {
		const before = EditorState.create({
			doc: "[[Target",
			selection: { anchor: 8 },
		});
		const after = EditorState.create({
			doc: "[[Target]]",
			selection: { anchor: 10 },
		});
		const query = getQueryBeforeCursor(before);
		const action = getCompletedLinkAction(after, query);

		expect(shouldHandleCompletedLinkAction(action, query, "input.type")).toBe(false);
	});

	it("handles a manually typed display text as an alias write", () => {
		const before = EditorState.create({
			doc: "[[Target|Alias",
			selection: { anchor: 14 },
		});
		const after = EditorState.create({
			doc: "[[Target|Alias]]",
			selection: { anchor: 16 },
		});
		const query = getQueryBeforeCursor(before);
		const action = getCompletedLinkAction(after, query);

		expect(action).toEqual({
			type: "alias",
			target: "Target",
			surfaceText: "Alias",
		});
		expect(shouldHandleCompletedLinkAction(action, query, "input.type")).toBe(true);
	});

	it("schedules completed plain link freezing outside the editor update", () => {
		const scheduled: Array<() => void> = [];
		const plugin = {
			applyCompletedLinkFreeze: jest.fn(),
			addAliasForCompletedLink: jest.fn(),
		};
		const view = {
			state: {
				doc: {
					sliceString: jest.fn(() => "[[Target]]"),
				},
			},
		} as unknown as EditorView;

		handleCompletedLinkAction(
			plugin as never,
			view,
			{
				type: "freeze",
				from: 0,
				to: 10,
				raw: "[[Target]]",
				replacement: "[[Target|Target]]",
				surfaceStart: 9,
				surfaceEnd: 15,
			},
			(callback: () => void) => scheduled.push(callback),
		);

		expect(plugin.applyCompletedLinkFreeze).not.toHaveBeenCalled();
		expect(scheduled).toHaveLength(1);

		scheduled[0]();

		expect(plugin.applyCompletedLinkFreeze).toHaveBeenCalledWith(view, 0, 10, "[[Target|Target]]", 9, 15);
	});

	it("skips delayed plain link freezing when the completed link has changed", () => {
		const scheduled: Array<() => void> = [];
		const plugin = {
			applyCompletedLinkFreeze: jest.fn(),
			addAliasForCompletedLink: jest.fn(),
		};
		const view = {
			state: {
				doc: {
					sliceString: jest.fn(() => "[[Target|manual]]"),
				},
			},
		} as unknown as EditorView;

		handleCompletedLinkAction(
			plugin as never,
			view,
			{
				type: "freeze",
				from: 0,
				to: 10,
				raw: "[[Target]]",
				replacement: "[[Target|Target]]",
				surfaceStart: 9,
				surfaceEnd: 15,
			},
			(callback: () => void) => scheduled.push(callback),
		);

		scheduled[0]();

		expect(plugin.applyCompletedLinkFreeze).not.toHaveBeenCalled();
	});
});
