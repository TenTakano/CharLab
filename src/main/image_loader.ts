import * as fs from "node:fs";

export async function loadFiles(folderPath: string): Promise<string[]> {
	try {
		const entries = await fs.promises.readdir(folderPath);
		const files = entries.filter((file) =>
			/\.(jpg|jpeg|png|gif|webp)$/i.test(file),
		);
		return files;
	} catch (error) {
		console.error(`Error reading folder "${folderPath}":`, error);
		throw error;
	}
}
