import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";

const userDataDir = app.getPath("userData");
const cacheDir = path.join(userDataDir, "image_cache");
if (!fsSync.existsSync(cacheDir)) {
	fsSync.mkdirSync(cacheDir, { recursive: true });
}

async function saveCachePersistent(origPath: string): Promise<string> {
	const fileName = path.basename(origPath);
	const { name, ext } = path.parse(fileName);
	let newName = name;
	const match = name.match(/^(\d+)(.*)$/);
	if (match) {
		const numberPart = match[1];
		newName = numberPart.padStart(4, "0");
	}
	const newFileName = `${newName}${ext}`;
	const outPath = path.join(cacheDir, newFileName);
	await fs.writeFile(outPath, await fs.readFile(origPath));
	return outPath;
}

export async function loadFiles(folderPath: string): Promise<string[]> {
	try {
		const entries = await fs.readdir(folderPath);
		const files = entries
			.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
			.map(async (file) => {
				const filePath = path.join(folderPath, file);
				return await saveCachePersistent(filePath);
			});
		return await Promise.all(files);
	} catch (error) {
		console.error(`Error reading folder "${folderPath}":`, error);
		throw error;
	}
}
