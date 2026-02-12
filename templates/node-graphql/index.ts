import { createFunctionServer } from '@constructive-io/fn-runtime';
import handler from './handler';

const app = createFunctionServer(handler, { name: '{{name}}' });

export default app;

if (require.main === module) {
  app.listen(Number(process.env.PORT || 8080));
}
