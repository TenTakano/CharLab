import * as fs from "node:fs";

export async function loadFiles(folderPath: string): Promise<string[]> {
	try {
		const entries = await fs.promises.readdir(folderPath);
		return entries;
	} catch (error) {
		console.error(`Error reading folder "${folderPath}":`, error);
		throw error;
	}
}
