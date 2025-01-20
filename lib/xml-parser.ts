import { DOMParser } from "@xmldom/xmldom";

interface FileChange {
  file_summary: string;
  file_operation: string;
  file_path: string;
  file_code?: string;
}

export async function parseXmlString(xmlContent: string): Promise<FileChange[]> {
  try {
    // Clean up the XML content
    const cleanXml = xmlContent
      .replace(/```xml\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    console.log("=== XML Parsing Debug ===");
    console.log("Input length:", xmlContent.length);
    console.log("Cleaned length:", cleanXml.length);

    const parser = new DOMParser({
      onError: (error: Error) => {
        console.error('XML Parser Error:', error);
      }
    });

    const doc = parser.parseFromString(cleanXml, "text/xml");
    
    // Get all file nodes
    const changedFiles = doc.getElementsByTagName("changed_files")[0];
    if (!changedFiles) {
      console.error("No changed_files element found");
      return [];
    }

    const fileNodes = changedFiles.getElementsByTagName("file");
    console.log("Found file nodes:", fileNodes.length);

    const changes: FileChange[] = [];

    for (let i = 0; i < fileNodes.length; i++) {
      const fileNode = fileNodes[i];
      
      const summary = fileNode.getElementsByTagName("file_summary")[0]?.textContent;
      const operation = fileNode.getElementsByTagName("file_operation")[0]?.textContent;
      const path = fileNode.getElementsByTagName("file_path")[0]?.textContent;
      const codeNode = fileNode.getElementsByTagName("file_code")[0];
      
      console.log(`Processing file ${i + 1}:`, { summary, operation, path });

      if (!summary || !operation || !path) {
        console.error(`Missing required fields for file ${i + 1}`);
        continue;
      }

      // Extract CDATA content
      let code;
      if (codeNode) {
        const cdataNode = Array.from(codeNode.childNodes).find(node => node.nodeType === 4); // 4 is CDATA_SECTION_NODE
        code = cdataNode ? cdataNode.nodeValue : codeNode.textContent;
      }

      changes.push({
        file_summary: summary.trim(),
        file_operation: operation.trim(),
        file_path: path.trim(),
        file_code: code ? code.trim() : undefined
      });
    }

    console.log("Parsed changes:", changes);
    return changes;
  } catch (error) {
    console.error("XML Parsing error:", error);
    throw error;
  }
}
