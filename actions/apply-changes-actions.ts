"use server";

import { applyFileChanges } from "@/lib/apply-changes";
import { parseXmlString } from "@/lib/xml-parser";
import path from "path";
import { ActionState } from "@/types";

export async function applyChangesAction(xmlContent: string): Promise<ActionState<void>> {
  try {
    console.log("Starting XML processing"); // Debug log
    
    const projectDir = process.env.PROJECT_DIRECTORY;
    if (!projectDir) {
      console.error("No project directory specified"); // Debug log
      return {
        isSuccess: false,
        message: "No project directory specified in environment variables"
      };
    }

    console.log("Project directory:", projectDir); // Debug log

    // Normalize the project directory path
    const normalizedProjectDir = path.normalize(projectDir);
    console.log("Normalized project directory:", normalizedProjectDir); // Debug log
    
    const changes = await parseXmlString(xmlContent);
    console.log("Parsed changes:", changes); // Debug log
    
    if (!changes || !Array.isArray(changes)) {
      console.error("Invalid changes format:", changes); // Debug log
      return {
        isSuccess: false,
        message: "Invalid XML format. Could not parse changes."
      };
    }

    // Apply each change individually
    for (const change of changes) {
      console.log("Applying change:", change); // Debug log
      await applyFileChanges(change, normalizedProjectDir);
    }

    return {
      isSuccess: true,
      message: "Changes applied successfully"
    };
  } catch (error) {
    console.error("Error in applyChangesAction:", error);
    return {
      isSuccess: false,
      message: `Error applying changes: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
