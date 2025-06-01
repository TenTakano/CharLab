import * as fs from "node:fs";
import path from "node:path";
import { app } from "electron";

const userDataDir = app.getPath("userData");
const cacheDir = path.join(userDataDir, "image_cache");
if (!fs.existsSync(cacheDir)) {
	fs.mkdirSync(cacheDir, { recursive: true });
}

function saveCachePersistent(origPath: string): string {
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
	fs.writeFileSync(outPath, fs.readFileSync(origPath));
	return newFileName;
}

export async function loadFiles(folderPath: string): Promise<string[]> {
	try {
		const entries = await fs.promises.readdir(folderPath);
		const files = entries
			.filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
			.map((file) => {
				const filePath = path.join(folderPath, file);
				return saveCachePersistent(filePath);
			});
		return files;
	} catch (error) {
		console.error(`Error reading folder "${folderPath}":`, error);
		throw error;
	}
}
