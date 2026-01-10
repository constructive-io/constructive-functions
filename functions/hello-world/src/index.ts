import app from '@constructive-io/knative-job-fn';

app.post('/', (req: any, res: any) => {
  // eslint-disable-next-line no-console
  console.log('Hello World received', req.body);
  res.status(200).send('Hello World');
});

export default app;

if (require.main === module) {
  const port = Number(process.env.PORT ?? 8080);
  (app as any).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[hello-world] listening on port ${port}`);
  });
}
