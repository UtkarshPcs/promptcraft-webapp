export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, systemPrompt } = req.body;
    if (!messages || !systemPrompt) {
        return res.status(400).json({ error: 'Missing messages or systemPrompt' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'Target API key not configured on server' });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "qwen/qwen3-32b",
                max_tokens: 1500,
                temperature: 0.6,
                top_p: 0.95,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages,
                ],
            }),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (err) {
        console.error("API error:", err);
        return res.status(500).json({ error: 'Failed to communicate with external API' });
    }
}
