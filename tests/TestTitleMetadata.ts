import { addMissingAliasesIntoFile, syncTitleIntoFile } from "../src/InjectAlias";

describe("title metadata", () => {
	it("syncs frontmatter title to the renamed file basename", async () => {
		const frontmatter: Record<string, unknown> = { title: "Old title", aliases: ["Old title"] };
		const fileManager = {
			processFrontMatter: jest.fn(async (_file, callback) => {
				callback(frontmatter);
			}),
		};
		const file = { basename: "New title" };

		await syncTitleIntoFile(fileManager as never, file as never);

		expect(frontmatter).toEqual({ title: "New title", aliases: ["Old title"] });
		expect(fileManager.processFrontMatter).toHaveBeenCalledTimes(1);
	});

	it("keeps old title aliases while syncing the title", async () => {
		const frontmatter: Record<string, unknown> = { title: "Old title" };
		const fileManager = {
			processFrontMatter: jest.fn(async (_file, callback) => {
				callback(frontmatter);
			}),
		};
		const file = { basename: "New title" };

		await addMissingAliasesIntoFile(fileManager as never, file as never, ["Old title"]);
		await syncTitleIntoFile(fileManager as never, file as never);

		expect(frontmatter).toEqual({ title: "New title", aliases: ["Old title"] });
	});
});
