import app from '@constructive-io/knative-job-fn';
import OpenAI from 'openai';

app.post('/', async (req: any, res: any) => {
    console.log('[llm-external] Request received');
    const { provider, prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    try {
        if (provider === 'openai') {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
            });
            return res.json({ result: completion.choices[0].message.content });
        } else {
            return res.status(400).json({ error: "Unsupported provider" });
        }
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

export default app;

if (require.main === module) {
    const port = Number(process.env.PORT ?? 8080);
    (app as any).listen(port, () => {
        console.log(`[llm-external] listening on port ${port}`);
    });
}
