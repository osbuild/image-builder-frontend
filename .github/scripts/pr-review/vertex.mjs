/**
 * Thin wrapper around the Vertex AI rawPredict endpoint for Anthropic models.
 *
 * @param {object} options
 * @param {string} options.accessToken  — OAuth 2.0 access token from GCP auth
 * @param {string} options.projectId    — GCP project ID
 * @param {string} options.region       — Vertex AI region (e.g. us-east5)
 * @param {string} options.model        — Anthropic model ID
 * @param {string} options.system       — System prompt
 * @param {string} options.userMessage  — User message content
 * @param {number} [options.maxTokens]  — Max tokens to generate (default 4096)
 * @returns {Promise<string>} The text content of the response
 */
export async function createMessage({
  accessToken,
  projectId,
  region,
  model,
  system,
  userMessage,
  maxTokens = 4096,
}) {
  const url = [
    `https://${region}-aiplatform.googleapis.com/v1`,
    `/projects/${projectId}`,
    `/locations/${region}`,
    `/publishers/anthropic`,
    `/models/${model}:rawPredict`,
  ].join('');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      anthropic_version: 'vertex-2023-10-16',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Vertex AI error (${response.status}): ${body}`);
  }

  const data = await response.json();
  const text = data.content?.find((c) => c.type === 'text');

  if (!text) {
    throw new Error('No text content in Vertex AI response');
  }

  return text.text;
}
