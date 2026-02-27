import { createPgpmFunctionServer } from '@constructive-io/fn-pgpm-runtime';
import handler from './handler';

const app = createPgpmFunctionServer(handler, { name: '{{name}}' });

export default app;

if (require.main === module) {
  app.listen(Number(process.env.PORT || 8080));
}
