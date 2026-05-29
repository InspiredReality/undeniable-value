module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;
  const llmBaseUrl = process.env.LLM_BASE_URL;

  if (llmBaseUrl) {
    // OpenAI-compatible API (Ollama, LM Studio, etc.)
    const allMessages = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await fetch(`${llmBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LLM_API_KEY || 'ollama'}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'llama3.2',
        max_tokens: 1024,
        messages: allMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.json({ text: data.choices[0].message.content });
  }

  // Anthropic API (default when LLM_BASE_URL is not set)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(response.status).json({ error: err });
  }

  const data = await response.json();
  res.json({ text: data.content[0].text });
};
