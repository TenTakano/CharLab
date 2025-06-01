import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";

const userDataDir = app.getPath("userData");
const cacheDir = path.join(userDataDir, "image_cache");
if (!fsSync.existsSync(cacheDir)) {
	fsSync.mkdirSync(cacheDir, { recursive: true });
}

export async function clearCache(): Promise<void> {
	try {
		const files = await fs.readdir(cacheDir);
		await Promise.all(
			files.map((file) =>
				fs.rm(path.join(cacheDir, file), { recursive: true, force: true }),
			),
		);
	} catch (error) {
		console.error(`Error clearing cache directory "${cacheDir}":`, error);
		throw error;
	}
}

export async function loadCachedImages(): Promise<string[]> {
	try {
		const files = await fs.readdir(cacheDir);
		const imageFiles = files
			.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
			.map((file) => path.join(cacheDir, file));
		return imageFiles;
	} catch (error) {
		console.error(`Error reading cache directory "${cacheDir}":`, error);
		throw error;
	}
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
	await clearCache();

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
