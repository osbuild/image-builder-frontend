/**
 * Parse a unified diff to extract which line numbers (in the new version of
 * each file) are visible in the diff.  This includes added lines, modified
 * lines, and context lines — anything GitHub would show in the diff view.
 *
 * @param {string} diff — Unified diff string
 * @returns {Map<string, Set<number>>} file path → set of visible line numbers
 */
export function parseDiffLines(diff) {
  /** @type {Map<string, Set<number>>} */
  const fileLines = new Map();
  let currentFile = null;
  let lineNumber = 0;

  for (const line of diff.split('\n')) {
    // New file header (+++ b/path/to/file)
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice(6);
      if (!fileLines.has(currentFile)) {
        fileLines.set(currentFile, new Set());
      }
      continue;
    }

    // Skip other diff meta lines
    if (
      line.startsWith('diff --git') ||
      line.startsWith('--- ') ||
      line.startsWith('index ')
    ) {
      continue;
    }

    // Hunk header — extract the starting line in the new file
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      lineNumber = parseInt(hunkMatch[1], 10);
      continue;
    }

    if (!currentFile) continue;

    const lines = fileLines.get(currentFile);

    if (line.startsWith(' ')) {
      // Context line (unchanged but visible in the diff)
      lines.add(lineNumber);
      lineNumber++;
    } else if (line.startsWith('+')) {
      // Added/modified line
      lines.add(lineNumber);
      lineNumber++;
    } else if (line.startsWith('-')) {
      // Removed line — exists only in old file, don't increment new line counter
    }
  }

  return fileLines;
}

/**
 * Check whether a file + line falls within the visible diff.
 *
 * @param {Map<string, Set<number>>} diffLines
 * @param {string} file
 * @param {number} line
 * @returns {boolean}
 */
export function isLineInDiff(diffLines, file, line) {
  const lines = diffLines.get(file);
  return lines != null && lines.has(line);
}
