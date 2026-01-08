import app from '@constructive-io/knative-job-fn';
import puppeteer from 'puppeteer';

app.post('/', async (req: any, res: any) => {
    console.log('[opencode-headless] Request received');
    const { url } = req.body;

    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url || 'https://example.com');
        const title = await page.title();
        await browser.close();

        res.json({ title });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

export default app;

if (require.main === module) {
    const port = Number(process.env.PORT ?? 8080);
    (app as any).listen(port, () => {
        console.log(`[opencode-headless] listening on port ${port}`);
    });
}
