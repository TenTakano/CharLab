import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";
import path from "node:path";
import { app } from "electron";
import sharp from "sharp";

const userDataDir = app.getPath("userData");
const cacheDir = path.join(userDataDir, "image_cache");
const resizedCacheDir = path.join(cacheDir, "resized");
if (!fsSync.existsSync(resizedCacheDir)) {
	fsSync.mkdirSync(resizedCacheDir, { recursive: true });
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
		const files = await fs.readdir(resizedCacheDir);
		const imageFiles = files
			.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
			.map((file) => path.join(resizedCacheDir, file));
		return imageFiles;
	} catch (error) {
		console.error(`Error reading cache directory "${resizedCacheDir}":`, error);
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

export async function cacheFiles(folderPath: string): Promise<void> {
	await clearCache();

	try {
		const entries = await fs.readdir(folderPath);
		const files = entries
			.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
			.map(async (file) => {
				const filePath = path.join(folderPath, file);
				return await saveCachePersistent(filePath);
			});
		await Promise.all(files);
	} catch (error) {
		console.error(`Error reading folder "${folderPath}":`, error);
		throw error;
	}
}

export async function generateResizedCache(
	maxWidth: number,
	maxHeight: number,
): Promise<void> {
	try {
		const files = (await fs.readdir(cacheDir)).filter((file) =>
			/\.(jpg|jpeg|png|gif|webp)$/i.test(file),
		);
		if (files.length === 0) return;

		await fs.rm(resizedCacheDir, { recursive: true, force: true });
		await fs.mkdir(resizedCacheDir, { recursive: true });

		for (const input of files) {
			const inputPath = path.join(cacheDir, input);
			const { name } = path.parse(input);
			const outputPath = path.join(
				resizedCacheDir,
				`${name}-${maxWidth}x${maxHeight}.png`,
			);

			await sharp(inputPath)
				.resize({ width: maxWidth, height: maxHeight, fit: "inside" })
				.toFile(outputPath);
		}
	} catch (error) {
		console.error("Error on creating resized images:", error);
		throw error;
	}
}
