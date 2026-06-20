import type { Server } from 'http';

type StartedServer = {
  server: Server;
  url: string;
  close: () => Promise<void>;
};

export const startFunction = (
  modulePath: string,
  port: number
): Promise<StartedServer> => {
  delete require.cache[require.resolve(modulePath)];
  const mod = require(modulePath);
  const app = mod.default ?? mod;

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve({
        server,
        url: `http://localhost:${port}`,
        close: () =>
          new Promise<void>((r, rej) =>
            server.close((err?: Error | null) => (err ? rej(err) : r()))
          )
      });
    });
    server.on('error', reject);
  });
};
