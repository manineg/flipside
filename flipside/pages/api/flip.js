export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { content, mode } = req.body;
  const system = mode === 'image'
    ? 'You are Flipside. The user submitted an image. Describe in one vivid sentence what the visual opposite of this image would look like. Be specific and evocative. Respond ONLY in JSON: { "flipDescription": "..." }'
    : `You are Flipside. Detect if content expresses a viewpoint. If so, write a steelmanned counterargument and cite real supporting sources.
Respond ONLY in valid JSON, no markdown:
{
  "hasViewpoint": true,
  "claim": "One sentence stating the viewpoint",
  "flip": "3-4 paragraphs steelmanning the opposition as a thoughtful op-ed",
  "sources": [
    { "title": "...", "outlet": "...", "description": "One sentence on relevance" },
    { "title": "...", "outlet": "...", "description": "..." },
    { "title": "...", "outlet": "...", "description": "..." },
    { "title": "...", "outlet": "...", "description": "..." }
  ]
}
If no viewpoint: { "hasViewpoint": false }`;
  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system,
    messages: [{ role: 'user', content }],
  };
  if (mode === 'text') {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!data.content || !Array.isArray(data.content)) {
      return res.status(500).json({ error: data.error?.message || 'Unexpected API response' });
    }
    const raw = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
    if (!raw) return res.status(500).json({ error: 'No text response from API' });
    const parsed = JSON.parse(raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim());
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
