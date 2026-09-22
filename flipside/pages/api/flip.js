// Flipside API route — returns structured results via a tool call,
// so the model never has to hand-write JSON (no more parse errors from quotes).

const TEXT_TOOL = {
  name: 'submit_flip',
  description: 'Submit the final Flipside analysis. Call this exactly once, after any web searches.',
  input_schema: {
    type: 'object',
    properties: {
      hasViewpoint: { type: 'boolean', description: 'True if the content expresses a viewpoint.' },
      claim: { type: 'string', description: 'One sentence stating the viewpoint.' },
      flip: { type: 'string', description: '3-4 paragraphs steelmanning the opposition as a thoughtful op-ed. Separate paragraphs with blank lines.' },
      sources: {
        type: 'array',
        description: 'Four real sources supporting the opposing view, found via web search.',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            outlet: { type: 'string' },
            description: { type: 'string', description: 'One sentence on relevance.' },
          },
          required: ['title', 'outlet', 'description'],
        },
      },
    },
    required: ['hasViewpoint'],
  },
};

const IMAGE_TOOL = {
  name: 'submit_visual_flip',
  description: 'Submit the visual analysis of the image.',
  input_schema: {
    type: 'object',
    properties: {
      visualSummary: { type: 'string', description: 'One sentence describing what this image shows.' },
      flipDescription: { type: 'string', description: 'One sentence describing the visual opposite of this image.' },
    },
    required: ['visualSummary', 'flipDescription'],
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { content, mode } = req.body;
  const isImage = mode === 'image';

  const system = isImage
    ? 'You are Flipside. The user submitted an image. Describe it and its visual opposite, then call submit_visual_flip.'
    : 'You are Flipside. Detect if the content expresses a viewpoint. If it does, use web search to find real sources, write a steelmanned counterargument, and call submit_flip with hasViewpoint true, the claim, the flip, and four sources. If it does not, call submit_flip with hasViewpoint false. Always finish by calling submit_flip.';

  const body = {
    model: 'claude-sonnet-5',
    max_tokens: 4000,
    thinking: { type: 'disabled' },
    system,
    messages: [{ role: 'user', content }],
  };

  if (isImage) {
    body.tools = [IMAGE_TOOL];
    body.tool_choice = { type: 'tool', name: 'submit_visual_flip' };
  } else {
    // "auto" (the default) lets Claude search first, then submit.
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }, TEXT_TOOL];
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

    const toolName = isImage ? 'submit_visual_flip' : 'submit_flip';
    const result = data.content.find(b => b.type === 'tool_use' && b.name === toolName);

    if (!result) {
      console.error('No submit tool call. stop_reason:', data.stop_reason);
      return res.status(500).json({ error: 'The analysis did not complete. Please try again.' });
    }

    res.status(200).json(result.input);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
