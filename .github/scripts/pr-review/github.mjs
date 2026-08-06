const COMMENT_MARKER = '<!-- pr-review -->';

/**
 * @param {object} options
 * @param {string} options.token    — GitHub token
 * @param {string} options.repo     — "owner/repo"
 * @param {number} options.prNumber
 */
export function createGitHubClient({ token, repo, prNumber }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  async function request(method, path, body, extraHeaders) {
    const response = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        ...headers,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...extraHeaders,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub ${method} ${path} (${response.status}): ${error}`);
    }

    return response.status === 204 ? null : response.json();
  }

  return {
    /** Fetch the PR diff as a unified diff string. */
    async getDiff() {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/pulls/${prNumber}`,
        {
          headers: { ...headers, Accept: 'application/vnd.github.diff' },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch PR diff: ${response.status}`);
      }

      return response.text();
    },

    /** Fetch the list of changed files (handles pagination). */
    async getFiles() {
      const files = [];
      let page = 1;

      while (true) {
        const batch = await request(
          'GET',
          `/repos/${repo}/pulls/${prNumber}/files?per_page=100&page=${page}`,
        );
        files.push(...batch);
        if (batch.length < 100) break;
        page++;
      }

      return files;
    },

    /**
     * Create a PR review with inline comments.
     *
     * @param {string} body            — Review summary body
     * @param {{ file: string, line: number, body: string }[]} comments
     */
    async createReview(body, comments) {
      return request('POST', `/repos/${repo}/pulls/${prNumber}/reviews`, {
        body,
        event: 'COMMENT',
        comments: comments.map((c) => ({
          path: c.file,
          line: c.line,
          side: 'RIGHT',
          body: c.body,
        })),
      });
    },

    /**
     * Create or update the summary comment (keyed by hidden marker).
     *
     * @param {string} body — Markdown comment body
     */
    async upsertSummary(body) {
      const markedBody = `${COMMENT_MARKER}\n${body}`;

      // Look for an existing comment from a previous run
      const comments = await request(
        'GET',
        `/repos/${repo}/issues/${prNumber}/comments?per_page=100`,
      );

      const existing = comments.find((c) => c.body.includes(COMMENT_MARKER));

      if (existing) {
        return request(
          'PATCH',
          `/repos/${repo}/issues/comments/${existing.id}`,
          { body: markedBody },
        );
      }

      return request('POST', `/repos/${repo}/issues/${prNumber}/comments`, {
        body: markedBody,
      });
    },
  };
}
