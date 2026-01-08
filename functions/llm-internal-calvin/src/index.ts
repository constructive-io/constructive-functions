import app from '@constructive-io/knative-job-fn';
import axios from 'axios';

app.post('/', async (req: any, res: any) => {
    console.log('[llm-internal-calvin] Request received');
    const { prompt } = req.body;
    const apiKey = process.env.CALVIN_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "Missing CALVIN_API_KEY" });

    try {
        // Mock internal call
        console.log(`Calling Calvin with prompt: ${prompt}`);
        // const response = await axios.post('http://calvin-ai-internal/generate', { prompt }, { headers: { 'Authorization': apiKey } });
        // return res.json(response.data);
        res.json({ result: `Calvin says: ${prompt}` });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

export default app;

if (require.main === module) {
    const port = Number(process.env.PORT ?? 8080);
    (app as any).listen(port, () => {
        console.log(`[llm-internal-calvin] listening on port ${port}`);
    });
}
