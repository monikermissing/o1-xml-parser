import { promises as fs } from "fs";
import { dirname, join } from "path";
import * as fsSync from "fs";

interface FileChange {
  file_summary: string;
  file_operation: string;
  file_path: string;
  file_code?: string;
}

export async function applyFileChanges(change: FileChange, projectDirectory: string) {
  const { file_operation, file_path, file_code } = change;
  const fullPath = join(projectDirectory, file_path);

  switch (file_operation.toUpperCase()) {
    case "CREATE":
      if (!file_code) {
        throw new Error(`No file_code provided for CREATE operation on ${file_path}`);
      }
      await ensureDirectoryExists(fullPath);
      await fs.writeFile(fullPath, file_code, "utf-8");
      break;

    case "UPDATE":
      if (!file_code) {
        throw new Error(`No file_code provided for UPDATE operation on ${file_path}`);
      }
      await ensureDirectoryExists(fullPath);
      await fs.writeFile(fullPath, file_code, "utf-8");
      break;

    case "DELETE":
      await fs.rm(fullPath, { force: true });
      break;

    default:
      console.warn(`Unknown file_operation: ${file_operation} for file: ${file_path}`);
      break;
  }
}

async function ensureDirectoryExists(filePath: string) {
  const dirPath = dirname(filePath);
  
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }
}
