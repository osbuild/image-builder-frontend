import { createMessage } from './vertex.mjs';
import { createGitHubClient } from './github.mjs';
import { parseDiffLines, isLineInDiff } from './diff.mjs';
import { REVIEWERS } from './reviewers.mjs';

// --- Configuration ---

const {
  GITHUB_TOKEN,
  VERTEX_ACCESS_TOKEN,
  VERTEX_PROJECT_ID,
  VERTEX_REGION = 'us-east5',
  VERTEX_MODEL = 'claude-sonnet-4-20250514',
  PR_NUMBER,
  REPO_FULL_NAME,
} = process.env;

const MAX_TOKENS = 4096;
const MAX_DIFF_CHARS = 100_000; // ~25k tokens — keeps prompt well within context window

// --- Validate environment ---

const required = {
  GITHUB_TOKEN,
  VERTEX_ACCESS_TOKEN,
  VERTEX_PROJECT_ID,
  PR_NUMBER,
  REPO_FULL_NAME,
};

for (const [name, value] of Object.entries(required)) {
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const prNumber = parseInt(PR_NUMBER, 10);
const github = createGitHubClient({
  token: GITHUB_TOKEN,
  repo: REPO_FULL_NAME,
  prNumber,
});

// --- Main ---

async function main() {
  console.log(`Reviewing ${REPO_FULL_NAME}#${prNumber}`);

  // 1. Fetch PR data from GitHub API
  console.log('Fetching PR diff and file list...');
  const [diff, files] = await Promise.all([
    github.getDiff(),
    github.getFiles(),
  ]);

  // 2. Guard rails — skip trivial or non-code PRs
  const codeExtensions = /\.(ts|tsx|js|jsx|mjs|cjs|css|scss)$/i;
  const codeFiles = files.filter((f) => codeExtensions.test(f.filename));

  if (codeFiles.length === 0) {
    console.log('No code files changed — skipping review.');
    return;
  }

  const totalChanges = files.reduce((sum, f) => sum + (f.changes || 0), 0);
  if (totalChanges < 5) {
    console.log(`Only ${totalChanges} line(s) changed — skipping review.`);
    return;
  }

  if (diff.length > MAX_DIFF_CHARS) {
    console.log(
      `Diff too large (${(diff.length / 1024).toFixed(0)}KB) — skipping review.`,
    );
    await github.upsertSummary(
      '⚠️ **PR Review skipped** — diff is too large for automated review.',
    );
    return;
  }

  // 3. Parse diff for finding validation
  const diffLines = parseDiffLines(diff);

  // 4. Build context for reviewers
  const fileList = files
    .map((f) => `${f.status}\t${f.filename}`)
    .join('\n');
  const task = buildTaskPrompt(fileList, diff);

  // 5. Run reviewers in parallel
  console.log(`Running ${REVIEWERS.length} reviewers...`);

  const results = await Promise.all(
    REVIEWERS.map(async (reviewer) => {
      console.log(`  Starting: ${reviewer.label}`);
      try {
        const response = await createMessage({
          accessToken: VERTEX_ACCESS_TOKEN,
          projectId: VERTEX_PROJECT_ID,
          region: VERTEX_REGION,
          model: VERTEX_MODEL,
          system: reviewer.systemPrompt,
          userMessage: task,
          maxTokens: MAX_TOKENS,
        });

        const findings = parseFindings(response, reviewer.name);
        console.log(`  ${reviewer.label}: ${findings.length} finding(s)`);
        return { reviewer: reviewer.name, label: reviewer.label, findings };
      } catch (err) {
        console.error(`  ${reviewer.label} failed: ${err.message}`);
        return {
          reviewer: reviewer.name,
          label: reviewer.label,
          findings: [],
          error: err.message,
        };
      }
    }),
  );

  // 6. Validate findings — drop anything outside the changeset
  const allFindings = results.flatMap((r) => r.findings);

  const validFindings = allFindings.filter((f) => {
    if (!f.file || !f.line) return true; // No location → goes to summary
    return isLineInDiff(diffLines, f.file, f.line);
  });

  const dropped = allFindings.length - validFindings.length;
  if (dropped > 0) {
    console.log(`Filtered ${dropped} finding(s) outside the changeset.`);
  }

  // 7. Split by severity
  const criticals = validFindings.filter((f) => f.severity === 'critical');
  const suggestions = validFindings.filter((f) => f.severity === 'suggestion');
  const positives = validFindings.filter((f) => f.severity === 'positive');
  const failedReviewers = results.filter((r) => r.error);

  // 8. Post inline review comments for criticals
  const inlineCriticals = criticals.filter((f) => f.file && f.line);

  if (inlineCriticals.length > 0) {
    try {
      await github.createReview(
        `🔴 **${inlineCriticals.length} critical issue(s) found**`,
        inlineCriticals.map((f) => ({
          file: f.file,
          line: f.line,
          body: `🔴 **Critical** _(${f.reviewer})_\n\n**${f.title}**\n\n${f.message}`,
        })),
      );
      console.log(`Posted ${inlineCriticals.length} inline comment(s).`);
    } catch (err) {
      // If inline comments fail (e.g. line not in diff), fall through to summary
      console.error(`Failed to post inline comments: ${err.message}`);
      criticals.push(
        ...inlineCriticals.filter((f) => !criticals.includes(f)),
      );
    }
  }

  // 9. Build and post summary comment
  const sections = [];

  if (criticals.length > 0) {
    const criticalLines = criticals.map((f) => {
      const loc = f.file ? ` \`${f.file}${f.line ? `:${f.line}` : ''}\`` : '';
      return `- **${f.title}**${loc} _(${f.reviewer})_\n  ${f.message}`;
    });

    if (inlineCriticals.length > 0) {
      sections.push(
        `## 🔴 Critical Issues\n\n${inlineCriticals.length} critical issue(s) posted as inline comments.\n`,
      );
    } else {
      sections.push(
        `## 🔴 Critical Issues\n\n${criticalLines.join('\n\n')}`,
      );
    }
  }

  if (suggestions.length > 0) {
    const suggestionLines = suggestions.map((f) => {
      const loc = f.file ? ` \`${f.file}${f.line ? `:${f.line}` : ''}\`` : '';
      return `- **${f.title}**${loc} _(${f.reviewer})_\n  ${f.message}`;
    });
    sections.push(`## 💡 Suggestions\n\n${suggestionLines.join('\n\n')}`);
  }

  if (positives.length > 0) {
    const positiveLines = positives.map((f) => {
      const loc = f.file ? ` \`${f.file}${f.line ? `:${f.line}` : ''}\`` : '';
      return `- **${f.title}**${loc} _(${f.reviewer})_\n  ${f.message}`;
    });
    sections.push(
      `## ✅ Positive Observations\n\n${positiveLines.join('\n\n')}`,
    );
  }

  if (failedReviewers.length > 0) {
    const errorLines = failedReviewers.map(
      (r) => `- **${r.label}**: ${r.error}`,
    );
    sections.push(`## ⚠️ Reviewer Errors\n\n${errorLines.join('\n')}`);
  }

  if (sections.length === 0) {
    sections.push(
      '## ✅ No Issues Found\n\nAll reviewers completed without findings.',
    );
  }

  await github.upsertSummary(sections.join('\n\n---\n\n'));
  console.log('Posted summary comment.');

  console.log(
    `Done: ${criticals.length} critical, ${suggestions.length} suggestion(s), ${positives.length} positive.`,
  );
}

// --- Helpers ---

function buildTaskPrompt(fileList, diff) {
  return `Review the following pull request changes.

## Scope

Your review MUST be scoped to the changeset only.

- ONLY review code that appears in the diff
- DO NOT flag pre-existing issues, patterns, or missing tests in unchanged code
- DO NOT suggest changes to files or lines not in the diff
- If you find zero issues in your area of expertise, return an empty findings array

## Changed files

${fileList}

## Diff

${diff}

## Output format

Respond with a JSON object only. No markdown, no explanation, no code fences.

{
  "findings": [
    {
      "severity": "critical | suggestion | positive",
      "file": "path/to/file.tsx",
      "line": 42,
      "title": "Short description",
      "message": "Detailed explanation with actionable feedback"
    }
  ]
}

Rules:
- "file" and "line" MUST reference lines visible in the diff above (the + side)
- "line" is the line number in the new version of the file
- "severity" must be exactly one of: "critical", "suggestion", "positive"
- If no issues found, return {"findings": []}`;
}

/**
 * Parse the JSON response from a reviewer into validated findings.
 *
 * @param {string} response   — Raw response text from the model
 * @param {string} reviewerName
 * @returns {{ severity: string, file: string|null, line: number|null, title: string, message: string, reviewer: string }[]}
 */
function parseFindings(response, reviewerName) {
  try {
    let json;

    try {
      json = JSON.parse(response);
    } catch {
      // Model may have wrapped JSON in markdown fences despite instructions
      const fenced = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenced) {
        json = JSON.parse(fenced[1]);
      } else {
        const raw = response.match(/\{[\s\S]*\}/);
        if (raw) {
          json = JSON.parse(raw[0]);
        } else {
          console.error(
            `Could not extract JSON from ${reviewerName} response`,
          );
          return [];
        }
      }
    }

    if (!Array.isArray(json.findings)) {
      console.error(`Invalid response structure from ${reviewerName}`);
      return [];
    }

    return json.findings.map((f) => ({
      severity: f.severity,
      file: f.file || null,
      line: f.line != null ? Number(f.line) : null,
      title: f.title || 'Untitled finding',
      message: f.message || '',
      reviewer: reviewerName,
    }));
  } catch (err) {
    console.error(`Failed to parse ${reviewerName} findings: ${err.message}`);
    return [];
  }
}

// --- Run ---

main().catch((err) => {
  console.error(`Review failed: ${err.message}`);
  process.exit(1);
});
